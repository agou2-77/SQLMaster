"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamTutor } from "@/lib/tutor/client";
import type { TutorMode } from "@/lib/tutor/prompts";

interface TutorPanelProps {
  problemTitle: string;
  problemDescription: string;
  schemaText: string;
  userSql: string;
  resultSummary?: string;
}

type ChatMode = Exclude<TutorMode, "generate-problem">;
type Turn = { role: "user" | "assistant"; content: string };

const MODES: { mode: ChatMode; label: string }[] = [
  { mode: "hint", label: "Give me a hint" },
  { mode: "explain-error", label: "Explain the error" },
  { mode: "review-query", label: "Review my query" },
];

const REVEAL_PROMPT =
  "Please answer the question you just asked and show me the full solution, explaining the reasoning.";

export function TutorPanel({
  problemTitle,
  problemDescription,
  schemaText,
  userSql,
  resultSummary,
}: TutorPanelProps) {
  // The active conversation: which mode opened it, the visible turns so far,
  // and the assistant text currently streaming in.
  const [mode, setMode] = useState<ChatMode | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followup, setFollowup] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight stream when the component unmounts (e.g. problem switch).
  useEffect(() => () => abortRef.current?.abort(), []);

  // Stream one assistant reply given the conversation to send. On success the
  // completed reply is appended to `turns`.
  const run = useCallback(
    async (activeMode: ChatMode, convo: Turn[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setError(null);
      setStreaming(true);
      setStreamingText("");
      let acc = "";
      try {
        await streamTutor(
          {
            mode: activeMode,
            problemTitle,
            problemDescription,
            schema: schemaText,
            userSql,
            resultSummary,
            messages: convo,
          },
          (delta) => {
            acc += delta;
            setStreamingText(acc);
          },
          controller.signal,
        );
        if (abortRef.current === controller) {
          setTurns((prev) => [...prev, { role: "assistant", content: acc }]);
          setStreamingText("");
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        if (abortRef.current === controller) setStreaming(false);
      }
    },
    [problemTitle, problemDescription, schemaText, userSql, resultSummary],
  );

  // Start a fresh conversation from one of the mode buttons.
  const start = useCallback(
    (m: ChatMode) => {
      setMode(m);
      setTurns([]);
      setFollowup("");
      void run(m, []);
    },
    [run],
  );

  // Send a follow-up message in the current conversation.
  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !mode || streaming) return;
      const convo: Turn[] = [...turns, { role: "user", content: trimmed }];
      setTurns(convo);
      setFollowup("");
      void run(mode, convo);
    },
    [mode, streaming, turns, run],
  );

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        AI tutor
      </h2>
      <div className="flex flex-wrap gap-2">
        {MODES.map(({ mode: m, label }) => (
          <button
            key={m}
            type="button"
            onClick={() => start(m)}
            disabled={streaming}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {(turns.length > 0 || streaming) && (
        <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1 text-sm leading-relaxed">
          {turns.map((turn, i) =>
            turn.role === "assistant" ? (
              <div key={i} className="markdown space-y-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {turn.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p
                key={i}
                className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                <span className="font-medium">You: </span>
                {turn.content}
              </p>
            ),
          )}
          {streaming && (
            <div className="markdown space-y-2">
              {streamingText ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingText}
                </ReactMarkdown>
              ) : (
                <p className="text-neutral-500">Thinking…</p>
              )}
            </div>
          )}
        </div>
      )}

      {mode && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(followup);
                }
              }}
              disabled={streaming}
              placeholder="Ask a follow-up…"
              className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-neutral-400 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-600"
            />
            <button
              type="button"
              onClick={() => send(followup)}
              disabled={streaming || !followup.trim()}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Send
            </button>
          </div>
          <button
            type="button"
            onClick={() => send(REVEAL_PROMPT)}
            disabled={streaming}
            className="self-start text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-700 disabled:opacity-50 dark:hover:text-neutral-300"
          >
            Show me the answer
          </button>
        </div>
      )}
    </div>
  );
}
