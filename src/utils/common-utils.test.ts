import { describe, expect, it } from 'vitest';

import { slugify } from './common-utils';

describe('slugify', () => {
  it('returns empty string for undefined input', () => {
    expect(slugify(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('collapses multiple spaces into one hyphen', () => {
    expect(slugify('foo  bar')).toBe('foo-bar');
  });

  it('strips non-ASCII characters like Korean', () => {
    expect(slugify('한글 태그')).toBe('');
  });

  it('removes special characters', () => {
    expect(slugify('hello! world?')).toBe('hello-world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });

  it('handles accented characters by stripping accents', () => {
    expect(slugify('café')).toBe('cafe');
  });

  it('preserves hyphens between words', () => {
    expect(slugify('foo-bar')).toBe('foo-bar');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('foo--bar')).toBe('foo-bar');
  });
});
