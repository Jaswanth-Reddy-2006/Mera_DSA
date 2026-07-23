'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import MonacoCodeEditor from '@/components/monaco-code-editor';
import { FLAT_FORMULA_ITEMS, FlatFormulaItem } from '@/lib/default-formula-data';
import { Code2, BookOpen, Zap } from 'lucide-react';

export default function FormulaSheetPage() {
  const [selectedItem, setSelectedItem] = useState<FlatFormulaItem>(FLAT_FORMULA_ITEMS[0]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="C++ & STL Handbook" subtitle="Complete C++ Declaration, Insertion, Lookup, Deletion & Iteration Syntax" />

        <main className="p-3 sm:p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-4 sm:gap-6 min-h-0">
          {/* Left Card: Independent Scrollbar for C++ Data Structure List */}
          <div className="w-full md:w-80 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col gap-3 shrink-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" /> C++ Syntax Handbook
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">{FLAT_FORMULA_ITEMS.length} Items</span>
            </div>

            {/* Left Card Independent Scrollbar */}
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 max-h-[35vh] md:max-h-[calc(100vh-170px)] custom-scrollbar">
              {FLAT_FORMULA_ITEMS.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="truncate max-w-[200px]">{item.title}</span>
                    {isSelected && <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Card: Independent Scrollbar for Detailed Matter Viewer */}
          <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col space-y-4 sm:space-y-6 overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-170px)] custom-scrollbar">
            {selectedItem ? (
              <>
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                    <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" /> {selectedItem.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedItem.description}</p>
                </div>

                {/* Primary Syntax Bar */}
                <div className="p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 font-mono">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Primary C++ Syntax</span>
                  <code className="text-xs sm:text-sm text-cyan-300 font-bold block">{selectedItem.syntax}</code>
                </div>

                {/* Detailed Functionalities Breakdown */}
                <div className="space-y-4 text-xs font-sans">
                  {/* 1. Declaration */}
                  {selectedItem.declaration && selectedItem.declaration !== 'N/A' && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-cyan-400">
                        1. Creation & Declaration
                      </span>
                      <MonacoCodeEditor value={selectedItem.declaration} onChange={() => {}} readOnly language="cpp" height="100px" />
                    </div>
                  )}

                  {/* 2. Insertion */}
                  {selectedItem.insertion && selectedItem.insertion !== 'N/A' && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-emerald-400">
                        2. Insertion
                      </span>
                      <MonacoCodeEditor value={selectedItem.insertion} onChange={() => {}} readOnly language="cpp" height="120px" />
                    </div>
                  )}

                  {/* 3. Lookup & Check Existence */}
                  {selectedItem.lookup && selectedItem.lookup !== 'N/A' && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-amber-400">
                        3. Lookup & Check Existence
                      </span>
                      <MonacoCodeEditor value={selectedItem.lookup} onChange={() => {}} readOnly language="cpp" height="120px" />
                    </div>
                  )}

                  {/* 4. Deletion */}
                  {selectedItem.deletion && selectedItem.deletion !== 'N/A' && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-rose-400">
                        4. Erasure & Deletion
                      </span>
                      <MonacoCodeEditor value={selectedItem.deletion} onChange={() => {}} readOnly language="cpp" height="110px" />
                    </div>
                  )}

                  {/* 5. Iteration */}
                  {selectedItem.iteration && selectedItem.iteration !== 'N/A' && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-purple-400">
                        5. Iteration
                      </span>
                      <MonacoCodeEditor value={selectedItem.iteration} onChange={() => {}} readOnly language="cpp" height="110px" />
                    </div>
                  )}

                  {/* 6. Size & Emptiness */}
                  {selectedItem.sizeCheck && selectedItem.sizeCheck !== 'N/A' && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-cyan-400">
                        6. Size & Emptiness
                      </span>
                      <MonacoCodeEditor value={selectedItem.sizeCheck} onChange={() => {}} readOnly language="cpp" height="85px" />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm my-auto">
                Select any C++ data structure on the left to view declaration, insertion, lookup, deletion, and iteration syntax.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
