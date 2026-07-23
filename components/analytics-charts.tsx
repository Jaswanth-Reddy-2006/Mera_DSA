'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface AnalyticsChartsProps {
  difficultyData: { name: string; value: number; color: string }[];
  platformData: { name: string; value: number }[];
  topicData: { name: string; value: number }[];
}

const PLATFORM_COLORS = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#6366f1'];

export default function AnalyticsCharts({
  difficultyData,
  platformData,
  topicData,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
      {/* Difficulty Breakdown Pie Chart */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Difficulty Distribution</h3>
          <p className="text-xs text-slate-500">Breakdown of Easy vs Medium vs Hard</p>
        </div>

        <div className="h-56 my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#f8fafc',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-semibold">
          {difficultyData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-slate-300">{d.name}: {d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Breakdown Bar Chart */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl">
        <h3 className="text-sm font-bold text-slate-100">Platforms Breakdown</h3>
        <p className="text-xs text-slate-500 mb-4">Where you solve your problems</p>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic Breakdown Bar Chart */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl md:col-span-2 lg:col-span-1">
        <h3 className="text-sm font-bold text-slate-100">Top Topics Solved</h3>
        <p className="text-xs text-slate-500 mb-4">Distribution by data structure & algorithm</p>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicData.slice(0, 6)} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="value" fill="#a855f7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
