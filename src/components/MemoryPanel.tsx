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

const MemoryPanel = ({
  datesPosted,
  initialYear,
  initialMonth,
  currentDay,
  totalPosts,
}: Props) => {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const goalKey = `${year}-${String(month).padStart(2, '0')}`;
  const goalText = monthlyGoals[goalKey] ?? '목표가 없습니다';

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <div className="mb-1 text-sm text-main/50">달력</div>
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
        <div className="mb-1 text-sm text-main/50">요약</div>
        <section className="flex min-h-[308px] flex-col gap-11 rounded-lg bg-muted p-5 shadow">
          <div>
            <span className="text-sm text-main/50">이달의 목표</span>
            <div className="mt-7">
              <span className="text-sm text-main">{goalText}</span>
            </div>
          </div>
          <div className="border-t border-main/20">
            <div className="mt-7 flex flex-col gap-2">
              <span className="text-sm text-main">
                기록한 날 총{' '}
                <span className="mr-1 font-semibold underline decoration-stone-400 decoration-2 underline-offset-4">
                  {totalPosts}
                </span>
                일
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MemoryPanel;
