import { useState } from 'react';

import Calender from './Calender';
import { monthlyGoals } from '../data/goals';
import type { Date } from '../types/date';

interface Props {
  datesPosted: Date[];
  initialYear: number;
  initialMonth: number;
  currentDay?: number;
  totalPosts: number;
}

const MemoryPanel = ({ datesPosted, initialYear, initialMonth, currentDay, totalPosts }: Props) => {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const goalKey = `${year}-${String(month).padStart(2, '0')}`;
  const goalText = monthlyGoals[goalKey] ?? '목표가 없습니다';

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="mb-1 text-sm text-gray-400">달력</div>
        <Calender
          datesPosted={datesPosted}
          year={year}
          month={month}
          highlightYear={initialYear}
          highlightMonth={initialMonth}
          currentDay={currentDay}
          onYearChange={setYear}
          onMonthChange={setMonth}
        />
      </div>
      <div>
        <div className="mb-1 text-sm text-gray-400">요약</div>
        <section className="flex min-h-[308px] flex-col gap-11 rounded-lg bg-white p-5 shadow">
          <div>
            <span className="text-sm text-gray-400">이달의 목표</span>
            <div className="mt-7">
              <span className="text-sm text-black">{goalText}</span>
            </div>
          </div>
          <div className="border-t border-gray-100">
            <div className="mt-7 flex flex-col gap-2">
              <span className="text-sm text-black">
                기록한 날 총{' '}
                <span className="underline decoration-sky-200 decoration-2 underline-offset-4">
                  {totalPosts}일
                </span>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MemoryPanel;
