'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import AddProblemModal from '@/components/add-problem-modal';
import { ProblemData } from '@/types';
import { FolderKanban, ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/problems')
      .then((res) => res.json())
      .then((data) => setProblems(data))
      .finally(() => setLoading(false));
  }, []);

  // Group by Topic
  const categoryCounts = problems.reduce((acc: Record<string, number>, curr) => {
    const topic = curr.topic || 'General';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Categories & Topics" subtitle="DSA Topic Problem Counts" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Topic Breakdown</h2>
            <p className="text-xs text-slate-400">Select any topic card to view all categorized problems</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(categoryCounts).map(([topic, count]) => (
              <Link
                key={topic}
                href={`/problems?topic=${encodeURIComponent(topic)}`}
                className="p-5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl shadow-xl transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-cyan-950/60 border border-cyan-800/40 rounded-xl text-cyan-400">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-950 text-cyan-300 border border-slate-800">
                    ({count})
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-extrabold text-base text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {topic}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold group-hover:text-cyan-400">
                    <span>View Problems</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}

            {Object.keys(categoryCounts).length === 0 && !loading && (
              <div className="col-span-full p-12 text-center text-slate-500 text-sm bg-slate-900/80 border border-slate-800 rounded-2xl">
                No topic categories found yet. Add problems to see category breakdown!
              </div>
            )}
          </div>
        </main>
      </div>

      <AddProblemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
