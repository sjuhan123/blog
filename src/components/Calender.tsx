import { useState } from 'react';
import CheckSVG from './CheckSVG';
import type { Date } from '../types/date';

interface Props {
  datesPosted: Date[];
  currentYear?: number;
  currentMonth?: number;
  currentDay?: number;
}
const Calendar = ({
  datesPosted,
  currentYear = new Date().getFullYear(),
  currentMonth = new Date().getMonth() + 1,
  currentDay = new Date().getDate(),
}: Props) => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newYear = parseInt(event.target.value);
    if (isNaN(newYear)) return;

    if (newYear < 2023) {
      newYear = 2023;
    } else if (newYear > new Date().getFullYear()) {
      newYear = new Date().getFullYear();
    }
    setYear(newYear);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newMonth = parseInt(event.target.value);
    if (isNaN(newMonth)) return;

    if (newMonth < 1) {
      newMonth = 1;
    } else if (newMonth > 12) {
      newMonth = 12;
    }
    setMonth(newMonth);
  };

  return (
    <section className="flex h-[308px] flex-col gap-7 rounded-lg bg-white p-5 shadow">
      <div className="grid grid-cols-2">
        <div className="grid grid-cols-2 justify-items-center">
          <span className="text-gray-400">Year</span>
          <input
            type="number"
            value={year}
            onChange={handleYearChange}
            className="flex w-full text-center text-black underline decoration-sky-200 decoration-2 underline-offset-4 focus:outline-none"
            min={2023}
            max={new Date().getFullYear()}
          />
        </div>
        <div className="grid grid-cols-2 justify-items-center">
          <span className="text-gray-400">Month</span>
          <input
            type="number"
            value={month}
            onChange={handleMonthChange}
            className="flex w-full text-center text-black underline decoration-sky-200 decoration-2 underline-offset-4 focus:outline-none"
            min={1}
            max={12}
          />
        </div>
      </div>
      <div className="grid grid-cols-7 justify-items-center gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div key={`day-${dayName}`} className="text-gray-400">
            {dayName}
          </div>
        ))}
        {renderCalendar(
          year,
          month,
          currentDay,
          datesPosted,
          currentYear,
          currentMonth,
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
  currentYear: number,
  currentMonth: number,
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
      dayNumber === day && month === currentMonth && year === currentYear;

    const dayClassName = `relative cursor-pointer text-black hover:text-sky-400 hover:underline hover:decoration-sky-200 hover:decoration-2 hover:underline-offset-4 ${
      isCurrentDay
        ? 'font-bold text-sky-400 underline decoration-sky-200 decoration-2 underline-offset-4'
        : ''
    }`;

    return (
      <div key={`day-${dayNumber}`} className={dayClassName}>
        {isPosted ? (
          <a
            href={`/memory/${year}-${month < 10 ? `0${month}` : month}-${dayNumber < 10 ? `0${dayNumber}` : dayNumber}`}
          >
            {dayNumber}
            <div className="absolute left-4 top-0">
              <CheckSVG width={10} height={10} />
            </div>
          </a>
        ) : (
          dayNumber
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
