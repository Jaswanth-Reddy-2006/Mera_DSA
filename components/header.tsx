'use client';

interface HeaderProps {
  onOpenSearch?: () => void;
  title?: string;
  subtitle?: string;
}

export default function Header({ title = 'Dashboard', subtitle }: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
    </header>
  );
}
