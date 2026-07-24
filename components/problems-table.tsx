'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ProblemData } from '@/types';
import { getRevisionStatus } from '@/lib/spaced-repetition';
import {
  ArrowUpDown,
  Search,
  Trash2,
  ExternalLink,
  Filter,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface ProblemsTableProps {
  initialData: ProblemData[];
  onRefresh?: () => void;
}

export default function ProblemsTable({ initialData, onRefresh }: ProblemsTableProps) {
  const router = useRouter();
  const [data, setData] = useState<ProblemData[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);

  // Quick update problem cell and autosave
  const handleCellSave = async (problemId: string, field: string, value: any) => {
    try {
      setData((prev) =>
        prev.map((item) => (item.id === problemId ? { ...item, [field]: value } : item))
      );

      await fetch('/api/problems', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: problemId, [field]: value }),
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Autosave error:', err);
    } finally {
      setEditingCell(null);
    }
  };

  // Delete problem row
  const handleDeleteRow = async (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      setData((prev) => prev.filter((item) => item.id !== problemId));
      await fetch(`/api/problems/${problemId}`, { method: 'DELETE' });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Columns definition for TanStack Table
  const columns = useMemo<ColumnDef<ProblemData>[]>(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-cyan-400 font-semibold"
          >
            Title <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const isEditing = editingCell?.rowId === row.original.id && editingCell?.colId === 'title';
          return (
            <div
              className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center justify-between cursor-pointer"
              onDoubleClick={() => setEditingCell({ rowId: row.original.id, colId: 'title' })}
            >
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={row.original.title}
                  autoFocus
                  className="bg-slate-950 px-2 py-1 rounded border border-cyan-500 text-xs w-full text-slate-100 focus:outline-none"
                  onBlur={(e) => handleCellSave(row.original.id, 'title', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCellSave(row.original.id, 'title', (e.target as any).value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span>{row.original.title}</span>
                  {row.original.problemUrl && (
                    <a
                      href={row.original.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
                      title="Open in platform"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'platform',
        header: 'Platform',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.problemUrl ? (
              <a
                href={row.original.problemUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono flex items-center gap-1"
              >
                <span>{row.original.platform}</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {row.original.platform}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'difficulty',
        header: 'Difficulty',
        cell: ({ row }) => {
          const diff = row.original.difficulty;
          return (
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                diff === 'Easy'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                  : diff === 'Medium'
                  ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
              }`}
            >
              {diff}
            </span>
          );
        },
      },
      {
        accessorKey: 'topic',
        header: 'Topics / Categories',
        cell: ({ row }) => {
          const tagsList: string[] = row.original.tags && row.original.tags.length > 0
            ? row.original.tags.map((t: any) => t.name)
            : row.original.topic
            ? row.original.topic.split(',').map((t: string) => t.trim())
            : ['Arrays'];

          return (
            <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
              {tagsList.map((t, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700/80 font-medium">
                  {t}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'revisionCount',
        header: 'Revision Count',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-purple-400 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
            {row.original.revisionCount}x
          </span>
        ),
      },
      {
        id: 'dueForRevision',
        header: 'Due For Revision',
        cell: ({ row }) => {
          const revStatus = getRevisionStatus(row.original.lastRevisedAt, row.original.revisionCount);
          return (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                revStatus.isDue
                  ? 'bg-rose-950/60 text-rose-400 border-rose-800/40 animate-pulse'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700'
              }`}
            >
              {revStatus.isDue ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <Clock className="w-3 h-3 text-slate-400" />}
              {revStatus.displayText}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => handleDeleteRow(e, row.original.id)}
              className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-rose-950/30 transition-colors"
              title="Delete problem"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [editingCell]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (difficultyFilter !== 'All' && item.difficulty !== difficultyFilter) return false;
      if (platformFilter !== 'All' && item.platform !== platformFilter) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      return true;
    });
  }, [data, difficultyFilter, platformFilter, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Controls Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search problems or topics..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filters:
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="All">All Platforms</option>
            <option value="LeetCode">LeetCode</option>
            <option value="Codeforces">Codeforces</option>
            <option value="CodeChef">CodeChef</option>
            <option value="GFG">GFG</option>
            <option value="HackerRank">HackerRank</option>
          </select>
        </div>
      </div>

      {/* Excel Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 border-r border-slate-800/50 last:border-r-0 select-none">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/problems/${row.original.id}`)}
                    className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 border-r border-slate-800/40 last:border-r-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center text-slate-500">
                    No problems in vault yet. Click &quot;Add Problem&quot; to store your first question!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
