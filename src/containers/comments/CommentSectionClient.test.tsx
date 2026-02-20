import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AuthUser, CommentWithReplies } from '../../core/domain/comment';
import { AuthUseCases, CommentUseCases } from '../../core/usecases/comment';

// supabase 클라이언트를 mock (default use cases 생성 시 초기화 방지)
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

import CommentSectionClient from './CommentSectionClient';

const mockComment: CommentWithReplies = {
  id: 'c1',
  postSlug: 'test-post',
  userId: 'u1',
  userName: 'Alice',
  userAvatar: null,
  body: 'Hello world',
  status: 'published',
  createdAt: new Date().toISOString(),
  replies: [],
};

const mockUser: AuthUser = {
  id: 'u1',
  name: 'Alice',
  avatar: null,
  email: 'alice@example.com',
};

const createMockCommentUseCases = (
  overrides?: Partial<{
    fetchComments: () => Promise<CommentWithReplies[]>;
  }>,
) =>
  ({
    fetchComments: vi.fn().mockResolvedValue([mockComment]),
    addComment: vi.fn().mockResolvedValue(mockComment),
    deleteComment: vi.fn().mockResolvedValue(undefined),
    addReply: vi.fn().mockResolvedValue({ ...mockComment, id: 'r1' }),
    deleteReply: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as CommentUseCases;

const createMockAuthUseCases = (user: AuthUser | null = null) =>
  ({
    getUser: vi.fn().mockResolvedValue(user),
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    onAuthStateChange: vi.fn().mockReturnValue(() => {}),
  }) as unknown as AuthUseCases;

describe('CommentSectionClient', () => {
  it('shows LoginPrompt when not logged in', async () => {
    render(
      <CommentSectionClient
        postSlug="test-post"
        commentUseCases={createMockCommentUseCases()}
        authUseCases={createMockAuthUseCases(null)}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText('로그인하고 댓글을 작성하세요.'),
      ).toBeInTheDocument();
    });
  });

  it('shows CommentForm and AuthGate when logged in', async () => {
    render(
      <CommentSectionClient
        postSlug="test-post"
        commentUseCases={createMockCommentUseCases()}
        authUseCases={createMockAuthUseCases(mockUser)}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('댓글을 입력하세요...'),
      ).toBeInTheDocument();
      // AuthGate에서만 로그아웃 버튼이 렌더링됨
      expect(
        screen.getByRole('button', { name: '로그아웃' }),
      ).toBeInTheDocument();
    });
  });

  it('displays fetched comments', async () => {
    render(
      <CommentSectionClient
        postSlug="test-post"
        commentUseCases={createMockCommentUseCases()}
        authUseCases={createMockAuthUseCases(null)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });

  it('toggles sort order label on button click', async () => {
    const user = userEvent.setup();
    render(
      <CommentSectionClient
        postSlug="test-post"
        commentUseCases={createMockCommentUseCases()}
        authUseCases={createMockAuthUseCases(null)}
      />,
    );

    await waitFor(() => screen.getByText('최신순'));
    await user.click(screen.getByText('최신순'));
    expect(screen.getByText('오래된순')).toBeInTheDocument();
  });

  it('refetches comments when sort order changes', async () => {
    const user = userEvent.setup();
    const fetchComments = vi.fn().mockResolvedValue([mockComment]);
    render(
      <CommentSectionClient
        postSlug="test-post"
        commentUseCases={
          createMockCommentUseCases({ fetchComments }) as CommentUseCases
        }
        authUseCases={createMockAuthUseCases(null)}
      />,
    );

    await waitFor(() => expect(fetchComments).toHaveBeenCalledTimes(1));

    await user.click(screen.getByText('최신순'));

    await waitFor(() => expect(fetchComments).toHaveBeenCalledTimes(2));
    expect(fetchComments).toHaveBeenLastCalledWith('test-post', 'oldest');
  });

  it('shows 0개의 댓글 count header', async () => {
    render(
      <CommentSectionClient
        postSlug="test-post"
        commentUseCases={createMockCommentUseCases({
          fetchComments: vi.fn().mockResolvedValue([]),
        })}
        authUseCases={createMockAuthUseCases(null)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('0개의 댓글')).toBeInTheDocument();
    });
  });
});
