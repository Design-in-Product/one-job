// Markdown in a card's description (xian, 2026-10-16, board 48:
// "render it please, just as you say"). The face shows plain text;
// the open card shows a small, safe subset; editing shows the text as
// typed. Rules and reasons: docs/CARD-DESIGN.md.
import { describe, it, expect } from 'vitest';
import { parseMarkdown, parseInline, plainText, safeHref, previewText } from '../markdown';

describe('parseMarkdown: blocks', () => {
  it('reads headings, paragraphs and a blank-line break between them', () => {
    expect(parseMarkdown('## Steps\n\nOpen the app.\nThen swipe.')).toEqual([
      { type: 'heading', level: 2, inline: [{ type: 'text', text: 'Steps' }] },
      { type: 'paragraph', inline: [{ type: 'text', text: 'Open the app.\nThen swipe.' }] },
    ]);
  });

  it('reads bulleted and numbered lists, and GitHub task boxes', () => {
    const [ul, ol] = parseMarkdown('- one\n* two\n- [x] done\n- [ ] open\n\n1. first\n2) second');
    expect(ul).toMatchObject({ type: 'list', ordered: false });
    expect(ul.type === 'list' && ul.items.map(i => i.checked)).toEqual([undefined, undefined, true, false]);
    expect(ul.type === 'list' && plainText(ul.items[2].inline)).toBe('done');
    expect(ol).toMatchObject({ type: 'list', ordered: true, start: 1 });
    expect(ol.type === 'list' && ol.items.length).toBe(2);
  });

  it('keeps a fenced code block exactly as typed, Markdown and all', () => {
    expect(parseMarkdown('```js\nconst a = **b**;\n```')).toEqual([
      { type: 'code', text: 'const a = **b**;' },
    ]);
  });

  it('treats an unclosed fence as code to the end, losing nothing', () => {
    expect(parseMarkdown('```\nline one\nline two')).toEqual([
      { type: 'code', text: 'line one\nline two' },
    ]);
  });

  it('reads a quote and a rule', () => {
    expect(parseMarkdown('> quoted\n> on.\n\n---')).toEqual([
      { type: 'quote', inline: [{ type: 'text', text: 'quoted\non.' }] },
      { type: 'rule' },
    ]);
  });

  it('shows HTML as the text it is, never as markup', () => {
    expect(parseMarkdown('<img src=x onerror=alert(1)>')).toEqual([
      { type: 'paragraph', inline: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }] },
    ]);
  });

  it('gives nothing for empty or blank text', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown('  \n\n ')).toEqual([]);
  });
});

describe('parseInline', () => {
  it('reads bold, italics and code', () => {
    expect(parseInline('a **b** _c_ *d* `e*f`')).toEqual([
      { type: 'text', text: 'a ' },
      { type: 'strong', children: [{ type: 'text', text: 'b' }] },
      { type: 'text', text: ' ' },
      { type: 'em', children: [{ type: 'text', text: 'c' }] },
      { type: 'text', text: ' ' },
      { type: 'em', children: [{ type: 'text', text: 'd' }] },
      { type: 'text', text: ' ' },
      { type: 'code', text: 'e*f' },
    ]);
  });

  it('leaves an underscore inside a word alone (snake_case_names)', () => {
    expect(parseInline('see my_var_name here')).toEqual([{ type: 'text', text: 'see my_var_name here' }]);
  });

  it('leaves a lone asterisk alone', () => {
    expect(parseInline('5 * 3 = 15')).toEqual([{ type: 'text', text: '5 * 3 = 15' }]);
  });

  it('reads a link, with Markdown inside its text', () => {
    expect(parseInline('[the **spec**](https://example.com/a)')).toEqual([
      { type: 'link', href: 'https://example.com/a', children: [
        { type: 'text', text: 'the ' },
        { type: 'strong', children: [{ type: 'text', text: 'spec' }] },
      ] },
    ]);
  });

  it('turns a bare web address into a link, leaving trailing punctuation outside', () => {
    expect(parseInline('See https://example.com/x, then go.')).toEqual([
      { type: 'text', text: 'See ' },
      { type: 'link', href: 'https://example.com/x', children: [{ type: 'text', text: 'https://example.com/x' }] },
      { type: 'text', text: ', then go.' },
    ]);
  });

  it('shows a link to anything but the web or mail as its text only', () => {
    expect(parseInline('[click](javascript:alert(1))')).toEqual([{ type: 'text', text: 'click' }]);
  });

  it('keeps matched brackets inside an address', () => {
    expect(parseInline('[Ada](https://en.wikipedia.org/wiki/Ada_(language))')).toEqual([
      { type: 'link', href: 'https://en.wikipedia.org/wiki/Ada_(language)', children: [{ type: 'text', text: 'Ada' }] },
    ]);
  });

  it('never loads an image: it becomes its description, linked if the address is safe', () => {
    expect(parseInline('![a chart](https://example.com/c.png)')).toEqual([
      { type: 'link', href: 'https://example.com/c.png', children: [{ type: 'text', text: 'a chart' }] },
    ]);
  });
});

describe('safeHref', () => {
  it('allows the web and mail, nothing else', () => {
    expect(safeHref('https://a.b/c')).toBe('https://a.b/c');
    expect(safeHref('http://a.b')).toBe('http://a.b');
    expect(safeHref('mailto:x@y.z')).toBe('mailto:x@y.z');
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref(' JavaScript:alert(1)')).toBeNull();
    expect(safeHref('data:text/html,hi')).toBeNull();
    expect(safeHref('/relative')).toBeNull();
  });
});

describe('previewText: what the card face and the Done list show', () => {
  it('drops the marks and keeps the words', () => {
    expect(previewText('## Steps\n\n1. Open **the** app\n- see [docs](https://x.y)\n\n```\ncode\n```'))
      .toBe('Steps\n1. Open the app\n• see docs\ncode');
  });

  it('cuts at the limit on a word, with an ellipsis', () => {
    expect(previewText('one two three four', 12)).toBe('one two…');
  });

  it('does not end on a bare list number', () => {
    expect(previewText('Steps\n\n1. Open the app\n2. Tap Settings', 25)).toBe('Steps\n1. Open the app…');
  });

  it('leaves plain text as it was', () => {
    expect(previewText('Buy stamps\nat the post office')).toBe('Buy stamps\nat the post office');
  });
});
