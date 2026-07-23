'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Code2, Tag, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import { ProblemData } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
          const btn = document.querySelector('[data-search-trigger]') as HTMLButtonElement;
          btn?.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/problems?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 font-sans animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, topics, notes, pattern, mistakes..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {loading && (
            <div className="p-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              Searching vault...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching problems found for &quot;{query}&quot;
            </div>
          )}

          {!loading && !query && (
            <div className="p-8 text-center text-slate-500 text-xs">
              Type to search across titles, platforms, code, tags, and observations.
            </div>
          )}

          {!loading &&
            results.map((prob) => (
              <div
                key={prob.id}
                onClick={() => {
                  router.push(`/problems/${prob.id}`);
                  onClose();
                }}
                className="p-3.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/30 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
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
                    <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
                      {prob.platform}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-cyan-400/80">
                      <BookOpen className="w-3 h-3" /> {prob.topic}
                    </span>
                    {prob.pattern && <span>Pattern: {prob.pattern}</span>}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
