import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs font-semibold max-w-sm">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="flex-1">{toastMessage}</span>
      </div>
    </div>
  );
};
