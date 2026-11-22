// The two coral-log guards read `git diff --cached` and parse its text.
// 2026-11-21 brief (Klatch: an invariant measured true may hold only by
// coincidence). Ours did: the guards refused bad entries on Amber only
// because nobody had set color.ui=always or an external diff tool.
// Replayed in a scratch clone, either setting made both guards pass a
// known-bad entry (exit 0). These tests run the REAL scripts under those
// settings in a throwaway repo.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '../../..');
let dir: string;
const today = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'logguards-'));
  const git = (...a: string[]) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
  git('init', '-q');
  git('config', 'user.name', 't');
  git('config', 'user.email', 't@t');
  mkdirSync(join(dir, 'scripts'));
  mkdirSync(join(dir, 'development/coral-logs'), { recursive: true });
  for (const s of ['check-log-drain.mjs', 'check-log-clock.mjs']) copyFileSync(join(root, 'scripts', s), join(dir, 'scripts', s));
  writeFileSync(join(dir, 'package.json'), '{"type":"module"}');
  git('add', '-A');
  git('commit', '-qm', 'init');
  // Known-bad on both counts: a fire with no Drain line, at 23:59 (later
  // than the clock unless the suite runs in the last minute of the day).
  writeFileSync(join(dir, `development/coral-logs/${today}-coral-log.md`), '## Fire: 23:59 PST (duty cycle)\n- nothing\n');
  git('add', '-A');
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

const run = (script: string, cfg: Record<string, string>) => {
  const keys = Object.entries(cfg);
  const env: NodeJS.ProcessEnv = { ...process.env, GIT_CONFIG_COUNT: String(keys.length) };
  keys.forEach(([k, v], i) => { env[`GIT_CONFIG_KEY_${i}`] = k; env[`GIT_CONFIG_VALUE_${i}`] = v; });
  return spawnSync('node', [`scripts/${script}`], { cwd: dir, env, encoding: 'utf8' }).status;
};

const configs: [string, Record<string, string>][] = [
  ['no config', {}],
  ['color.ui=always', { 'color.ui': 'always' }],
  ['color.diff=always', { 'color.diff': 'always' }],
  ['an external diff tool', { 'diff.external': 'true' }],
  ['diff.noprefix', { 'diff.noprefix': 'true' }],
];

describe('coral-log guards hold under any diff config', () => {
  it.each(configs)('drain guard refuses a fire with no Drain line under %s', (_, cfg) => {
    expect(run('check-log-drain.mjs', cfg)).toBe(1);
  });

  it.each(configs)('clock guard refuses a future heading under %s', (_, cfg) => {
    const d = new Date();
    if (d.getHours() === 23 && d.getMinutes() === 59) return; // 23:59 is not future in that minute
    expect(run('check-log-clock.mjs', cfg)).toBe(1);
  });
});
