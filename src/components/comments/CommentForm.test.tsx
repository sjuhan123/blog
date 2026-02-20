import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CommentForm } from './CommentForm';

describe('CommentForm', () => {
  it('renders textarea and submit button', () => {
    render(<CommentForm onSubmit={vi.fn()} />);
    expect(
      screen.getByPlaceholderText('댓글을 입력하세요...'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '작성' })).toBeInTheDocument();
  });

  it('submit button is disabled when textarea is empty', () => {
    render(<CommentForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: '작성' })).toBeDisabled();
  });

  it('submit button becomes enabled when text is entered', async () => {
    const user = userEvent.setup();
    render(<CommentForm onSubmit={vi.fn()} />);

    await user.type(
      screen.getByPlaceholderText('댓글을 입력하세요...'),
      'Hello',
    );
    expect(screen.getByRole('button', { name: '작성' })).not.toBeDisabled();
  });

  it('calls onSubmit with trimmed body on form submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CommentForm onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText('댓글을 입력하세요...'),
      '  Hello World  ',
    );
    await user.click(screen.getByRole('button', { name: '작성' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('Hello World');
    });
  });

  it('clears textarea after successful submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CommentForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('댓글을 입력하세요...');
    await user.type(textarea, 'Hello');
    await user.click(screen.getByRole('button', { name: '작성' }));

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      }),
    );
    render(<CommentForm onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText('댓글을 입력하세요...'),
      'Hello',
    );
    await user.click(screen.getByRole('button', { name: '작성' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '작성 중...' })).toBeDisabled();
    });

    await act(async () => {
      resolveSubmit();
    });
  });

  it('does not call onSubmit when body is only whitespace', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CommentForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('댓글을 입력하세요...'), '   ');
    // 버튼은 여전히 disabled (trim 후 빈 값)
    expect(screen.getByRole('button', { name: '작성' })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
