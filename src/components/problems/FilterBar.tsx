"use client";

import { DIFFICULTIES, TOPICS, type Difficulty, type Topic } from "@/lib/problems/types";

export type DifficultyFilter = "all" | Difficulty;
export type TopicFilter = "all" | Topic;
export type StatusFilter = "all" | "todo" | "attempted" | "solved";

export interface Filters {
  search: string;
  difficulty: DifficultyFilter;
  topic: TopicFilter;
  status: StatusFilter;
}

export const DEFAULT_FILTERS: Filters = {
  search: "",
  difficulty: "all",
  topic: "all",
  status: "all",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const selectClass =
  "rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700";

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        placeholder="Search problems…"
        className="flex-1 rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
      />
      <select
        value={filters.difficulty}
        onChange={(e) => set("difficulty", e.target.value as DifficultyFilter)}
        className={selectClass}
        aria-label="Filter by difficulty"
      >
        <option value="all">All difficulties</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d[0].toUpperCase() + d.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={filters.topic}
        onChange={(e) => set("topic", e.target.value as TopicFilter)}
        className={selectClass}
        aria-label="Filter by topic"
      >
        <option value="all">All topics</option>
        {TOPICS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value as StatusFilter)}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="todo">Todo</option>
        <option value="attempted">Attempted</option>
        <option value="solved">Solved</option>
      </select>
    </div>
  );
}
