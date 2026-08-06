// Quiet mode gate (Xian, 2026-07-29): success/info/message mute; errors
// NEVER mute — a silenced failure report is the m-44 disease in costume.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('sonner', () => {
  const calls: Record<string, number> = { bare: 0, success: 0, info: 0, message: 0, error: 0, warning: 0 };
  const bare = Object.assign(
    (..._a: unknown[]) => { calls.bare++; return 'id'; },
    {
      success: () => { calls.success++; return 'id'; },
      info: () => { calls.info++; return 'id'; },
      message: () => { calls.message++; return 'id'; },
      error: () => { calls.error++; return 'id'; },
      warning: () => { calls.warning++; return 'id'; },
      __calls: calls,
    }
  );
  return { toast: bare, Toaster: () => null };
});

import { toast, setQuietMode, isQuietMode } from '../sonner';
import { toast as mocked } from 'sonner';

const calls = (mocked as unknown as { __calls: Record<string, number> }).__calls;

beforeEach(() => { for (const k of Object.keys(calls)) calls[k] = 0; setQuietMode(false); });
afterEach(() => setQuietMode(false));

describe('quiet mode', () => {
  it('is off by default and lets everything through', () => {
    expect(isQuietMode()).toBe(false);
    toast.success('s'); toast.info('i'); toast.error('e');
    expect(calls.success).toBe(1);
    expect(calls.info).toBe(1);
    expect(calls.error).toBe(1);
  });

  it('mutes success, info, and message when on', () => {
    setQuietMode(true);
    toast.success('s'); toast.info('i'); toast.message('m');
    expect(calls.success).toBe(0);
    expect(calls.info).toBe(0);
    expect(calls.message).toBe(0);
  });

  it('NEVER mutes errors', () => {
    setQuietMode(true);
    toast.error('boom');
    expect(calls.error).toBe(1);
  });

  it('persists as a preference and toggles cleanly', () => {
    setQuietMode(true);
    expect(localStorage.getItem('oneJobQuietMode')).toBe('1');
    setQuietMode(false);
    expect(localStorage.getItem('oneJobQuietMode')).toBeNull();
    toast.success('s');
    expect(calls.success).toBe(1);
  });
});

describe('toastAnswer — direct answers bypass quiet (2026-08-06)', () => {
  it('answers fire even when quiet is on', async () => {
    const { toastAnswer } = await import('../sonner');
    const { setQuietMode } = await import('../sonner');
    setQuietMode(true);
    toastAnswer.success('answer'); toastAnswer.info('answer');
    const calls = (await import('sonner')).toast as unknown as { __calls: Record<string, number> };
    expect(calls.__calls.success).toBe(1);
    expect(calls.__calls.info).toBe(1);
  });
});
