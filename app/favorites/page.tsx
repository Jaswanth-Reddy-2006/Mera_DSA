'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import ProblemsTable from '@/components/problems-table';
import AddProblemModal from '@/components/add-problem-modal';
import { ProblemData } from '@/types';
import { Star } from 'lucide-react';

export default function FavoritesPage() {
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/problems?isFavorite=true');
      if (res.ok) {
        const data = await res.json();
        setProblems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Starred Favorites" subtitle="Your Handpicked Best Problems" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/60 border border-amber-800/40 rounded-2xl text-amber-400">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Favorites Vault</h2>
              <p className="text-xs text-slate-400">Top-tier interview questions and benchmark implementations</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading starred questions...</div>
          ) : (
            <ProblemsTable initialData={problems} onRefresh={fetchFavorites} />
          )}
        </main>
      </div>

      <AddProblemModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onCreated={fetchFavorites} />
    </div>
  );
}
