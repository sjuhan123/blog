import { type CollectionEntry } from 'astro:content';
import { useState } from 'react';
import type { Entries } from '../types';
import CheckSVG from './CheckSVG';
import { GithubSVG } from './Github';

type Post = {
  id: {
    id: string;
    slug: string;
  };
};

interface Props {
  posts: CollectionEntry<'memory'>;
  currentYear?: number;
  currentMonth?: number;
  currentDay?: number;
  onYearChange?: (change: number) => void;
  onMonthChange?: (change: number) => void;
  onDayChange?: (change: number) => void;
}

const Calendar = ({
  posts,
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

  const datesPosted = (Object.entries(posts) as unknown as Entries<Post>).map(([_, { slug }]) => {
    const [year, month, day] = slug.split('-');
    return { year: parseInt(year), month: parseInt(month), day: parseInt(day) };
  });
  const totalDaysPosted = datesPosted.length;

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
      console.log('i', i, 'isCurrentDay', isCurrentDay, 'isPosted', isPosted);

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
    <section>
      <div className="flex flex-col p-5 gap-7 rounded-2xl bg-white shadow">
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
      </div>
      <div className="flex flex-row mt-6 pl-5">
        <div className="flex flex-col justify-end gap-2">
          <span className="text-sm">지금까지 기록한 날.</span>
          <span className="text-sm">기존 기록 공간.</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="ml-4 underline underline-offset-4 decoration-2 decoration-sky-200">{totalDaysPosted} 일</span>
          <a href="#" className="ml-2 hover:text-sky-400">
            <GithubSVG width={20} height={20} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Calendar;
