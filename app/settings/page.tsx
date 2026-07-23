'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import AddProblemModal from '@/components/add-problem-modal';
import { Download, Upload, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SettingsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  // Download full JSON backup
  const handleExportJSON = async () => {
    try {
      const res = await fetch('/api/backup');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mera_DSA_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = async () => {
    try {
      const res = await fetch('/api/problems');
      const problems = await res.json();
      const sheetData = problems.map((p: any) => ({
        Title: p.title,
        Platform: p.platform,
        Difficulty: p.difficulty,
        Topic: p.topic,
        Subtopic: p.subtopic || '',
        Pattern: p.pattern || '',
        Status: p.status,
        Rating: p.rating,
        RevisionCount: p.revisionCount,
        Mistakes: p.mistakes || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Problems');
      XLSX.writeFile(workbook, `Mera_DSA_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error(err);
    }
  };

  // Import JSON backup
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage('');

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully imported ${data.importedCount} problems!`);
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (err: any) {
      setMessage(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Settings & Data Vault" subtitle="Data Backup, Export & System Config" />

        <main className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Data Management</h2>
            <p className="text-xs text-slate-400">Export your complete second brain data to JSON or Excel (.xlsx) at any time.</p>
          </div>

          {message && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{message}</span>
            </div>
          )}

          {/* Export & Import Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Card */}
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-950/60 border border-cyan-800/40 rounded-2xl text-cyan-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Export Knowledge Vault</h3>
                  <p className="text-xs text-slate-500">Download full data snapshot</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleExportJSON}
                  className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Export Full JSON Backup</span>
                  <Download className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  onClick={handleExportExcel}
                  className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Export to Excel (.xlsx)</span>
                  <Download className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* Import Card */}
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-950/60 border border-purple-800/40 rounded-2xl text-purple-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Restore / Import Data</h3>
                  <p className="text-xs text-slate-500">Import existing JSON backup</p>
                </div>
              </div>

              <div className="pt-2">
                <label className="w-full p-4 bg-slate-950 hover:bg-slate-800/80 border border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl text-xs font-semibold text-slate-300 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
                  {importing ? (
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-purple-400" />
                      <span>Click to select JSON backup file</span>
                    </>
                  )}
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AddProblemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
