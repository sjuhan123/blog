import { useEffect, useState } from 'react';

import CheckSVG from './CheckSVG';
import type { Date } from '../types/date';

interface Props {
  datesPosted: Date[];
  year: number;
  month: number;
  highlightYear: number;
  highlightMonth: number;
  currentDay?: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

const Calendar = ({
  datesPosted,
  year,
  month,
  highlightYear,
  highlightMonth,
  currentDay = new Date().getDate(),
  onYearChange,
  onMonthChange,
}: Props) => {
  const [yearInput, setYearInput] = useState(String(year));
  const [monthInput, setMonthInput] = useState(String(month));

  useEffect(() => {
    setYearInput(String(year));
  }, [year]);

  useEffect(() => {
    setMonthInput(String(month));
  }, [month]);

  const commitYear = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      setYearInput(String(year));
      return;
    }
    const clamped = Math.min(Math.max(parsed, 2023), new Date().getFullYear());
    setYearInput(String(clamped));
    onYearChange(clamped);
  };

  const commitMonth = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      setMonthInput(String(month));
      return;
    }
    const clamped = Math.min(Math.max(parsed, 1), 12);
    setMonthInput(String(clamped));
    onMonthChange(clamped);
  };

  return (
    <section className="flex min-h-[308px] flex-col gap-7 rounded-lg bg-muted p-5 shadow">
      <div className="grid grid-cols-2">
        <div className="grid grid-cols-2 justify-items-center">
          <span className="text-main/50">Year</span>
          <input
            type="text"
            inputMode="numeric"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            onBlur={() => commitYear(yearInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitYear(yearInput);
            }}
            style={{ width: `${yearInput.length + 0.5}ch` }}
            className="min-w-[2ch] border-b-2 border-stone-400 bg-transparent text-center text-main focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 justify-items-center">
          <span className="text-main/50">Month</span>
          <input
            type="text"
            inputMode="numeric"
            value={monthInput}
            onChange={(e) => setMonthInput(e.target.value)}
            onBlur={() => commitMonth(monthInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitMonth(monthInput);
            }}
            style={{ width: `${monthInput.length + 0.5}ch` }}
            className="min-w-[2ch] border-b-2 border-stone-400 bg-transparent text-center text-main focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-7 justify-items-center gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div key={`day-${dayName}`} className="text-main/50">
            {dayName}
          </div>
        ))}
        {renderCalendar(
          year,
          month,
          currentDay,
          datesPosted,
          highlightYear,
          highlightMonth,
        )}
      </div>
    </section>
  );
};

export default Calendar;

const renderCalendar = (
  year: number,
  month: number,
  day: number,
  datesPosted: Date[],
  highlightYear: number,
  highlightMonth: number,
) => {
  const totalDays = daysInMonth(year, month);
  const startingDay = firstDayOfWeek(year, month);

  const prevMonthDays = Array.from({ length: startingDay }, (_, i) => (
    <div key={`prev${i}`} className="other-month" />
  ));

  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => {
    const dayNumber = i + 1;

    const isPosted = datesPosted.some(
      (date) =>
        date.year === year && date.month === month && date.day === dayNumber,
    );

    const isCurrentDay =
      dayNumber === day && year === highlightYear && month === highlightMonth;

    const innerClass = isCurrentDay
      ? 'font-bold underline decoration-stone-400 decoration-[3px] underline-offset-4'
      : 'hover:underline hover:decoration-stone-400 hover:decoration-[3px] hover:underline-offset-4';

    return (
      <div key={`day-${dayNumber}`} className="relative cursor-pointer text-main">
        {isPosted ? (
          <a
            href={`/memory/${year}/${month < 10 ? `0${month}` : month}/${dayNumber < 10 ? `0${dayNumber}` : dayNumber}`}
            className={isCurrentDay ? innerClass : `no-underline ${innerClass}`}
          >
            {dayNumber}
            <div className="absolute left-4 top-0">
              <CheckSVG width={10} height={10} />
            </div>
          </a>
        ) : (
          <span className={innerClass}>{dayNumber}</span>
        )}
      </div>
    );
  });

  const nextMonthDaysCount =
    (7 - ((prevMonthDays.length + currentMonthDays.length) % 7)) % 7;

  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => (
    <div key={`next${i}`} className="other-month" />
  ));

  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
};

const daysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const firstDayOfWeek = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay();
};
