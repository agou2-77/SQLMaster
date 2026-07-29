// Domain types for the guided "mastery journey": ordered syntax modules that a
// learner practices with small drills, then proves with a short gate quiz,
// before moving on to the existing full problems/paths (the "comprehensive
// tests"). A drill and a quiz question are ordinary `Problem`s so they reuse the
// entire grading pipeline (usePglite + compareResults) unchanged.

import type { Problem, Topic } from "@/lib/problems/types";

export interface Module {
  /** Stable slug, e.g. "select-basics". */
  id: string;
  title: string;
  /** Curriculum position (1-based). Drives ordering and "recommended next". */
  order: number;
  /** One-liner shown on the overview card. */
  summary: string;
  /** Topic tags this module teaches (align with Problem.topics). */
  topics: Topic[];
  /** Cheatsheet section anchor for "Learn the concept" → /cheatsheet#<anchor>. */
  cheatsheetAnchor: string;
  /** Focused, single-concept practice problems. */
  drills: Problem[];
  /** Gate quiz questions (also full Problems). */
  quiz: Problem[];
  /** Passing this many quiz questions masters the module. */
  quizPassThreshold: number;
  /** Existing problem ids this module prepares the learner for. */
  comprehensiveProblemIds: string[];
  /** Existing learning-path ids this module prepares the learner for. */
  comprehensivePathIds?: string[];
  /** "stub" modules render as "coming soon" (no drills/quiz authored yet). */
  status: "authored" | "stub";
}

/** Derived, non-persisted display state for a module. */
export type ModuleState = "not-started" | "practicing" | "mastered";
