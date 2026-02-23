import { useEffect, useState } from 'react';

import MemoryPanel from './MemoryPanel';
import type { Date } from '../types/date';

interface Props {
  datesPosted: Date[];
  totalPosts: number;
}

type MemoryDate = { year: number; month: number; day: number };

const Memory404 = ({ datesPosted, totalPosts }: Props) => {
  const [memoryDate, setMemoryDate] = useState<MemoryDate | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/memory\/(\d{4})\/(\d{2})\/(\d{2})\/?$/);
    if (match) {
      setMemoryDate({
        year: parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3]),
      });
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (memoryDate) {
    const { year, month, day } = memoryDate;
    return (
      <div className="flex flex-col gap-6">
        <MemoryPanel
          datesPosted={datesPosted}
          initialYear={year}
          initialMonth={month}
          currentDay={day}
          totalPosts={totalPosts}
        />
        <div>
          <div className="mb-1 text-sm text-main/50">
            {year}.{String(month).padStart(2, '0')}.{String(day).padStart(2, '0')}
          </div>
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg bg-muted p-7 shadow">
            <p className="text-sm text-main/50">이 날의 기록이 없어요.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-6xl font-bold text-main/20">404</p>
      <p className="text-main/50">페이지를 찾을 수 없어요.</p>
      <a href="/" className="text-sm underline">
        홈으로 돌아가기
      </a>
    </div>
  );
};

export default Memory404;
