'use client';

import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { Code2, Check, Copy } from 'lucide-react';

interface MonacoCodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export default function MonacoCodeEditor({
  value,
  onChange,
  language = 'cpp',
  height = '360px',
  readOnly = false,
}: MonacoCodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mapMonacoLanguage = (lang: string) => {
    if (lang === 'cpp' || lang === 'c++') return 'cpp';
    if (lang === 'py' || lang === 'python') return 'python';
    if (lang === 'java') return 'java';
    if (lang === 'js' || lang === 'javascript') return 'javascript';
    return 'cpp';
  };

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-xl font-mono">
      {/* Editor Header */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="uppercase">{language} Editor</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Monaco React Editor Container */}
      <Editor
        height={height}
        language={mapMonacoLanguage(language)}
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          fontFamily: 'Fira Code, JetBrains Mono, monospace',
        }}
      />
    </div>
  );
}
