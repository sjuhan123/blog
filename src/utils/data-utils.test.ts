import { describe, expect, it, vi } from 'vitest';

import { getAllTags, getPostsByTag, sortItemsByDateDesc } from './data-utils';

// Minimal shape that satisfies the functions under test
type MockPost = {
  data: {
    publishDate: Date;
    tags: string[];
  };
};

const makePost = (tags: string[], publishDate: string): MockPost => ({
  data: { tags, publishDate: new Date(publishDate) },
});

describe('sortItemsByDateDesc', () => {
  it('sorts newer posts first', () => {
    const older = makePost([], '2024-01-01');
    const newer = makePost([], '2024-06-01');
    const result = [older, newer].sort(sortItemsByDateDesc as never);
    expect(result[0]).toBe(newer);
    expect(result[1]).toBe(older);
  });

  it('keeps equal-date posts in stable relative order (returns 0)', () => {
    const a = makePost([], '2024-01-01');
    const b = makePost([], '2024-01-01');
    expect(sortItemsByDateDesc(a as never, b as never)).toBe(0);
  });
});

describe('getAllTags', () => {
  it('returns unique tags with slugs', () => {
    const posts = [
      makePost(['TypeScript', 'React'], '2024-01-01'),
      makePost(['TypeScript'], '2024-02-01'),
    ];
    const tags = getAllTags(posts as never);
    expect(tags).toHaveLength(2);
    const names = tags.map((t) => t.name);
    expect(names).toContain('TypeScript');
    expect(names).toContain('React');
  });

  it('deduplicates tags with the same slug', () => {
    const posts = [
      makePost(['React'], '2024-01-01'),
      makePost(['react'], '2024-02-01'),
    ];
    const tags = getAllTags(posts as never);
    // 'React' and 'react' both slugify to 'react'
    expect(tags).toHaveLength(1);
  });

  it('handles posts with no tags', () => {
    const posts = [makePost([], '2024-01-01')];
    expect(getAllTags(posts as never)).toHaveLength(0);
  });
});

describe('getPostsByTag', () => {
  it('returns posts that include the given tag slug', () => {
    const tsPost = makePost(['TypeScript'], '2024-01-01');
    const reactPost = makePost(['React'], '2024-02-01');
    const result = getPostsByTag([tsPost, reactPost] as never, 'typescript');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(tsPost);
  });

  it('returns empty array when no posts match the tag', () => {
    const posts = [makePost(['Vue'], '2024-01-01')];
    expect(getPostsByTag(posts as never, 'react')).toHaveLength(0);
  });

  it('matches multiple posts with the same tag', () => {
    const posts = [
      makePost(['React'], '2024-01-01'),
      makePost(['React', 'TypeScript'], '2024-02-01'),
    ];
    expect(getPostsByTag(posts as never, 'react')).toHaveLength(2);
  });
});
