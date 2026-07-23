'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import AddProblemModal from '@/components/add-problem-modal';
import { ProblemData } from '@/types';
import { Network, ArrowRight, Brain } from 'lucide-react';

export default function KnowledgeGraphPage() {
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/problems')
      .then((res) => res.json())
      .then((data) => setProblems(data))
      .finally(() => setLoading(false));
  }, []);

  const patternClusters = problems.reduce((acc: Record<string, ProblemData[]>, curr) => {
    const key = curr.topic || 'Core Concept';
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Knowledge Graph" subtitle="Concept & Pattern Relationship Network" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Pattern Interconnection Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">DSA Pattern Connections</h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Connect Two Sum &rarr; HashMap &rarr; Complement &rarr; Frequency Counting &rarr; 3Sum &rarr; 4Sum to recognize underlying algorithmic structures.
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(patternClusters).map(([topic, probs]) => (
              <div key={topic} className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-cyan-400 flex items-center gap-2">
                    <Network className="w-4 h-4" /> Topic Hub: {topic} ({probs.length})
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Linked Pattern Graph</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {probs.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <Link
                        href={`/problems/${p.id}`}
                        className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition-all group"
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors block">
                            {p.title}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span>{p.pattern || 'Pattern Linked'}</span>
                            <span>•</span>
                            <span
                              className={
                                p.difficulty === 'Easy'
                                  ? 'text-emerald-400'
                                  : p.difficulty === 'Medium'
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }
                            >
                              {p.difficulty}
                            </span>
                          </div>
                        </div>
                      </Link>

                      {idx < probs.length - 1 && (
                        <div className="flex items-center gap-1 text-cyan-500/60 font-mono text-xs">
                          <ArrowRight className="w-4 h-4 animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <AddProblemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
