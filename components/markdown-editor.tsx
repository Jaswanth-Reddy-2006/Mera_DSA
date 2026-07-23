'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write Markdown notes, observations, or dry run steps here...',
  minHeight = '180px',
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-xl font-sans">
      {/* Tab Switcher Bar */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
              activeTab === 'edit'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
              activeTab === 'preview'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">Markdown Supported</span>
      </div>

      {/* Editor Body */}
      {activeTab === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-4 bg-slate-950 text-slate-100 placeholder-slate-600 text-sm focus:outline-none resize-y font-mono leading-relaxed"
        />
      ) : (
        <div
          style={{ minHeight }}
          className="p-4 bg-slate-950 text-slate-200 prose prose-invert max-w-none text-sm leading-relaxed overflow-y-auto"
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-slate-600 italic">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
