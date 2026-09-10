"use client";

// Minimal Markdown renderer for AI replies. Zero dependencies, by design:
// react-markdown pulls ~20 transitive packages and ~45KB gzip into the Workers
// bundle for the handful of constructs free models actually emit, and would
// still need a sanitizer configured on top.
//
// SECURITY: this renders React elements, never HTML. React escapes every text
// node, so a prompt-injected `<img src=x onerror=...>` shows up as literal
// characters. There is no HTML sink here and there must never be one — reject
// any change that introduces React's raw-HTML escape hatch. A grep for
// "innerHTML" across components/chat/ should stay empty.
//
// Supported (a deliberately closed set): fenced code, inline code, bold,
// italic, h1-h3, unordered/ordered lists, blockquote, `---`, and links.
// Anything else falls through as literal text rather than throwing.

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";

type Block =
  | { kind: "code"; lang: string; text: string }
  | { kind: "p"; text: string }
  | { kind: "h"; level: 1 | 2 | 3; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "hr" };

const FENCE = /^```([\w+-]*)\s*$/;
const HEADING = /^(#{1,3})\s+(.*)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const RULE = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;

/** Split source into blocks. Fenced regions are consumed first so their
 *  contents are never treated as markdown. */
function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ kind: "p", text: paragraph.join("\n") });
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(FENCE);

    if (fence) {
      flush();
      const body: string[] = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) body.push(lines[i++]);
      blocks.push({ kind: "code", lang: fence[1] || "", text: body.join("\n") });
      continue; // the loop's i++ steps past the closing fence
    }

    if (!line.trim()) {
      flush();
      continue;
    }
    if (RULE.test(line)) {
      flush();
      blocks.push({ kind: "hr" });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      flush();
      blocks.push({
        kind: "h",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      });
      continue;
    }

    const bullet = line.match(BULLET);
    if (bullet) {
      flush();
      const items = [bullet[1]];
      while (i + 1 < lines.length) {
        const next = lines[i + 1].match(BULLET);
        if (!next) break;
        items.push(next[1]);
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    const numbered = line.match(NUMBERED);
    if (numbered) {
      flush();
      const items = [numbered[1]];
      while (i + 1 < lines.length) {
        const next = lines[i + 1].match(NUMBERED);
        if (!next) break;
        items.push(next[1]);
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    const quote = line.match(QUOTE);
    if (quote) {
      flush();
      const parts = [quote[1]];
      while (i + 1 < lines.length) {
        const next = lines[i + 1].match(QUOTE);
        if (!next) break;
        parts.push(next[1]);
        i++;
      }
      blocks.push({ kind: "quote", text: parts.join("\n") });
      continue;
    }

    paragraph.push(line);
  }
  flush();
  return blocks;
}

/** Only http(s) links are rendered as anchors; javascript:/data: fall back to
 *  plain text so a hostile URL can never become a clickable sink. */
function safeHref(href: string): string | null {
  try {
    const url = new URL(href, "https://hidayah.thinkfastbd.com");
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const INLINE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]]+\]\([^)\s]+\))|(https?:\/\/[^\s<>()]+)/g;

function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `i${match.index}`;

    if (token.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-card-hi px-1 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**")) {
      out.push(
        <strong key={key} className="font-semibold text-text">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("[")) {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const href = safeHref(token.slice(split + 2, -1));
      out.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-gold underline underline-offset-2"
          >
            {label}
          </a>
        ) : (
          label
        )
      );
    } else if (token.startsWith("http")) {
      const href = safeHref(token);
      out.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="break-all text-gold underline underline-offset-2"
          >
            {token}
          </a>
        ) : (
          token
        )
      );
    } else {
      // *italic* or _italic_
      out.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

function CodeBlock({ text }: { text: string }) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!navigator.clipboard || !window.isSecureContext) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard denied - the text is selectable anyway */
    }
  };

  return (
    <div className="group/code relative my-2">
      <pre className="overflow-x-auto rounded-xl border border-border bg-bg px-3 py-2.5 text-[12.5px] leading-relaxed">
        <code>{text}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? tx.copied : tx.copy}
        className="absolute right-2 top-2 rounded-lg border border-border bg-card p-1.5 text-muted opacity-0 transition hover:text-text focus-visible:opacity-100 group-hover/code:opacity-100 max-lg:opacity-100"
      >
        <Icon name={copied ? "check" : "copy"} size={14} />
      </button>
    </div>
  );
}

export default function Markdown({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const blocks = useMemo(() => parseBlocks(children ?? ""), [children]);

  return (
    <div className={`space-y-2 text-[15px] leading-relaxed ${bn} ${className}`}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "code":
            return <CodeBlock key={index} text={block.text} />;
          case "hr":
            return (
              <div key={index} className="rule-diamond my-3">
                <span className="text-[10px] text-gold">◆</span>
              </div>
            );
          case "h": {
            const size = block.level === 1 ? "text-base" : "text-[15px]";
            return (
              <h3 key={index} className={`font-display font-semibold text-text ${size}`}>
                {renderInline(block.text)}
              </h3>
            );
          }
          case "ul":
            return (
              <ul key={index} className="list-disc space-y-1 pl-5">
                {block.items.map((item, i) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index} className="list-decimal space-y-1 pl-5">
                {block.items.map((item, i) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="border-l-2 border-gold/40 pl-3 text-text-soft"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          default:
            return (
              <p key={index} className="whitespace-pre-line">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
