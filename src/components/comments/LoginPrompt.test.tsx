import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LoginPrompt } from './LoginPrompt';

describe('LoginPrompt', () => {
  it('renders login message', () => {
    render(<LoginPrompt onLogin={vi.fn()} />);
    expect(
      screen.getByText('로그인하고 댓글을 작성하세요.'),
    ).toBeInTheDocument();
  });

  it('renders Google login button', () => {
    render(<LoginPrompt onLogin={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Google 로그인' }),
    ).toBeInTheDocument();
  });

  it('calls onLogin when button is clicked', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginPrompt onLogin={onLogin} />);

    await user.click(screen.getByRole('button', { name: 'Google 로그인' }));
    expect(onLogin).toHaveBeenCalledOnce();
  });
});
