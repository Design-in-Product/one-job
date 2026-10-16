import React from 'react';
import { parseMarkdown, type Inline, type Block } from '@/domain/markdown';

// Renders a description's Markdown in the open card (board 48). Every
// node is a React element, so nothing in the text is ever treated as
// HTML. Sizes stay close to the body text: a heading in a card is a
// label, not a page title. Rules: docs/CARD-DESIGN.md § Markdown.

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

function inline(nodes: Inline[]): React.ReactNode[] {
  return nodes.map((n, i) => {
    switch (n.type) {
      case 'text': return <React.Fragment key={i}>{n.text}</React.Fragment>;
      case 'strong': return <strong key={i} className="font-semibold text-gray-800">{inline(n.children)}</strong>;
      case 'em': return <em key={i}>{inline(n.children)}</em>;
      case 'code': return <code key={i} className="rounded bg-gray-100 px-1 text-[0.9em] font-mono break-all">{n.text}</code>;
      case 'link':
        // Tapping a link follows it; it must not also start editing
        // the description underneath.
        return (
          <a key={i} href={n.href} target="_blank" rel="noopener noreferrer" onClick={stop}
             className="text-blue-700 underline underline-offset-2 break-words">
            {inline(n.children)}
          </a>
        );
    }
  });
}

function block(b: Block, i: number): React.ReactNode {
  switch (b.type) {
    case 'heading':
      return <p key={i} className={`font-semibold text-gray-800 ${b.level <= 2 ? 'text-[1.05em]' : ''}`}>{inline(b.inline)}</p>;
    case 'paragraph':
      return <p key={i} className="whitespace-pre-line">{inline(b.inline)}</p>;
    case 'quote':
      return <p key={i} className="whitespace-pre-line border-l-2 border-gray-300 pl-3 text-gray-600">{inline(b.inline)}</p>;
    case 'code':
      return <pre key={i} className="rounded-md bg-gray-100 px-2 py-1.5 text-[0.85em] font-mono whitespace-pre-wrap break-all">{b.text}</pre>;
    case 'rule':
      return <hr key={i} className="border-gray-200" />;
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul';
      const tasks = b.items.some(it => it.checked !== undefined);
      return (
        <Tag key={i} start={b.ordered ? b.start : undefined}
             className={tasks ? 'space-y-0.5' : `pl-5 space-y-0.5 ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
          {b.items.map((it, j) => (
            <li key={j}>
              {it.checked !== undefined && <span aria-hidden className="mr-1.5">{it.checked ? '☑' : '☐'}</span>}
              {inline(it.inline)}
            </li>
          ))}
        </Tag>
      );
    }
  }
}

export const MarkdownText: React.FC<{ text: string }> = ({ text }) => (
  <>{parseMarkdown(text).map(block)}</>
);

export default MarkdownText;
