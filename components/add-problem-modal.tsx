'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Sparkles, Code2, Link as LinkIcon, Wand2 } from 'lucide-react';
import MonacoCodeEditor from './monaco-code-editor';
import { parseProblemUrl } from '@/lib/url-parser';

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface SolutionItem {
  type: string;
  title: string;
  code: string;
}

export default function AddProblemModal({ isOpen, onClose, onCreated }: AddProblemModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    rating: 7,
    timeTakenMinutes: 20,
    mistakes: '',
    notes: '',
  });

  // Solutions: Initially Brute Force, Better, Optimal 1 + Plus button to add Optimal 2, Optimal 3, etc.
  const [solutions, setSolutions] = useState<SolutionItem[]>([
    { type: 'BRUTE', title: 'Brute Force', code: '' },
    { type: 'BETTER', title: 'Better', code: '' },
    { type: 'OPTIMAL', title: 'Optimal 1', code: '' },
  ]);

  const [activeTabIdx, setActiveTabIdx] = useState(0);

  if (!isOpen) return null;

  // Auto-extract title & platform whenever URL changes
  const handleUrlChange = (url: string) => {
    const { title: extractedTitle, platform: extractedPlatform } = parseProblemUrl(url);

    setFormData((prev) => ({
      ...prev,
      problemUrl: url,
      title: extractedTitle || prev.title,
      platform: extractedPlatform || prev.platform,
    }));
  };

  // Add Optimal 2, Optimal 3, etc.
  const handleAddOptimalTab = () => {
    const optimalCount = solutions.filter((s) => s.title.startsWith('Optimal')).length;
    const newTitle = `Optimal ${optimalCount + 1}`;
    setSolutions([...solutions, { type: 'OPTIMAL', title: newTitle, code: '' }]);
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
        }));

      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
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
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 font-sans animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-100">Add New Problem Entry (C++)</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* 1. Problem Link (URL) FIRST */}
          <div className="p-3.5 bg-cyan-950/30 border border-cyan-900/40 rounded-2xl space-y-2">
            <label className="block text-cyan-300 font-bold flex items-center gap-1.5 text-xs">
              <LinkIcon className="w-4 h-4 text-cyan-400" /> Paste Problem URL (Auto-Extracts Title & Platform) *
            </label>
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
              <label className="block text-slate-400 font-semibold mb-1">Extracted Problem Title *</label>
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
              <label className="block text-slate-400 font-semibold mb-1">Categories (Comma separated)</label>
              <input
                type="text"
                placeholder="Arrays, HashMap"
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

          {/* Solutions Storage Section (C++ Only) */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
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

                {/* Plus Icon Button to add Optimal 2, Optimal 3, etc. */}
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
              height="220px"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
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
