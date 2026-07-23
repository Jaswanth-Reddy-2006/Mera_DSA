'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import MonacoCodeEditor from '@/components/monaco-code-editor';
import MarkdownEditor from '@/components/markdown-editor';
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Repeat,
  Code2,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Zap,
} from 'lucide-react';

interface SolutionTab {
  id?: string;
  type: string;
  title: string;
  code: string;
}

export default function ProblemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const problemId = resolvedParams.id;
  const router = useRouter();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dynamic C++ Solution Tabs
  const [solutions, setSolutions] = useState<SolutionTab[]>([
    { type: 'BRUTE', title: 'Brute Force', code: '// Brute Force Approach in C++\n' },
    { type: 'BETTER', title: 'Better', code: '// Better Approach in C++\n' },
    { type: 'OPTIMAL', title: 'Optimal 1', code: '// Optimal 1 Approach in C++\n' },
  ]);

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [editingTitleIdx, setEditingTitleIdx] = useState<number | null>(null);

  const fetchProblemDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/problems/${problemId}`);
      if (res.ok) {
        const data = await res.json();
        setProblem(data);

        if (data.solutions && data.solutions.length > 0) {
          const loaded = data.solutions.map((s: any) => ({
            id: s.id,
            type: s.type || 'OPTIMAL',
            title: s.title || (s.type === 'BRUTE' ? 'Brute Force' : s.type === 'BETTER' ? 'Better' : s.type === 'ALTERNATIVE' ? 'Optimal 2' : 'Optimal 1'),
            code: s.code || '',
          }));
          setSolutions(loaded);
        }
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemDetails();
  }, [problemId]);

  // Add Optimal 2, Optimal 3, etc.
  const handleAddOptimalTab = () => {
    const optimalCount = solutions.filter((s) => s.title.startsWith('Optimal')).length;
    const newTitle = `Optimal ${optimalCount + 1}`;
    setSolutions([...solutions, { type: 'OPTIMAL', title: newTitle, code: '' }]);
    setActiveTabIdx(solutions.length);
  };

  // Delete solution tab
  const handleDeleteSolutionTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (solutions.length <= 1) return;
    const filtered = solutions.filter((_, i) => i !== idx);
    setSolutions(filtered);
    if (activeTabIdx >= filtered.length) {
      setActiveTabIdx(filtered.length - 1);
    }
  };

  const handleSave = async () => {
    if (!problem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/problems/${problemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...problem,
          solutions: solutions.map((s) => ({
            type: s.type,
            title: s.title,
            language: 'cpp',
            code: s.code,
          })),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProblem((prev: any) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error('Error saving problem:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRevised = async () => {
    try {
      const res = await fetch('/api/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, qualityRating: 5 }),
      });

      if (res.ok) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        fetchProblemDetails();
      }
    } catch (err) {
      console.error('Error recording revision:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center font-sans">
        <div className="flex items-center gap-2 text-cyan-400">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading Problem Entry...</span>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 p-8 font-sans text-center">
        <h2 className="text-xl font-bold text-rose-400">Problem not found</h2>
        <button onClick={() => router.push('/problems')} className="mt-4 text-cyan-400 underline">
          Back to Problems Grid
        </button>
      </div>
    );
  }

  const activeSol = solutions[activeTabIdx] || solutions[0];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title={problem.title} subtitle="C++ Solution Storage" />

        <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => router.push('/problems')}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Grid
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleMarkRevised}
                className="px-3 py-2 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 rounded-xl text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Repeat className="w-4 h-4 text-purple-400" /> Revise ({problem.revisionCount}x)
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 sm:px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Metadata Card Header */}
          <div className="p-4 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">{problem.title}</h1>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      problem.difficulty === 'Easy'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                        : problem.difficulty === 'Medium'
                        ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                        : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {problem.platform}
                  </span>
                </div>

                {problem.problemUrl && (
                  <a
                    href={problem.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Open Platform Problem Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Editable Metadata Fields Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="p-2.5 sm:p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Topic</span>
                <input
                  type="text"
                  value={problem.topic || ''}
                  onChange={(e) => setProblem({ ...problem, topic: e.target.value })}
                  className="bg-transparent font-medium text-slate-200 focus:outline-none w-full border-b border-transparent focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Pattern</span>
                <input
                  type="text"
                  placeholder="e.g. Frequency Count"
                  value={problem.pattern || ''}
                  onChange={(e) => setProblem({ ...problem, pattern: e.target.value })}
                  className="bg-transparent font-medium text-slate-200 focus:outline-none w-full border-b border-transparent focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Rating</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={problem.rating || 5}
                  onChange={(e) => setProblem({ ...problem, rating: Number(e.target.value) })}
                  className="bg-transparent font-mono font-bold text-cyan-300 focus:outline-none w-full"
                />
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Revision Count</span>
                <span className="font-mono text-purple-400 font-bold text-xs sm:text-sm block">{problem.revisionCount} times</span>
              </div>
            </div>
          </div>

          {/* Dynamic Solution Storage Section (C++ Only) */}
          <div className="p-4 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              {/* Dynamic Solution Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {solutions.map((sol, idx) => {
                  const isActive = activeTabIdx === idx;
                  const isEditingTitle = editingTitleIdx === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveTabIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      {isEditingTitle ? (
                        <input
                          type="text"
                          value={sol.title}
                          autoFocus
                          onChange={(e) => {
                            const updated = [...solutions];
                            updated[idx].title = e.target.value;
                            setSolutions(updated);
                          }}
                          onBlur={() => setEditingTitleIdx(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingTitleIdx(null);
                          }}
                          className="bg-slate-900 text-slate-100 px-1 py-0.5 rounded border border-cyan-500 w-24 focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span onDoubleClick={() => setEditingTitleIdx(idx)}>{sol.title}</span>
                      )}

                      {isActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleIdx(idx);
                          }}
                          className="text-slate-500 hover:text-cyan-300"
                          title="Rename solution"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}

                      {solutions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSolutionTab(idx, e)}
                          className="text-slate-500 hover:text-rose-400"
                          title="Remove tab"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Plus Icon Button to add Optimal 2, Optimal 3, etc. */}
                <button
                  type="button"
                  onClick={handleAddOptimalTab}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 rounded-xl border border-slate-800 transition-all cursor-pointer"
                  title="Add solution tab (e.g. Optimal 2)"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                C++ Code
              </span>
            </div>

            {/* Monaco Code Editor */}
            <MonacoCodeEditor
              value={activeSol.code}
              onChange={(val) => {
                const updated = [...solutions];
                updated[activeTabIdx].code = val;
                setSolutions(updated);
              }}
              language="cpp"
              height="360px"
            />
          </div>

          {/* Notes & Dry Run Walkthrough */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Markdown Notes */}
            <div className="p-4 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Key Observations & Notes
              </h3>
              <MarkdownEditor
                value={problem.notes || ''}
                onChange={(val) => setProblem({ ...problem, notes: val })}
                placeholder="Store key observations..."
              />
            </div>

            {/* Dry Run Walkthrough */}
            <div className="p-4 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Dry Run Walkthrough
              </h3>
              <MarkdownEditor
                value={problem.dryRun || ''}
                onChange={(val) => setProblem({ ...problem, dryRun: val })}
                placeholder="Step 1: nums = [2,7,11,15], target = 9..."
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
