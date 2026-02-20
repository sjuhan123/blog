import { describe, expect, it } from 'vitest';

import { sortComments } from './comment';
import type { CommentWithReplies } from './comment';

const makeComment = (id: string, createdAt: string): CommentWithReplies => ({
  id,
  postSlug: 'test-post',
  userId: 'u1',
  userName: 'User',
  userAvatar: null,
  body: 'body',
  status: 'published',
  createdAt,
  replies: [],
});

describe('sortComments', () => {
  it('sorts newest first', () => {
    const comments = [
      makeComment('1', '2024-01-01T00:00:00Z'),
      makeComment('2', '2024-03-01T00:00:00Z'),
      makeComment('3', '2024-02-01T00:00:00Z'),
    ];
    const sorted = sortComments(comments, 'newest');
    expect(sorted.map((c) => c.id)).toEqual(['2', '3', '1']);
  });

  it('sorts oldest first', () => {
    const comments = [
      makeComment('1', '2024-01-01T00:00:00Z'),
      makeComment('2', '2024-03-01T00:00:00Z'),
      makeComment('3', '2024-02-01T00:00:00Z'),
    ];
    const sorted = sortComments(comments, 'oldest');
    expect(sorted.map((c) => c.id)).toEqual(['1', '3', '2']);
  });

  it('does not mutate the original array', () => {
    const comments = [
      makeComment('1', '2024-01-01T00:00:00Z'),
      makeComment('2', '2024-03-01T00:00:00Z'),
    ];
    const original = [...comments];
    sortComments(comments, 'newest');
    expect(comments).toEqual(original);
  });

  it('returns empty array unchanged', () => {
    expect(sortComments([], 'newest')).toEqual([]);
  });

  it('handles single element', () => {
    const comments = [makeComment('1', '2024-01-01T00:00:00Z')];
    expect(sortComments(comments, 'newest')).toEqual(comments);
  });
});
