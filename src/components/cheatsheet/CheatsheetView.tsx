"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface CheatsheetViewProps {
  content: string;
}

interface Section {
  id: string; // reused from the source `<a name="...">` anchor
  title: string; // e.g. "3. SELECT — the basics"
  body: string;
}

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

// Split the markdown into a preamble + one entry per top-level section. Sections
// in the source are marked by an `<a name="id"></a>` anchor immediately followed
// by a `## ` heading; we reuse that anchor as the section's stable id so existing
// deep links (and the sidebar) keep working.
function parseSections(content: string): { preamble: string; sections: Section[] } {
  const parts = content.split(/\n(?=<a name="[^"]+"><\/a>\n## )/);
  const preamble = parts[0].trim();
  const sections: Section[] = [];
  for (const part of parts.slice(1)) {
    const idMatch = part.match(/^<a name="([^"]+)"><\/a>/);
    const titleMatch = part.match(/^## (.+)$/m);
    if (!idMatch || !titleMatch) continue;
    const body = part
      .replace(/^<a name="[^"]+"><\/a>\n/, "")
      .replace(/^## .+\n/, "")
      .replace(/\n?---\s*$/, "")
      .trim();
    sections.push({ id: idMatch[1], title: titleMatch[1].trim(), body });
  }
  return { preamble, sections };
}

export function CheatsheetView({ content }: CheatsheetViewProps) {
  const { preamble, sections } = useMemo(() => parseSections(content), [content]);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(sections.length ? [sections[0].id] : []),
  );
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");
  const pendingScroll = useRef<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openAndScroll = useCallback((id: string) => {
    setExpanded((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    setActive(id);
    pendingScroll.current = id;
  }, []);

  const expandAll = useCallback(
    () => setExpanded(new Set(sections.map((s) => s.id))),
    [sections],
  );
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  // Scroll to a section once it has been expanded and rendered.
  useEffect(() => {
    if (!pendingScroll.current) return;
    const id = pendingScroll.current;
    pendingScroll.current = null;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Deep links: open + scroll to the section named in the URL hash, both on mount
  // and when an in-page anchor (e.g. the dialect link) changes the hash.
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (id && sections.some((s) => s.id === id)) openAndScroll(id);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [sections, openAndScroll]);

  // Highlight the section nearest the top of the viewport in the sidebar.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  const navList = (
    <ul className="space-y-0.5">
      {sections.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => openAndScroll(s.id)}
            title={s.title}
            className={`block w-full truncate rounded px-2 py-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              active === s.id
                ? "bg-neutral-100 font-medium text-emerald-700 dark:bg-neutral-800 dark:text-emerald-400"
                : "text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {s.title}
          </button>
        </li>
      ))}
    </ul>
  );

  const bulkControls = (
    <div className="mb-2 flex gap-2 px-2">
      <button type="button" onClick={expandAll} className="text-xs text-emerald-600 hover:underline">
        Expand all
      </button>
      <span className="text-xs text-neutral-400">·</span>
      <button type="button" onClick={collapseAll} className="text-xs text-emerald-600 hover:underline">
        Collapse all
      </button>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto pr-2">
          {bulkControls}
          {navList}
        </div>
      </aside>

      {/* Content column */}
      <div className="min-w-0">
        <div className="markdown text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
            {preamble}
          </ReactMarkdown>
        </div>

        {/* Section nav (mobile) */}
        <details className="my-4 rounded-lg border border-neutral-200 lg:hidden dark:border-neutral-800">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium">Jump to section</summary>
          <div className="border-t border-neutral-200 p-2 dark:border-neutral-800">
            {bulkControls}
            {navList}
          </div>
        </details>

        {/* Collapsible sections */}
        <div className="mt-2 space-y-2">
          {sections.map((s) => {
            const isOpen = expanded.has(s.id);
            return (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-4 rounded-lg border border-neutral-200 dark:border-neutral-800"
              >
                <button
                  type="button"
                  onClick={() => toggle(s.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <span
                    className={`text-neutral-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    aria-hidden
                  >
                    ▸
                  </span>
                  <span>{s.title}</span>
                </button>
                {isOpen && (
                  <div className="markdown border-t border-neutral-200 px-4 py-3 text-sm leading-relaxed dark:border-neutral-800">
                    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
                      {s.body}
                    </ReactMarkdown>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
