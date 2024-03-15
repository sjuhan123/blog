import { useState } from 'react';
import CheckSVG from './CheckSVG';
import type { Date } from '../types/date';

interface Props {
  datesPosted: Date[];
  currentYear?: number;
  currentMonth?: number;
  currentDay?: number;
  onYearChange?: (change: number) => void;
  onMonthChange?: (change: number) => void;
  onDayChange?: (change: number) => void;
}

const Calendar = ({
  datesPosted,
  currentYear = new Date().getFullYear(),
  currentMonth = new Date().getMonth() + 1,
  currentDay = new Date().getDate(),
  onYearChange,
  onMonthChange,
  onDayChange
}: Props) => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [day, setDay] = useState(currentDay);

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const firstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(year, month);
    const startingDay = firstDayOfWeek(year, month);

    let days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`prev${i}`} className="other-month" />);
    }

    for (let i = 1; i <= totalDays; i++) {
      const isCurrentDay = i === day && month === currentMonth && year === currentYear;
      const isPosted = datesPosted.some((date) => date.year === year && date.month === month && date.day === i);

      if (isPosted) {
        days.push(
          <a href={`/memory/${year}-${month < 10 ? `0${month}` : month}-${i}`} key={`next${i}`}>
            <div
              key={`curr${i}`}
              className={`relative cursor-pointer text-black hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-sky-200 hover:text-sky-400 ${isCurrentDay ? 'text-bold text-sky-400 underline underline-offset-4 decoration-2 decoration-sky-200' : ''}`}
            >
              {i}
              <div className="absolute top-0 left-4">
                <CheckSVG width={10} height={10} />
              </div>
            </div>
          </a>
        );
      } else {
        days.push(
          <div
            key={`next${i}`}
            className={`cursor-pointer text-black hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-sky-200 hover:text-sky-400 ${isCurrentDay ? 'text-bold text-sky-400 underline underline-offset-4 decoration-2 decoration-sky-200' : ''}`}
          >
            {i}
          </div>
        );
      }
    }

    const nextMonthDays = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);

    for (let i = 0; i < nextMonthDays; i++) {
      days.push(<div key={`next${i}`} className="other-month" />);
    }

    return days;
  };

  return (
    <section className="flex flex-col p-5 gap-7 rounded-lg bg-white shadow h-[308px]">
      <div className="grid grid-cols-2">
        <div className="grid grid-cols-2 justify-items-center">
          <span className="text-gray-400">Year</span>
          <span className="text-black underline underline-offset-4 decoration-2 decoration-sky-200">{year.toString().slice(2)}</span>
        </div>
        <div className="grid grid-cols-2 justify-items-center">
          <span className="text-gray-400">Month</span>
          <span className="text-black underline underline-offset-4 decoration-2 decoration-sky-200">{month < 10 ? `0${month}` : month}</span>
        </div>
      </div>
      <div className="grid grid-cols-7 justify-items-center gap-2">
        <div className="text-gray-400">Sun</div>
        <div className="text-gray-400">Mon</div>
        <div className="text-gray-400">Tue</div>
        <div className="text-gray-400">Wed</div>
        <div className="text-gray-400">Thu</div>
        <div className="text-gray-400">Fri</div>
        <div className="text-gray-400">Sat</div>
        {renderCalendar()}
      </div>
    </section>
  );
};

export default Calendar;
