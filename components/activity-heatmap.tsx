'use client';

import { useMemo } from 'react';
import { subDays, format, startOfWeek, addDays } from 'date-fns';

interface ActivityHeatmapProps {
  activityData: Record<string, number>; // 'YYYY-MM-DD' -> count
}

export default function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 0 }); // ~52 weeks ago
    const weeksArr: Date[][] = [];

    let current = startDate;
    while (current <= today) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current = addDays(current, 1);
      }
      weeksArr.push(week);
    }
    return weeksArr;
  }, []);

  const getColorClass = (count: number) => {
    if (!count) return 'bg-slate-900 border-slate-800';
    if (count === 1) return 'bg-cyan-900/60 border-cyan-700/60 text-cyan-200';
    if (count === 2) return 'bg-cyan-600 border-cyan-500 text-slate-950';
    if (count === 3) return 'bg-cyan-400 border-cyan-300 text-slate-950';
    return 'bg-emerald-400 border-emerald-300 text-slate-950';
  };

  return (
    <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl font-sans space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Activity & Practice Heatmap</h3>
          <p className="text-xs text-slate-500">Track your daily problem solving & revision consistency</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>Less</span>
          <div className="w-3 h-3 bg-slate-900 border border-slate-800 rounded-xs" />
          <div className="w-3 h-3 bg-cyan-900/60 border border-cyan-700/60 rounded-xs" />
          <div className="w-3 h-3 bg-cyan-600 border border-cyan-500 rounded-xs" />
          <div className="w-3 h-3 bg-cyan-400 border border-cyan-300 rounded-xs" />
          <div className="w-3 h-3 bg-emerald-400 border border-emerald-300 rounded-xs" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day, dIdx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const count = activityData[dateKey] || 0;
                return (
                  <div
                    key={dIdx}
                    title={`${dateKey}: ${count} activity point(s)`}
                    className={`w-3.5 h-3.5 rounded-sm border transition-all ${getColorClass(count)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
