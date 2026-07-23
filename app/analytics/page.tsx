'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import AddProblemModal from '@/components/add-problem-modal';
import AnalyticsCharts from '@/components/analytics-charts';
import ActivityHeatmap from '@/components/activity-heatmap';
import { AnalyticsStats, ProblemData } from '@/types';
import { Trophy, ExternalLink, Clock, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/analytics'), fetch('/api/problems')])
      .then(async ([sRes, pRes]) => {
        if (sRes.ok) setStats(await sRes.json());
        if (pRes.ok) setProblems(await pRes.json());
      })
      .finally(() => setLoading(false));
  }, []);

  const difficultyData = [
    { name: 'Easy', value: stats?.easyCount || 0, color: '#10b981' },
    { name: 'Medium', value: stats?.mediumCount || 0, color: '#f59e0b' },
    { name: 'Hard', value: stats?.hardCount || 0, color: '#f43f5e' },
  ];

  const platformData = Object.entries(stats?.platformCounts || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const topicData = Object.entries(stats?.topicCounts || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Daily Analytics & Platform Metrics" subtitle="Track Daily Performance & Data Structure Coverage" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-3 bg-cyan-950/60 border border-cyan-800/40 rounded-xl text-cyan-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Questions Added Today</span>
                <span className="text-2xl font-extrabold text-cyan-300">{stats?.solvedTodayCount ?? 0}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-emerald-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Revisions Done Today</span>
                <span className="text-2xl font-extrabold text-emerald-300">{stats?.revisedTodayCount ?? 0}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-3 bg-purple-950/60 border border-purple-800/40 rounded-xl text-purple-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Total Solved Problems</span>
                <span className="text-2xl font-extrabold text-purple-300">{stats?.totalSolved ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Daily Activity Heatmap */}
          <ActivityHeatmap activityData={stats?.activityCalendar || {}} />

          {/* Direct Platform Links Section */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cyan-400" /> Platform Direct Problem Links
            </h3>
            <p className="text-xs text-slate-400">Click any problem link below to open the external platform problem directly</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {problems.map((p) => (
                <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">{p.title}</span>
                  {p.problemUrl ? (
                    <a
                      href={p.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono shrink-0"
                    >
                      {p.platform} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">{p.platform}</span>
                  )}
                </div>
              ))}

              {problems.length === 0 && !loading && (
                <div className="col-span-full p-8 text-center text-slate-500 text-xs">
                  No problem links stored yet. Add problems to see platform links.
                </div>
              )}
            </div>
          </div>

          {/* Recharts Analytics Visualizations */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading analytics breakdown...</div>
          ) : (
            <AnalyticsCharts
              difficultyData={difficultyData}
              platformData={platformData}
              topicData={topicData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
