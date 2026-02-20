import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Calendar from './Calender';

const defaultProps = {
  datesPosted: [],
  year: 2024,
  month: 6,
  highlightYear: 2024,
  highlightMonth: 6,
  currentDay: 15,
  onYearChange: vi.fn(),
  onMonthChange: vi.fn(),
};

describe('Calendar year input', () => {
  it('renders the current year in the year input', () => {
    render(<Calendar {...defaultProps} />);
    const input = screen.getByDisplayValue('2024');
    expect(input).toBeInTheDocument();
  });

  it('calls onYearChange with the clamped value on blur', async () => {
    const onYearChange = vi.fn();
    render(<Calendar {...defaultProps} onYearChange={onYearChange} />);
    const input = screen.getByDisplayValue('2024');
    await userEvent.clear(input);
    await userEvent.type(input, '2025');
    await userEvent.tab(); // trigger blur
    expect(onYearChange).toHaveBeenCalledWith(2025);
  });

  it('clamps year below minimum (2023) to 2023', async () => {
    const onYearChange = vi.fn();
    render(<Calendar {...defaultProps} onYearChange={onYearChange} />);
    const input = screen.getByDisplayValue('2024');
    await userEvent.clear(input);
    await userEvent.type(input, '2000');
    await userEvent.tab();
    expect(onYearChange).toHaveBeenCalledWith(2023);
  });

  it('clamps year above current year to current year', async () => {
    const onYearChange = vi.fn();
    const currentYear = new Date().getFullYear();
    render(<Calendar {...defaultProps} onYearChange={onYearChange} />);
    const input = screen.getByDisplayValue('2024');
    await userEvent.clear(input);
    await userEvent.type(input, '9999');
    await userEvent.tab();
    expect(onYearChange).toHaveBeenCalledWith(currentYear);
  });

  it('resets to original year if non-numeric is entered on blur', async () => {
    const onYearChange = vi.fn();
    render(<Calendar {...defaultProps} onYearChange={onYearChange} />);
    const input = screen.getByDisplayValue('2024');
    await userEvent.clear(input);
    await userEvent.type(input, 'abc');
    await userEvent.tab();
    expect(onYearChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('2024');
  });
});

describe('Calendar month input', () => {
  it('renders the current month in the month input', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByDisplayValue('6')).toBeInTheDocument();
  });

  it('calls onMonthChange with valid month on blur', async () => {
    const onMonthChange = vi.fn();
    render(<Calendar {...defaultProps} onMonthChange={onMonthChange} />);
    const input = screen.getByDisplayValue('6');
    await userEvent.clear(input);
    await userEvent.type(input, '3');
    await userEvent.tab();
    expect(onMonthChange).toHaveBeenCalledWith(3);
  });

  it('clamps month below 1 to 1', async () => {
    const onMonthChange = vi.fn();
    render(<Calendar {...defaultProps} onMonthChange={onMonthChange} />);
    const input = screen.getByDisplayValue('6');
    await userEvent.clear(input);
    await userEvent.type(input, '0');
    await userEvent.tab();
    expect(onMonthChange).toHaveBeenCalledWith(1);
  });

  it('clamps month above 12 to 12', async () => {
    const onMonthChange = vi.fn();
    render(<Calendar {...defaultProps} onMonthChange={onMonthChange} />);
    const input = screen.getByDisplayValue('6');
    await userEvent.clear(input);
    await userEvent.type(input, '99');
    await userEvent.tab();
    expect(onMonthChange).toHaveBeenCalledWith(12);
  });

  it('commits month on Enter key', async () => {
    const onMonthChange = vi.fn();
    render(<Calendar {...defaultProps} onMonthChange={onMonthChange} />);
    const input = screen.getByDisplayValue('6');
    await userEvent.clear(input);
    await userEvent.type(input, '8{Enter}');
    expect(onMonthChange).toHaveBeenCalledWith(8);
  });
});
