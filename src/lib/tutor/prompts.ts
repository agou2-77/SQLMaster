import { z } from "zod";

export type TutorMode = "hint" | "explain-error" | "review-query" | "generate-problem";

// Validated shape of a POST /api/tutor request body.
export const tutorRequestSchema = z.object({
  mode: z.enum(["hint", "explain-error", "review-query", "generate-problem"]),
  problemTitle: z.string().max(300),
  problemDescription: z.string().max(8000),
  schema: z.string().max(8000),
  userSql: z.string().max(8000).default(""),
  // Error text or a result/validation summary — never the expected rows.
  resultSummary: z.string().max(4000).optional(),
  // Free-form request used by generate-problem.
  topic: z.string().max(300).optional(),
  // Follow-up conversation turns after the initial auto-generated context.
  // Empty on the first request; grows as the learner asks follow-ups.
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .max(20)
    .default([]),
});

export type TutorRequest = z.infer<typeof tutorRequestSchema>;
// Input shape for callers: fields with schema defaults (e.g. `messages`) are optional.
export type TutorRequestInput = z.input<typeof tutorRequestSchema>;

const TUTOR_PERSONA = `You are a friendly, encouraging SQL tutor embedded in a practice app (like LeetCode for SQL).
The learner writes PostgreSQL. Your job is to help them *learn*, not to hand over answers.
- Guide with leading questions and point at the specific clause or concept to reconsider.
- Reference the actual table and column names from the provided schema.
- Keep responses short (a few sentences). Use a friendly tone.
- Do NOT output a complete, runnable solution query unless the learner explicitly asks for the full answer.`;

export function buildSystemPrompt(mode: TutorMode): string {
  switch (mode) {
    case "hint":
      return `${TUTOR_PERSONA}
The learner wants a hint. Give ONE small nudge toward the next step — the least help that unblocks them. Never write the full query.`;
    case "explain-error":
      return `${TUTOR_PERSONA}
The learner's query produced a database error. Translate the error into plain language, name the most likely cause, and point to the part of their query to fix. Do not rewrite the whole query for them unless they explicitly ask for the full answer in a follow-up.`;
    case "review-query":
      return `${TUTOR_PERSONA}
Review the learner's query for correctness and style. If it is wrong, explain what's off conceptually (without pasting a corrected query up front). If it is correct, affirm it and suggest at most one improvement. If the learner then explicitly asks for the full answer or the reasoning behind your question, give it to them clearly.`;
    case "generate-problem":
      return `You generate SQL practice problems for a PostgreSQL learning app.
Return ONLY minified JSON (no markdown, no prose) matching this TypeScript type:
{ "id": string (kebab-case slug), "title": string, "difficulty": "easy"|"medium"|"hard",
  "topics": string[], "description": string (markdown), "setupSql": string (CREATE TABLE + 5-15 INSERT rows),
  "solutionSql": string (a single correct SELECT), "hints": string[] (2-3 progressive hints),
  "ordered": boolean (true only if the prompt requires a specific row order) }
The setupSql and solutionSql must be valid PostgreSQL and the solution must actually answer the description.`;
  }
}

export function buildUserContext(req: TutorRequest): string {
  if (req.mode === "generate-problem") {
    return `Create a new practice problem${req.topic ? ` about: ${req.topic}` : ""}. Keep the dataset small and self-contained.`;
  }

  const parts = [
    `PROBLEM: ${req.problemTitle}`,
    `\nDESCRIPTION:\n${req.problemDescription}`,
    `\nSCHEMA:\n${req.schema}`,
    `\nLEARNER'S CURRENT QUERY:\n${req.userSql || "(empty)"}`,
  ];
  if (req.resultSummary) {
    parts.push(`\nWHAT HAPPENED WHEN THEY RAN IT:\n${req.resultSummary}`);
  }
  return parts.join("\n");
}
