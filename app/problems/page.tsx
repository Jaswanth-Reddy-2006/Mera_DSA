'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import ProblemsTable from '@/components/problems-table';
import AddProblemModal from '@/components/add-problem-modal';
import { ProblemData } from '@/types';
import { PlusCircle, RefreshCw, ShieldAlert } from 'lucide-react';

export default function ProblemsPage() {
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

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/problems');
      if (res.ok) {
        const data = await res.json();
        setProblems(data);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const isGuest = userRole === 'guest';

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Problems Storage" subtitle="Interactive Problem Grid" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">All Solved Problems</h2>
              <p className="text-xs text-slate-400">Click title or platform link to open problem details & code solutions.</p>
            </div>

            {isGuest ? (
              <span className="px-3 py-1.5 bg-purple-950/60 border border-purple-800/60 rounded-xl text-purple-300 text-xs font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-400" /> Read-Only Guest Access
              </span>
            ) : (
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Add Problem
              </button>
            )}
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="p-12 bg-slate-900/80 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading problems grid...
            </div>
          ) : (
            <ProblemsTable initialData={problems} onRefresh={fetchProblems} />
          )}
        </main>
      </div>

      {!isGuest && (
        <AddProblemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onCreated={fetchProblems} />
      )}
    </div>
  );
}
