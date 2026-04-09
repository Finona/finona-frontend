// Лаба 5 - Unit-тесты утилит
import { describe, it, expect } from 'vitest';
import { cn, utcToLocal, localToUtc } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('merges tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

describe('utcToLocal', () => {
  it('returns a Date object', () => {
    const result = utcToLocal('2026-03-31T12:00:00Z');
    expect(result).toBeInstanceOf(Date);
  });

  it('parses ISO string correctly', () => {
    const result = utcToLocal('2026-01-15T00:00:00Z');
    expect(result.getFullYear()).toBe(2026);
  });
});

describe('localToUtc', () => {
  it('returns ISO string', () => {
    const date = new Date(2026, 0, 15, 12, 0, 0);
    const result = localToUtc(date);
    expect(result).toContain('2026-01-15');
    expect(result).toContain('T');
  });
});
