// Vitest setup: a deterministic localStorage for every test run.
//
// Why this exists (2026-07-28, discovered when the suite moved to Amber):
// jsdom no longer ships its own localStorage — it defers to the platform's.
// Node 26 HAS a built-in localStorage, but it is inert unless the process
// was started with --localstorage-file, so `window.localStorage` comes back
// `undefined` and 63 storage-backed tests fail with "Cannot read properties
// of undefined". On Node 22 (the previous container) there was no built-in,
// jsdom's own implementation shone through, and the same commit was green.
//
// Rather than pin a Node version or pass a flag, tests get one in-memory
// Storage that behaves identically on every machine. It is installed
// unconditionally and reset between tests, so no test can inherit either
// the host's storage semantics or another test's leftovers.

import { beforeEach } from "vitest";

class MemoryStorage implements Storage {
  private entries = new Map<string, string>();

  get length(): number {
    return this.entries.size;
  }

  key(index: number): string | null {
    // Storage iterates in insertion order; Map does too.
    return Array.from(this.entries.keys())[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.entries.has(String(key)) ? this.entries.get(String(key))! : null;
  }

  setItem(key: string, value: string): void {
    this.entries.set(String(key), String(value));
  }

  removeItem(key: string): void {
    this.entries.delete(String(key));
  }

  clear(): void {
    this.entries.clear();
  }
}

const storage = new MemoryStorage();

for (const target of [globalThis, globalThis.window].filter(Boolean)) {
  Object.defineProperty(target, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
}

// Belt and braces: suites that forget to clear still start clean.
beforeEach(() => {
  storage.clear();
});
