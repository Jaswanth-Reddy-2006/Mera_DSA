'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import ProblemsTable from '@/components/problems-table';
import AddProblemModal from '@/components/add-problem-modal';
import { ProblemData } from '@/types';
import { exportProblemsToCSV, exportProblemsToPDF } from '@/lib/export-import-utils';
import { PlusCircle, RefreshCw, ShieldAlert, FileText, Download, Upload } from 'lucide-react';

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

  // Handle JSON / CSV file import
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();

      // If JSON backup file
      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        const problemsArray = parsed.problems || (Array.isArray(parsed) ? parsed : []);

        const res = await fetch('/api/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problems: problemsArray }),
        });

        if (res.ok) {
          const result = await res.json();
          alert(`Successfully imported ${result.importedCount || 0} problems!`);
          fetchProblems();
        }
      } else {
        alert('Please upload a valid JSON backup file.');
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Error parsing import file.');
    }
  };

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
              <h2 className="text-xl font-bold text-slate-100">All Solved Problems ({problems.length})</h2>
              <p className="text-xs text-slate-400">Click title or platform link to open problem details & code solutions.</p>
            </div>

            {/* Export & Add Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => exportProblemsToPDF(problems)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Export complete problem vault as PDF"
              >
                <FileText className="w-4 h-4 text-cyan-400" /> Export PDF
              </button>

              <button
                onClick={() => exportProblemsToCSV(problems)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Export problems table to Excel CSV"
              >
                <Download className="w-4 h-4 text-emerald-400" /> Export Excel
              </button>

              {!isGuest && (
                <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <Upload className="w-4 h-4 text-purple-400" /> Import JSON
                  <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                </label>
              )}

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
