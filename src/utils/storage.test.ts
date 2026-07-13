import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJson, writeJson } from './storage';

describe('local storage helpers', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('writes and reads JSON values', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('window', { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
    writeJson('ratings', { overall: 8 });
    expect(readJson('ratings', null)).toEqual({ overall: 8 });
  });

  it('returns a fallback for invalid JSON', () => {
    vi.stubGlobal('window', { localStorage: { getItem: () => '{broken', setItem: () => undefined } });
    expect(readJson('ratings', { safe: true })).toEqual({ safe: true });
  });
});
