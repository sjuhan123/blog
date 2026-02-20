import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CommentHeader } from './CommentHeader';

describe('CommentHeader', () => {
  it('displays comment count', () => {
    render(
      <CommentHeader count={5} sortOrder="newest" onToggleSort={vi.fn()} />,
    );
    expect(screen.getByText('5개의 댓글')).toBeInTheDocument();
  });

  it('shows "최신순" when sortOrder is newest', () => {
    render(
      <CommentHeader count={0} sortOrder="newest" onToggleSort={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: '최신순' })).toBeInTheDocument();
  });

  it('shows "오래된순" when sortOrder is oldest', () => {
    render(
      <CommentHeader count={0} sortOrder="oldest" onToggleSort={vi.fn()} />,
    );
    expect(
      screen.getByRole('button', { name: '오래된순' }),
    ).toBeInTheDocument();
  });

  it('calls onToggleSort when sort button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleSort = vi.fn();
    render(
      <CommentHeader
        count={0}
        sortOrder="newest"
        onToggleSort={onToggleSort}
      />,
    );

    await user.click(screen.getByRole('button', { name: '최신순' }));
    expect(onToggleSort).toHaveBeenCalledOnce();
  });

  it('shows 0개의 댓글 for empty list', () => {
    render(
      <CommentHeader count={0} sortOrder="newest" onToggleSort={vi.fn()} />,
    );
    expect(screen.getByText('0개의 댓글')).toBeInTheDocument();
  });
});
