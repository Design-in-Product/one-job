// src/domain/markdown.ts
// Markdown in a card's description (xian, 2026-10-16, board 48). Text
// from GitHub or Todoist arrives with Markdown; it used to show the
// marks as typed. This reads a small subset into plain data, which the
// UI renders as React elements (never as HTML), so imported text can't
// inject markup. Images are never loaded. The rules, and why each one:
// docs/CARD-DESIGN.md § Markdown.

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: Inline[] }
  | { type: 'em'; children: Inline[] }
  | { type: 'code'; text: string }
  | { type: 'link'; href: string; children: Inline[] };

export interface ListItem { inline: Inline[]; checked?: boolean }

export type Block =
  | { type: 'heading'; level: number; inline: Inline[] }
  | { type: 'paragraph'; inline: Inline[] }
  | { type: 'list'; ordered: boolean; start?: number; items: ListItem[] }
  | { type: 'code'; text: string }
  | { type: 'quote'; inline: Inline[] }
  | { type: 'rule' };

/** Only the web and mail. Anything else (javascript:, data:, a
    relative path) is shown as text, not as a link. */
export function safeHref(url: string): string | null {
  const u = url.trim();
  return /^(https?:\/\/|mailto:)/i.test(u) ? u : null;
}

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const BULLET = /^\s{0,3}[-*+]\s+(.*)$/;
const NUMBER = /^\s{0,3}(\d{1,9})[.)]\s+(.*)$/;
const FENCE = /^\s{0,3}(```|~~~)/;
const RULE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const TASK = /^\[([ xX])\]\s+(.*)$/;

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: 'paragraph', inline: parseInline(para.join('\n')) });
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { flush(); continue; }

    const fence = line.match(FENCE);
    if (fence) {
      flush();
      const body: string[] = [];
      // An unclosed fence runs to the end: nothing typed is dropped.
      for (i++; i < lines.length && !lines[i].trim().startsWith(fence[1]); i++) body.push(lines[i]);
      blocks.push({ type: 'code', text: body.join('\n') });
      continue;
    }
    const h = line.match(HEADING);
    if (h) { flush(); blocks.push({ type: 'heading', level: h[1].length, inline: parseInline(h[2]) }); continue; }
    if (RULE.test(line)) { flush(); blocks.push({ type: 'rule' }); continue; }

    if (QUOTE.test(line)) {
      flush();
      const body: string[] = [];
      for (; i < lines.length && QUOTE.test(lines[i]); i++) body.push(lines[i].match(QUOTE)![1]);
      i--;
      blocks.push({ type: 'quote', inline: parseInline(body.join('\n')) });
      continue;
    }

    const bullet = line.match(BULLET);
    const number = line.match(NUMBER);
    if (bullet || number) {
      flush();
      const ordered = !bullet;
      const items: ListItem[] = [];
      for (; i < lines.length; i++) {
        const m = ordered ? lines[i].match(NUMBER) : lines[i].match(BULLET);
        if (!m) break;
        const text = ordered ? m[2] : m[1];
        const task = text.match(TASK);
        items.push(task
          ? { inline: parseInline(task[2]), checked: task[1] !== ' ' }
          : { inline: parseInline(text) });
      }
      i--;
      blocks.push(ordered
        ? { type: 'list', ordered, start: Number(number![1]), items }
        : { type: 'list', ordered, items });
      continue;
    }
    para.push(line);
  }
  flush();
  return blocks;
}

// A bare web address ends at a space; trailing punctuation stays outside.
const BARE_URL = /^https?:\/\/[^\s<>]+/;
const TRAILING = /[.,;:!?)\]'"]+$/;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let buf = '';
  const push = (node: Inline) => {
    if (buf) { out.push({ type: 'text', text: buf }); buf = ''; }
    out.push(node);
  };
  const wordChar = (c: string | undefined) => !!c && /[\p{L}\p{N}]/u.test(c);

  let i = 0;
  while (i < text.length) {
    const rest = text.slice(i);
    const c = text[i];

    if (c === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > i + 1) { push({ type: 'code', text: text.slice(i + 1, end) }); i = end + 1; continue; }
    }

    // [text](url) and ![alt](url). An image is never loaded: it becomes
    // its description, linked when the address is safe.
    // An address may hold matched brackets (Wikipedia's often do).
    const link = rest.match(/^!?\[([^\]]*)\]\(\s*((?:[^()\s]|\([^()\s]*\))+)(?:\s+"[^"]*")?\s*\)/);
    if (link) {
      const href = safeHref(link[2]);
      const children = parseInline(link[1]);
      if (href) push({ type: 'link', href, children });
      else { if (buf) { out.push({ type: 'text', text: buf }); buf = ''; } out.push(...children); }
      i += link[0].length;
      continue;
    }

    if (c === 'h' && !wordChar(text[i - 1])) {
      const url = rest.match(BARE_URL);
      if (url) {
        const href = url[0].replace(TRAILING, '');
        push({ type: 'link', href, children: [{ type: 'text', text: href }] });
        i += href.length;
        continue;
      }
    }

    // **strong** / __strong__, then *em* / _em_. Underscores only at
    // word edges, so snake_case_names stay as they are. A mark needs
    // text right inside it, so "5 * 3" is left alone.
    const strong = rest.match(/^(\*\*|__)(?=\S)([\s\S]*?\S)\1/);
    if (strong && (strong[1] === '**' || (!wordChar(text[i - 1]) && !wordChar(text[i + strong[0].length])))) {
      push({ type: 'strong', children: parseInline(strong[2]) });
      i += strong[0].length;
      continue;
    }
    const em = rest.match(/^([*_])(?=\S)([\s\S]*?\S)\1/);
    if (em && !rest.startsWith(em[1] + em[1]) && (em[1] === '*' || (!wordChar(text[i - 1]) && !wordChar(text[i + em[0].length])))) {
      push({ type: 'em', children: parseInline(em[2]) });
      i += em[0].length;
      continue;
    }

    buf += c;
    i++;
  }
  if (buf) out.push({ type: 'text', text: buf });
  return out;
}

/** The words of some inline content, marks dropped. */
export function plainText(inline: Inline[]): string {
  return inline.map(n => (n.type === 'text' || n.type === 'code' ? n.text : plainText(n.children))).join('');
}

/** What the card face and the Done list show: plain text, one line
    per block, cut on a word at `limit` characters. */
export function previewText(source: string, limit = Infinity): string {
  const lines = parseMarkdown(source).flatMap((b): string[] => {
    switch (b.type) {
      case 'heading': case 'paragraph': case 'quote': return [plainText(b.inline)];
      case 'code': return [b.text];
      case 'rule': return [];
      case 'list': return b.items.map((it, n) =>
        (b.ordered ? `${(b.start ?? 1) + n}. ` : it.checked === undefined ? '• ' : it.checked ? '☑ ' : '☐ ') + plainText(it.inline));
    }
  });
  const text = lines.join('\n');
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const space = cut.search(/\s\S*$/);
  // Don't end on a bare list marker ("1.…").
  const kept = (space > 0 ? cut.slice(0, space) : cut).replace(/\n?(?:\d+\.|[•☐☑])\s*$/, '');
  return kept.trimEnd() + '…';
}
