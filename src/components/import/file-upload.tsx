"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ParseSummary {
  total: number;
  linked: number;
  unlinked: number;
}

interface FileUploadProps {
  onParse: (content: string) => ParseSummary | Promise<ParseSummary | void> | void;
  loading?: boolean;
}

export default function FileUpload({ onParse, loading }: FileUploadProps) {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<ParseSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseContent = async (content: string) => {
    const result = await onParse(content);
    if (result) setSummary(result);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const content = await file.text();
    setText(content);
    parseContent(content);
  };

  const onDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    await handleFile(file);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <h1 className="mb-2 font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">
        Import Anime List
      </h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Upload your markdown or text file, or paste it directly.
      </p>

      <Card
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="mb-4 border-dashed"
      >
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-[var(--text-muted)]">
            Drop <code>.md</code> or <code>.txt</code> here
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </CardContent>
      </Card>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your anime list here..."
        className="mb-4 h-64 w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 font-mono text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
      />

      <Button onClick={() => parseContent(text)} disabled={!text.trim() || loading}>
        {loading ? "Parsing..." : "Parse"}
      </Button>

      {summary && (
        <Card className="mt-4">
          <CardContent className="text-sm text-[var(--text)]">
            Found <strong>{summary.total}</strong> entries:{" "}
            <span className="text-green-400">{summary.linked} linked</span>,{" "}
            <span className="text-[var(--accent)]">
              {summary.unlinked} need resolution
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
