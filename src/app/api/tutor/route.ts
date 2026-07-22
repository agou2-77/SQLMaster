import {
  tutorRequestSchema,
  buildSystemPrompt,
  buildUserContext,
} from "@/lib/tutor/prompts";

// Streaming fetch against IBM Consulting Advantage needs the Node runtime;
// never cache tutor responses.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// IBM ICA is OpenAI-compatible; models are named differently than Anthropic's
// public API, so the IDs are supplied via env rather than hardcoded.
const FLAGSHIP_MODEL = process.env.ICA_MODEL;
const LIGHTWEIGHT_MODEL = process.env.ICA_MODEL_LIGHT ?? FLAGSHIP_MODEL;

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ICA_API_KEY;
  const baseUrl = process.env.ICA_BASE_URL;
  if (!apiKey || !baseUrl || !FLAGSHIP_MODEL) {
    return new Response(
      "AI tutor is not configured. Add ICA_API_KEY, ICA_BASE_URL, and ICA_MODEL to .env.local and restart the dev server.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const parsed = tutorRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Invalid request.", { status: 400 });
  }
  const body = parsed.data;

  // Cheap, fast model for one-off hints; the flagship for reasoning-heavy modes.
  const model = body.mode === "hint" ? LIGHTWEIGHT_MODEL : FLAGSHIP_MODEL;

  const url = `${baseUrl.replace(/\/$/, "")}/chat-models/chat/completions`;
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ICA uses an OpenAI-style bearer token, not Anthropic's x-api-key.
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      stream: true,
      messages: [
        { role: "system", content: buildSystemPrompt(body.mode) },
        // The initial auto-generated context is the first user turn; any
        // follow-up turns from the learner continue the same conversation.
        { role: "user", content: buildUserContext(body) },
        ...body.messages,
      ],
    }),
  };

  // A single transient network blip against the beta ICA endpoint shouldn't
  // surface to the learner — retry once (only when fetch itself rejected, so no
  // response body is ever consumed twice), each attempt bounded by a timeout.
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

  // Translate the upstream OpenAI SSE stream into the plain-text delta stream
  // the client (src/lib/tutor/client.ts) expects.
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
              const json = JSON.parse(data);
              const text: unknown = json?.choices?.[0]?.delta?.content;
              if (typeof text === "string" && text) {
                controller.enqueue(encoder.encode(text));
              }
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
