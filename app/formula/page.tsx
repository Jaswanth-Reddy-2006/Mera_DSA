'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import MonacoCodeEditor from '@/components/monaco-code-editor';
import { FLAT_FORMULA_ITEMS, FlatFormulaItem } from '@/lib/default-formula-data';
import { Code2, BookOpen, Zap, Plus, X, Sparkles } from 'lucide-react';

export default function FormulaSheetPage() {
  const [items, setItems] = useState<FlatFormulaItem[]>(FLAT_FORMULA_ITEMS);
  const [selectedItem, setSelectedItem] = useState<FlatFormulaItem>(FLAT_FORMULA_ITEMS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Custom Formula Form State
  const [newFormula, setNewFormula] = useState({
    title: '',
    syntax: '',
    description: '',
    declaration: '',
    insertion: '',
    lookup: '',
    deletion: '',
    iteration: '',
    sizeCheck: '',
  });

  // Fetch custom formulas from backend
  const fetchFormulas = async () => {
    try {
      const res = await fetch('/api/formula');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Merge custom items with defaults if not present
          const existingIds = new Set(FLAT_FORMULA_ITEMS.map((f) => f.id));
          const customOnly = data.filter((d: FlatFormulaItem) => !existingIds.has(d.id));
          setItems([...FLAT_FORMULA_ITEMS, ...customOnly]);
        }
      }
    } catch (err) {
      console.error('Error fetching custom formulas:', err);
    }
  };

  useEffect(() => {
    fetchFormulas();
  }, []);

  // Save new custom formula
  const handleSaveCustomFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormula.title.trim() || !newFormula.syntax.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFormula),
      });

      if (res.ok) {
        const createdItem = await res.json();
        setItems((prev) => [...prev, createdItem]);
        setSelectedItem(createdItem);
        setIsModalOpen(false);
        setNewFormula({
          title: '',
          syntax: '',
          description: '',
          declaration: '',
          insertion: '',
          lookup: '',
          deletion: '',
          iteration: '',
          sizeCheck: '',
        });
      }
    } catch (err) {
      console.error('Error saving formula:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="C++ & Custom Formula Vault" subtitle="C++ STL Reference & Personal Formula Creation" />

        <main className="p-3 sm:p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-4 sm:gap-6 min-h-0">
          {/* Left Card: Independent Scrollbar for C++ Data Structure List */}
          <div className="w-full md:w-80 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col gap-3 shrink-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Formula Vault
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Formula
              </button>
            </div>

            {/* Left Card Independent Scrollbar */}
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 max-h-[35vh] md:max-h-[calc(100vh-170px)] custom-scrollbar">
              {items.map((item) => {
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
                  {selectedItem.description && (
                    <p className="text-xs text-slate-400 mt-1">{selectedItem.description}</p>
                  )}
                </div>

                {/* Primary Syntax Bar */}
                {selectedItem.syntax && (
                  <div className="p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 font-mono">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Primary Syntax</span>
                    <code className="text-xs sm:text-sm text-cyan-300 font-bold block">{selectedItem.syntax}</code>
                  </div>
                )}

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
                Select any formula on the left to view syntax.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal to Add Custom Formula */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Create Custom Formula
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomFormula} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Topic / Formula Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disjoint Set Union (DSU) or Custom Bitmask DP"
                  value={newFormula.title}
                  onChange={(e) => setNewFormula({ ...newFormula, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Primary Syntax *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. struct DSU { vector<int> parent; };"
                  value={newFormula.syntax}
                  onChange={(e) => setNewFormula({ ...newFormula, syntax: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short explanation of this formula..."
                  value={newFormula.description}
                  onChange={(e) => setNewFormula({ ...newFormula, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              {/* Code blocks */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Creation & Declaration Code</label>
                  <textarea
                    rows={3}
                    placeholder="// Add declaration code..."
                    value={newFormula.declaration}
                    onChange={(e) => setNewFormula({ ...newFormula, declaration: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Insertion Code</label>
                  <textarea
                    rows={3}
                    placeholder="// Add insertion code..."
                    value={newFormula.insertion}
                    onChange={(e) => setNewFormula({ ...newFormula, insertion: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lookup & Check Existence Code</label>
                  <textarea
                    rows={3}
                    placeholder="// Add lookup code..."
                    value={newFormula.lookup}
                    onChange={(e) => setNewFormula({ ...newFormula, lookup: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Formula'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
