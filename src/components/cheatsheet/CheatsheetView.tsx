"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface CheatsheetViewProps {
  content: string;
}

/**
 * Renders the SQL cheatsheet markdown. `rehypeRaw` lets the in-document
 * `<a name="...">` anchors render so the table-of-contents links jump.
 * The content is our own authored file (not user input), so raw HTML is safe.
 */
export function CheatsheetView({ content }: CheatsheetViewProps) {
  return (
    <div className="markdown text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
