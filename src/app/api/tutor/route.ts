import {
  tutorRequestSchema,
  buildSystemPrompt,
  buildUserContext,
  type TutorMode,
} from "@/lib/tutor/prompts";

// Streaming fetch to the LLM provider needs the Node runtime; never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Provider-agnostic config. "openai" works with any OpenAI-compatible
// /chat/completions endpoint; "anthropic" targets the Messages API.
const PROVIDER = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
const FLAGSHIP_MODEL = process.env.LLM_MODEL;
const LIGHTWEIGHT_MODEL = process.env.LLM_MODEL_LIGHT ?? FLAGSHIP_MODEL;

type Turn = { role: "user" | "assistant"; content: string };

// Build the (url, init) for an OpenAI-compatible chat/completions request.
function buildOpenAiRequest(
  baseUrl: string,
  apiKey: string,
  model: string,
  mode: TutorMode,
  context: string,
  history: Turn[],
): { url: string; init: RequestInit } {
  return {
    url: `${baseUrl.replace(/\/$/, "")}/chat/completions`,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        stream: true,
        messages: [
          { role: "system", content: buildSystemPrompt(mode) },
          { role: "user", content: context },
          ...history,
        ],
      }),
    },
  };
}

// Build the (url, init) for an Anthropic Messages API request. Anthropic takes
// the system prompt as a top-level field, not as a message.
function buildAnthropicRequest(
  baseUrl: string,
  apiKey: string,
  model: string,
  mode: TutorMode,
  context: string,
  history: Turn[],
): { url: string; init: RequestInit } {
  return {
    url: `${baseUrl.replace(/\/$/, "")}/messages`,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        stream: true,
        system: buildSystemPrompt(mode),
        messages: [{ role: "user", content: context }, ...history],
      }),
    },
  };
}

// Extract the text delta from one parsed SSE `data:` payload, per provider.
function extractDelta(json: unknown): string | null {
  const obj = json as Record<string, unknown>;
  if (PROVIDER === "anthropic") {
    // { type: "content_block_delta", delta: { type: "text_delta", text } }
    const delta = obj?.delta as { type?: string; text?: unknown } | undefined;
    if (delta?.type === "text_delta" && typeof delta.text === "string") {
      return delta.text;
    }
    return null;
  }
  // OpenAI: { choices: [{ delta: { content } }] }
  const choices = obj?.choices as Array<{ delta?: { content?: unknown } }> | undefined;
  const content = choices?.[0]?.delta?.content;
  return typeof content === "string" ? content : null;
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL;
  if (!apiKey || !baseUrl || !FLAGSHIP_MODEL) {
    return new Response(
      "AI tutor is not configured. Add LLM_API_KEY, LLM_BASE_URL, and LLM_MODEL to .env.local and restart the dev server.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const parsed = tutorRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Invalid request.", { status: 400 });
  }
  const body = parsed.data;

  // Cheap, fast model for one-off hints; the flagship for reasoning-heavy modes.
  // FLAGSHIP_MODEL is guaranteed defined by the guard above.
  const model: string =
    body.mode === "hint" ? LIGHTWEIGHT_MODEL ?? FLAGSHIP_MODEL : FLAGSHIP_MODEL;
  const context = buildUserContext(body);

  const { url, init } =
    PROVIDER === "anthropic"
      ? buildAnthropicRequest(baseUrl, apiKey, model, body.mode, context, body.messages)
      : buildOpenAiRequest(baseUrl, apiKey, model, body.mode, context, body.messages);

  // A single transient network blip shouldn't surface to the learner — retry
  // once (only when fetch itself rejected, so no response body is consumed
  // twice), each attempt bounded by a timeout.
  let upstream: Response | Error = new Error("fetch failed");
  for (let attempt = 1; attempt <= 2; attempt++) {
    upstream = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(30_000),
    }).catch((err: unknown) => (err instanceof Error ? err : new Error("fetch failed")));
    if (!(upstream instanceof Error)) break;
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (upstream instanceof Error) {
    // Node's generic "fetch failed" hides the real reason in err.cause (e.g.
    // ECONNRESET, ETIMEDOUT) — surface it so failures are diagnosable.
    const cause = (upstream as { cause?: unknown }).cause;
    const detail = cause instanceof Error ? `: ${cause.message}` : "";
    return new Response(`[tutor error: ${upstream.message}${detail}]`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return new Response(`[tutor error: ${upstream.status} ${detail}]`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  // Translate the upstream SSE stream into the plain-text delta stream the
  // client (src/lib/tutor/client.ts) expects. Both providers use `data:` lines;
  // OpenAI terminates with `data: [DONE]`, Anthropic simply ends the stream.
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        outer: for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last (possibly partial) line for the next chunk.
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") break outer;
            try {
              const text = extractDelta(JSON.parse(data));
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // Ignore keep-alive comments and non-JSON lines.
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "tutor stream failed";
        controller.enqueue(encoder.encode(`\n\n[tutor error: ${message}]`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
