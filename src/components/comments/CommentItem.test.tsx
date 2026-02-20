import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { CommentWithReplies, Reply } from '../../core/domain/comment';
import { CommentItem } from './CommentItem';

const makeReply = (overrides?: Partial<Reply>): Reply => ({
  id: 'r1',
  commentId: 'c1',
  userId: 'u2',
  userName: 'Bob',
  userAvatar: null,
  body: 'A reply',
  status: 'published',
  createdAt: new Date().toISOString(),
  ...overrides,
});

const makeComment = (
  overrides?: Partial<CommentWithReplies>,
): CommentWithReplies => ({
  id: 'c1',
  postSlug: 'test-post',
  userId: 'u1',
  userName: 'Alice',
  userAvatar: null,
  body: 'Test comment',
  status: 'published',
  createdAt: new Date().toISOString(),
  replies: [],
  ...overrides,
});

const defaultProps = {
  onDelete: vi.fn(),
  onAddReply: vi.fn().mockResolvedValue(undefined),
  onDeleteReply: vi.fn(),
};

describe('CommentItem', () => {
  it('renders comment body and author', () => {
    render(
      <CommentItem
        comment={makeComment()}
        currentUserId={null}
        {...defaultProps}
      />,
    );
    expect(screen.getByText('Test comment')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows delete button for own comment', () => {
    render(
      <CommentItem
        comment={makeComment()}
        currentUserId="u1"
        {...defaultProps}
      />,
    );
    expect(
      screen.getByRole('button', { name: '댓글 삭제' }),
    ).toBeInTheDocument();
  });

  it('hides delete button for another user comment', () => {
    render(
      <CommentItem
        comment={makeComment()}
        currentUserId="u2"
        {...defaultProps}
      />,
    );
    expect(
      screen.queryByRole('button', { name: '댓글 삭제' }),
    ).not.toBeInTheDocument();
  });

  it('hides delete button when not logged in', () => {
    render(
      <CommentItem
        comment={makeComment()}
        currentUserId={null}
        {...defaultProps}
      />,
    );
    expect(
      screen.queryByRole('button', { name: '댓글 삭제' }),
    ).not.toBeInTheDocument();
  });

  it('shows reply count button when there are replies', () => {
    const comment = makeComment({ replies: [makeReply()] });
    render(
      <CommentItem comment={comment} currentUserId={null} {...defaultProps} />,
    );
    expect(screen.getByText('답글 1개')).toBeInTheDocument();
  });

  it('expands replies when reply count button is clicked', async () => {
    const user = userEvent.setup();
    const comment = makeComment({ replies: [makeReply()] });
    render(
      <CommentItem comment={comment} currentUserId={null} {...defaultProps} />,
    );

    await user.click(screen.getByText('답글 1개'));
    expect(screen.getByText('A reply')).toBeInTheDocument();
  });

  it('collapses replies when "답글 접기" is clicked', async () => {
    const user = userEvent.setup();
    const comment = makeComment({ replies: [makeReply()] });
    render(
      <CommentItem comment={comment} currentUserId={null} {...defaultProps} />,
    );

    await user.click(screen.getByText('답글 1개'));
    expect(screen.getByText('A reply')).toBeInTheDocument();

    await user.click(screen.getByText('답글 접기'));
    expect(screen.queryByText('A reply')).not.toBeInTheDocument();
  });

  it('shows reply form button only when logged in', () => {
    render(
      <CommentItem
        comment={makeComment()}
        currentUserId="u1"
        {...defaultProps}
      />,
    );
    expect(screen.getByText('답글')).toBeInTheDocument();
  });

  it('hides reply form button when not logged in', () => {
    render(
      <CommentItem
        comment={makeComment()}
        currentUserId={null}
        {...defaultProps}
      />,
    );
    expect(screen.queryByText('답글')).not.toBeInTheDocument();
  });
});
