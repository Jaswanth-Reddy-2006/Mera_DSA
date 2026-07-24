'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Sparkles, Code2, Link as LinkIcon, Wand2, BookOpen, Clock, HardDrive } from 'lucide-react';
import MonacoCodeEditor from './monaco-code-editor';
import MarkdownEditor from './markdown-editor';
import { parseProblemUrl } from '@/lib/url-parser';
import { TIME_COMPLEXITY_OPTIONS, SPACE_COMPLEXITY_OPTIONS } from '@/lib/complexity-constants';

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface SolutionItem {
  type: string;
  title: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export default function AddProblemModal({ isOpen, onClose, onCreated }: AddProblemModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  // Form metadata
  const [formData, setFormData] = useState({
    problemUrl: '',
    title: '',
    platform: 'LeetCode',
    difficulty: 'Medium',
    topic: 'Arrays',
    categories: '',
    subtopic: '',
    pattern: '',
    notes: '',
  });

  // Solutions with per-solution Time & Space Complexities
  const [solutions, setSolutions] = useState<SolutionItem[]>([
    { type: 'BRUTE', title: 'Brute Force', code: '', timeComplexity: 'O(N^2)', spaceComplexity: 'O(1)' },
    { type: 'BETTER', title: 'Better', code: '', timeComplexity: 'O(N log N)', spaceComplexity: 'O(N)' },
    { type: 'OPTIMAL', title: 'Optimal 1', code: '', timeComplexity: 'O(N)', spaceComplexity: 'O(1)' },
  ]);

  const [activeTabIdx, setActiveTabIdx] = useState(0);

  if (!isOpen) return null;

  // Auto-fetch metadata & description from server API when URL is entered
  const handleUrlChange = async (url: string) => {
    setFormData((prev) => ({ ...prev, problemUrl: url }));
    if (!url.trim()) return;

    // Quick local parse first
    const localParsed = parseProblemUrl(url);
    setFormData((prev) => ({
      ...prev,
      title: localParsed.title || prev.title,
      platform: localParsed.platform || prev.platform,
      categories: localParsed.categories.join(', '),
      topic: localParsed.topic,
    }));

    // Fetch rich metadata & problem statement from /api/fetch-problem
    if (url.includes('leetcode.com')) {
      setFetchingMetadata(true);
      try {
        const res = await fetch('/api/fetch-problem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            title: data.title || prev.title,
            platform: data.platform || prev.platform,
            categories: data.categories ? data.categories.join(', ') : prev.categories,
            topic: data.topic || prev.topic,
            notes: data.description || prev.notes,
          }));
        }
      } catch (err) {
        console.error('Error fetching problem details:', err);
      } finally {
        setFetchingMetadata(false);
      }
    }
  };

  // Add Optimal 2, Optimal 3, etc.
  const handleAddOptimalTab = () => {
    const optimalCount = solutions.filter((s) => s.title.startsWith('Optimal')).length;
    const newTitle = `Optimal ${optimalCount + 1}`;
    setSolutions([
      ...solutions,
      { type: 'OPTIMAL', title: newTitle, code: '', timeComplexity: 'O(N)', spaceComplexity: 'O(1)' },
    ]);
    setActiveTabIdx(solutions.length);
  };

  // Remove solution tab
  const handleRemoveTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (solutions.length <= 1) return;
    const filtered = solutions.filter((_, i) => i !== idx);
    setSolutions(filtered);
    if (activeTabIdx >= filtered.length) {
      setActiveTabIdx(filtered.length - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const categoriesArray = formData.categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const validSolutions = solutions
        .filter((s) => s.code.trim().length > 0)
        .map((s) => ({
          type: s.type,
          title: s.title,
          language: 'cpp',
          code: s.code,
          timeComplexity: s.timeComplexity,
          spaceComplexity: s.spaceComplexity,
        }));

      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rating: 5,
          categories: categoriesArray.length > 0 ? categoriesArray : [formData.topic || 'Arrays'],
          solutions: validSolutions,
        }),
      });

      if (!res.ok) throw new Error('Failed to create problem');
      const newProblem = await res.json();

      onClose();
      if (onCreated) onCreated();
      router.push(`/problems/${newProblem.id}`);
    } catch (err) {
      console.error('Error creating problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentSol = solutions[activeTabIdx] || solutions[0];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 font-sans animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs sm:text-base text-slate-100">Add New Problem Entry (C++)</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* 1. Problem Link (URL) FIRST */}
          <div className="p-3 sm:p-4 bg-cyan-950/30 border border-cyan-900/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-cyan-300 font-bold flex items-center gap-1.5 text-xs">
                <LinkIcon className="w-4 h-4 text-cyan-400" /> Paste Problem URL (Auto-Extracts Question & Topics) *
              </label>
              {fetchingMetadata && (
                <span className="text-[10px] text-cyan-400 font-semibold animate-pulse flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Fetching LeetCode Details...
                </span>
              )}
            </div>
            <input
              type="url"
              required
              placeholder="e.g. https://leetcode.com/problems/two-sum/"
              value={formData.problemUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-cyan-800/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs font-mono"
              autoFocus
            />
          </div>

          {/* Auto-extracted Title & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Problem Title *</label>
              <input
                type="text"
                required
                placeholder="Auto-extracted title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none text-xs"
              >
                {['LeetCode', 'Codeforces', 'CodeChef', 'HackerRank', 'GFG', 'InterviewBit', 'Other'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none text-xs"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Topics / Categories (Comma separated)</label>
              <input
                type="text"
                placeholder="Arrays, HashMap, Two Pointers"
                value={formData.categories}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categories: e.target.value,
                    topic: e.target.value.split(',')[0]?.trim() || 'Arrays',
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Pattern</label>
              <input
                type="text"
                placeholder="e.g. Frequency Count"
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Key Observations & Notes */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5 text-xs">
              <BookOpen className="w-4 h-4 text-cyan-400" /> Key Observations & Problem Notes
            </label>
            <MarkdownEditor
              value={formData.notes}
              onChange={(val) => setFormData({ ...formData, notes: val })}
              placeholder="Store problem description, examples, and key observations..."
            />
          </div>

          {/* Solutions Storage Section with Per-Solution Time & Space Complexity */}
          <div className="space-y-3 border-t border-slate-800 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <Code2 className="w-4 h-4 text-cyan-400" /> C++ Solution Storage
              </span>

              {/* Solution Tabs Switcher */}
              <div className="flex flex-wrap items-center gap-1">
                {solutions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveTabIdx(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      activeTabIdx === idx
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{s.title}</span>
                    {solutions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTab(idx, e)}
                        className="text-slate-500 hover:text-rose-400 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Plus Icon Button */}
                <button
                  type="button"
                  onClick={handleAddOptimalTab}
                  className="p-1 bg-slate-950 hover:bg-slate-800 text-cyan-400 rounded-lg border border-slate-800 transition-all cursor-pointer"
                  title="Add solution tab (e.g. Optimal 2)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Monaco Code Editor */}
            <MonacoCodeEditor
              value={currentSol.code}
              onChange={(val) => {
                const updated = [...solutions];
                updated[activeTabIdx].code = val;
                setSolutions(updated);
              }}
              language="cpp"
              height="180px"
            />

            {/* Predefined Time & Space Complexity Dropdowns for Current Solution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Time Complexity ({currentSol.title})
                </label>
                <select
                  value={currentSol.timeComplexity}
                  onChange={(e) => {
                    const updated = [...solutions];
                    updated[activeTabIdx].timeComplexity = e.target.value;
                    setSolutions(updated);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-300 font-mono text-xs focus:outline-none"
                >
                  {TIME_COMPLEXITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5 text-[11px]">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Space Complexity ({currentSol.title})
                </label>
                <select
                  value={currentSol.spaceComplexity}
                  onChange={(e) => {
                    const updated = [...solutions];
                    updated[activeTabIdx].spaceComplexity = e.target.value;
                    setSolutions(updated);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-purple-300 font-mono text-xs focus:outline-none"
                >
                  {SPACE_COMPLEXITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save Problem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
