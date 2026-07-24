'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import AddProblemModal from '@/components/add-problem-modal';
import ActivityHeatmap from '@/components/activity-heatmap';
import { ProblemData, AnalyticsStats } from '@/types';
import { getRevisionStatus } from '@/lib/spaced-repetition';
import {
  PlusCircle,
  ArrowRight,
  BookOpen,
  Repeat,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'guest' | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUserRole(data.role))
      .catch(() => setUserRole('guest'));
  }, []);

  const isGuest = userRole === 'guest';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, probsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/problems'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (probsRes.ok) {
        const probsData = await probsRes.json();
        setProblems(probsData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter problems due for revision under 1-2-4-8 week schedule
  const dueProblems = problems.filter((p) => {
    const status = getRevisionStatus(p.lastRevisedAt, p.revisionCount);
    return status.isDue;
  });

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Dashboard" subtitle="Personal Knowledge Vault & Revision Tracker" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Welcome Header Bar */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-100">MERA DSA Vault</h2>
              <p className="text-xs text-slate-400">Track your problem storage, 1-2-4-8 week spaced revisions, and daily practice.</p>
            </div>

            <div className="flex items-center gap-3">
              {isGuest ? (
                <span className="px-3 py-2 bg-purple-950/60 border border-purple-800/60 rounded-xl text-purple-300 text-xs font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-400" /> Read-Only Guest View
                </span>
              ) : (
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Add Problem
                </button>
              )}
              <Link
                href="/formula"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" /> Formula Sheet
              </Link>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Solved Card */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Total Solved Problems</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100">{stats?.totalSolved ?? 0}</span>
                <span className="text-xs text-slate-500">questions</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold pt-1">
                <span className="text-emerald-400">E: {stats?.easyCount ?? 0}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400">M: {stats?.mediumCount ?? 0}</span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400">H: {stats?.hardCount ?? 0}</span>
              </div>
            </div>

            {/* Added Today */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Added Today</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-cyan-400">{stats?.solvedTodayCount ?? 0}</span>
                <span className="text-xs text-slate-500">new problems</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">Logged to vault today</p>
            </div>

            {/* Revised Today */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Revised Today</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400">{stats?.revisedTodayCount ?? 0}</span>
                <span className="text-xs text-slate-500">revisions completed</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">Memory reinforced</p>
            </div>

            {/* Due For Revision Card */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Due For Revision</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-400">{stats?.dueForRevisionCount ?? 0}</span>
                <span className="text-xs text-slate-500">questions</span>
              </div>
              <Link href="/revision" className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1 pt-1">
                View Queue <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Activity Heatmap */}
          <ActivityHeatmap activityData={stats?.activityCalendar || {}} />

          {/* Due For Revision Problems List */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-purple-400" /> Problems Due For Revision (1-2-4-8 Week Schedule)
                </h3>
                <p className="text-xs text-slate-500">First revision after 1 week, then 2 weeks, 4 weeks, and 8 weeks</p>
              </div>
              <Link href="/revision" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {dueProblems.length > 0 ? (
                dueProblems.map((prob) => {
                  const status = getRevisionStatus(prob.lastRevisedAt, prob.revisionCount);
                  return (
                    <Link
                      key={prob.id}
                      href={`/problems/${prob.id}`}
                      className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl flex items-center justify-between transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-200 group-hover:text-purple-300 transition-colors">
                            {prob.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              prob.difficulty === 'Easy'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                                : prob.difficulty === 'Medium'
                                ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                                : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>Topic: {prob.topic}</span>
                          <span>•</span>
                          <span>Revised: {prob.revisionCount}x</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-semibold px-2.5 py-1 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {status.displayText}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No problems currently due for revision. Great work!
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {!isGuest && (
        <AddProblemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onCreated={fetchData} />
      )}
    </div>
  );
}
