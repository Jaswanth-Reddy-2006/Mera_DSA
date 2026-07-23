'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import AddProblemModal from '@/components/add-problem-modal';
import { ProblemData } from '@/types';
import { getRevisionStatus } from '@/lib/spaced-repetition';
import { Repeat, AlertCircle, Clock, ArrowRight } from 'lucide-react';

export default function RevisionPage() {
  const [allProblems, setAllProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'due' | 'all'>('due');

  useEffect(() => {
    fetch('/api/problems')
      .then((res) => res.json())
      .then((data) => setAllProblems(data))
      .finally(() => setLoading(false));
  }, []);

  const dueProblems = allProblems.filter((p) => {
    const status = getRevisionStatus(p.lastRevisedAt, p.revisionCount);
    return status.isDue;
  });

  const activeList = filterMode === 'due' ? dueProblems : allProblems;

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Spaced Repetition Engine" subtitle="1 Week, 2 Weeks, 4 Weeks & 8 Weeks Schedule" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Card */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-950/60 border border-purple-800/40 rounded-2xl text-purple-400">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Revision Queue</h2>
                <p className="text-xs text-slate-400">Schedule: Rev 1 &rarr; 7 days, Rev 2 &rarr; 14 days, Rev 3 &rarr; 28 days, Rev 4+ &rarr; 56 days</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                onClick={() => setFilterMode('due')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  filterMode === 'due'
                    ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Due Now ({dueProblems.length})
              </button>

              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                All Problems ({allProblems.length})
              </button>
            </div>
          </div>

          {/* List View */}
          <div className="space-y-3">
            {activeList.map((prob) => {
              const status = getRevisionStatus(prob.lastRevisedAt, prob.revisionCount);
              return (
                <Link
                  key={prob.id}
                  href={`/problems/${prob.id}`}
                  className="p-4 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl flex items-center justify-between transition-all group shadow-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-100 group-hover:text-purple-300 transition-colors">
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
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {prob.topic}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Platform: {prob.platform}</span>
                      <span>•</span>
                      <span>Revision count: {prob.revisionCount}x</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span
                      className={`font-semibold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                        status.isDue
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800/40 animate-pulse font-bold'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {status.isDue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                      {status.displayText}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}

            {activeList.length === 0 && !loading && (
              <div className="p-12 text-center text-slate-500 text-sm bg-slate-900/80 border border-slate-800 rounded-2xl">
                No problems currently due in this revision queue. Keep up the solid practice!
              </div>
            )}
          </div>
        </main>
      </div>

      <AddProblemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
