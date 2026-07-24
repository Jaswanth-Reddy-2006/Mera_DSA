'use client';

import { Clock, HardDrive } from 'lucide-react';
import { TIME_COMPLEXITY_OPTIONS, SPACE_COMPLEXITY_OPTIONS } from '@/lib/complexity-constants';

interface ComplexityPickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type: 'time' | 'space';
  readOnly?: boolean;
}

export default function ComplexityPicker({
  label,
  value,
  onChange,
  type,
  readOnly = false,
}: ComplexityPickerProps) {
  const options = type === 'time' ? TIME_COMPLEXITY_OPTIONS : SPACE_COMPLEXITY_OPTIONS;
  const isTime = type === 'time';

  if (readOnly) {
    return (
      <div>
        <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5 text-xs">
          {isTime ? <Clock className="w-4 h-4 text-amber-400" /> : <HardDrive className="w-4 h-4 text-purple-400" />} {label}
        </label>
        <div className={`px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs font-bold ${isTime ? 'text-amber-300' : 'text-purple-300'}`}>
          {value || 'O(N)'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 font-sans">
      <label className="block text-slate-400 font-semibold flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          {isTime ? <Clock className="w-4 h-4 text-amber-400" /> : <HardDrive className="w-4 h-4 text-purple-400" />}
          {label}
        </span>
        <span className="text-[10px] text-slate-500 font-normal">Pick preset or type custom</span>
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Direct Text Input for Custom Complexity (e.g. O(n*m)) */}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isTime ? 'e.g. O(n*m) or O(V+E)' : 'e.g. O(n*m) or O(K)'}
          className={`flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs font-bold focus:outline-none focus:ring-1 ${
            isTime ? 'text-amber-300 focus:border-amber-500 focus:ring-amber-500' : 'text-purple-300 focus:border-purple-500 focus:ring-purple-500'
          }`}
        />

        {/* Quick Select Preset Dropdown */}
        <select
          value={options.some((o) => o.value === value) ? value : ''}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
          className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs focus:outline-none cursor-pointer"
        >
          <option value="">Presets...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value} - {opt.label.split(' - ')[1] || opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
