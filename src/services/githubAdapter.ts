// src/services/githubAdapter.ts
// R3.2: the first real source, READ-ONLY (Xian, 2026-07-29: GitHub —
// "where most of my tech work lives"; Asana deliberately avoided,
// Trello a later second). Rides the R3.1 seam: issues assigned to the
// token's user land as cards in the 'github' root deck, provenance
// `owner/repo#number`, local ids always fresh. Write access (closing
// issues from One Job) is R3.4 and must be EARNED — nothing here
// mutates anything upstream.
//
// The token is a device-local secret (localStorage, like everything in
// a local-first app). A fine-grained PAT with read-only Issues scope is
// the recommended shape; the token never leaves the device except to
// api.github.com itself.

import type { SourceAdapter, ExternalCard } from './sourceAdapter';

const GITHUB_TOKEN_KEY = 'oneJobGitHubToken';

export const getGitHubToken = (): string => {
  try {
    return localStorage.getItem(GITHUB_TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
};

export const setGitHubToken = (token: string): void => {
  try {
    if (token.trim()) localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
    else localStorage.removeItem(GITHUB_TOKEN_KEY);
  } catch {
    /* storage unavailable — the token just won't persist */
  }
};

interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  created_at?: string;
  html_url: string;
  pull_request?: unknown;
  repository?: { full_name?: string };
}

export class GitHubSourceAdapter implements SourceAdapter {
  readonly service = 'github';

  constructor(private token: string) {}

  async fetchCards(): Promise<ExternalCard[]> {
    const res = await fetch(
      'https://api.github.com/issues?filter=assigned&state=open&per_page=100',
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );
    if (!res.ok) {
      // Fail loudly and namedly — a silent empty import would be the
      // m-44 disease with a network costume.
      throw new Error(`GitHub refused the request: ${res.status} ${res.statusText}`);
    }
    const issues = (await res.json()) as GitHubIssue[];
    return issues
      .filter(i => !i.pull_request) // the issues endpoint includes PRs
      .map(i => ({
        externalId: `${i.repository?.full_name ?? 'github'}#${i.number}`,
        title: i.title,
        description: [i.html_url, i.body ?? ''].filter(Boolean).join('\n\n'),
        completed: false, // read-only pull of OPEN assigned issues
        createdAt: i.created_at ? new Date(i.created_at) : undefined,
      }));
  }
}
