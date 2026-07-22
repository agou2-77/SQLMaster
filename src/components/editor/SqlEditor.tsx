"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql, PostgreSQL, type SQLNamespace } from "@codemirror/lang-sql";
import { keymap, EditorView } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import type { SchemaTable } from "@/lib/pglite/usePglite";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Called on Ctrl/Cmd+Enter. */
  onRun: () => void;
  schema?: SchemaTable[];
  disabled?: boolean;
}

export function SqlEditor({
  value,
  onChange,
  onRun,
  schema,
  disabled,
}: SqlEditorProps) {
  const extensions = useMemo(() => {
    const schemaMap: SQLNamespace | undefined = schema?.length
      ? Object.fromEntries(schema.map((t) => [t.name, t.columns.map((c) => c.name)]))
      : undefined;

    return [
      sql({ dialect: PostgreSQL, schema: schemaMap, upperCaseKeywords: true }),
      EditorView.lineWrapping,
      // Run on Cmd/Ctrl+Enter; highest precedence so it beats default bindings.
      Prec.highest(
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onRun();
              return true;
            },
          },
        ]),
      ),
    ];
  }, [schema, onRun]);

  return (
    <CodeMirror
      value={value}
      height="240px"
      editable={!disabled}
      placeholder="-- Write your SQL query here, then press Run (⌘/Ctrl+Enter)"
      onChange={onChange}
      extensions={extensions}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
      style={{ fontSize: 14 }}
    />
  );
}
