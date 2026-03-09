"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders plain text content with:
 *  - `$$...$$` → block math (display mode)
 *  - `$...$`  → inline math
 *  - `## heading` → h2
 *  - `### heading` → h3
 *  - `**bold**` → bold
 *  - `*italic*` → italic
 *  - `` `code` `` → inline code
 *  - `> quote` → blockquote
 *  - `- item` → bullet list
 *  - blank lines → paragraph breaks
 */

function renderKatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return `<span class="text-red-400" style="font-size:13px;">[LaTeX error: ${tex}]</span>`;
  }
}

function processInlineFormatting(text: string): string {
  // Inline LaTeX  $...$  (non-greedy, no nested $$)
  let result = text.replace(/\$([^$]+?)\$/g, (_, tex) => renderKatex(tex.trim(), false));

  // Bold **...**
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic *...*
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code `...`
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-accent)]" style="font-size:0.9em;">$1</code>'
  );

  return result;
}

export function ContentRenderer({ content, className = "" }: { content: string; className?: string }) {
  const html = useMemo(() => {
    if (!content.trim()) return "";

    const lines = content.split("\n");
    const blocks: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Block math: $$...$$  (multi-line)
      if (line.trim().startsWith("$$")) {
        const texLines: string[] = [];
        // Check if closing $$ is on the same line
        const rest = line.trim().slice(2);
        if (rest.endsWith("$$") && rest.length > 2) {
          const tex = rest.slice(0, -2);
          blocks.push(`<div class="my-4 text-center overflow-x-auto">${renderKatex(tex.trim(), true)}</div>`);
          i++;
          continue;
        }
        texLines.push(rest);
        i++;
        while (i < lines.length && !lines[i].trim().endsWith("$$")) {
          texLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          texLines.push(lines[i].trim().slice(0, -2));
          i++;
        }
        const tex = texLines.join("\n").trim();
        blocks.push(`<div class="my-4 text-center overflow-x-auto">${renderKatex(tex, true)}</div>`);
        continue;
      }

      // Heading ###
      if (line.startsWith("### ")) {
        blocks.push(`<h3 style="font-size:18px;font-weight:700;margin:20px 0 8px;">${processInlineFormatting(line.slice(4))}</h3>`);
        i++;
        continue;
      }

      // Heading ##
      if (line.startsWith("## ")) {
        blocks.push(`<h2 style="font-size:22px;font-weight:700;margin:24px 0 10px;">${processInlineFormatting(line.slice(3))}</h2>`);
        i++;
        continue;
      }

      // Blockquote >
      if (line.startsWith("> ")) {
        const quoteLines: string[] = [line.slice(2)];
        i++;
        while (i < lines.length && lines[i].startsWith("> ")) {
          quoteLines.push(lines[i].slice(2));
          i++;
        }
        blocks.push(
          `<blockquote class="border-l-3 border-[var(--color-accent)] pl-4 my-4 text-[var(--color-muted-foreground)]" style="font-style:italic;line-height:1.7;">${quoteLines.map(processInlineFormatting).join("<br/>")}</blockquote>`
        );
        continue;
      }

      // Unordered list - item
      if (line.startsWith("- ")) {
        const items: string[] = [line.slice(2)];
        i++;
        while (i < lines.length && lines[i].startsWith("- ")) {
          items.push(lines[i].slice(2));
          i++;
        }
        blocks.push(
          `<ul class="my-3 ml-5 space-y-1" style="list-style:disc;">${items.map((item) => `<li>${processInlineFormatting(item)}</li>`).join("")}</ul>`
        );
        continue;
      }

      // Empty line → spacing
      if (line.trim() === "") {
        i++;
        continue;
      }

      // Regular paragraph
      blocks.push(`<p style="margin:8px 0;line-height:1.8;">${processInlineFormatting(line)}</p>`);
      i++;
    }

    return blocks.join("");
  }, [content]);

  if (!html) {
    return (
      <div className={`text-muted-foreground ${className}`} style={{ fontSize: 15 }}>
        Start typing to see your preview here...
      </div>
    );
  }

  return (
    <div
      className={`prose-content ${className}`}
      style={{ fontSize: 16, lineHeight: 1.8 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
  