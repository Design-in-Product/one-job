// R3.2: the first REAL source, read-only (Xian's call, 2026-07-29:
// GitHub — where his actual work lives). Mocked fetch: these tests pin
// the mapping and the failure honesty, not GitHub's uptime.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubSourceAdapter } from '../githubAdapter';

const issue = (over: Record<string, unknown>) => ({
  number: 1, title: 't', body: null, created_at: '2026-07-01T10:00:00Z',
  html_url: 'https://github.com/o/r/issues/1',
  repository: { full_name: 'o/r' }, ...over,
});

beforeEach(() => vi.unstubAllGlobals());

describe('GitHubSourceAdapter', () => {
  it('maps assigned open issues to external cards with repo#number identity', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([
      issue({ number: 7, title: 'Fix the flaky test', body: 'it flakes', html_url: 'https://github.com/o/r/issues/7' }),
    ]), { status: 200 })));
    const cards = await new GitHubSourceAdapter('tok').fetchCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].externalId).toBe('o/r#7');
    expect(cards[0].title).toBe('Fix the flaky test');
    expect(cards[0].completed).toBe(false);
    expect(cards[0].description).toContain('https://github.com/o/r/issues/7');
    expect(cards[0].description).toContain('it flakes');
    expect(cards[0].createdAt).toBeInstanceOf(Date);
    // auth + endpoint honesty
    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toContain('/issues?filter=assigned&state=open');
    expect(call[1].headers.Authorization).toBe('Bearer tok');
  });

  it('filters out pull requests (the issues endpoint includes them)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([
      issue({ number: 1, title: 'real issue' }),
      issue({ number: 2, title: 'a PR', pull_request: { url: 'x' } }),
    ]), { status: 200 })));
    const cards = await new GitHubSourceAdapter('tok').fetchCards();
    expect(cards.map(c => c.title)).toEqual(['real issue']);
  });

  it('fails loudly and namedly on auth errors — no silent empty import', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401, statusText: 'Unauthorized' })));
    await expect(new GitHubSourceAdapter('bad').fetchCards()).rejects.toThrow(/GitHub.*401/);
  });

  it('survives issues with no repository field (rare but real)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([
      issue({ number: 3, repository: undefined }),
    ]), { status: 200 })));
    const cards = await new GitHubSourceAdapter('tok').fetchCards();
    expect(cards[0].externalId).toBe('github#3');
  });
});
