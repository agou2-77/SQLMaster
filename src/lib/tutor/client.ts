import type { TutorRequestInput } from "@/lib/tutor/prompts";

/**
 * POST to the tutor route and invoke `onDelta` with each streamed text chunk.
 * Throws (with the server's message) on a non-OK response; respects `signal`.
 */
export async function streamTutor(
  payload: TutorRequestInput,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Tutor request failed (${res.status}).`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    onDelta(decoder.decode(value, { stream: true }));
  }
}
