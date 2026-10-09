import React from 'react';
import { useApp } from '../context/AppContext';
import { X, MessageSquareQuote, Clock, User, ShieldCheck } from 'lucide-react';

export const SourceMessageModal: React.FC = () => {
  const { inspectedSource, setInspectedSource } = useApp();

  if (!inspectedSource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
            <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
            <span>Original WhatsApp Message</span>
          </div>
          <button
            onClick={() => setInspectedSource(null)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          {inspectedSource.title && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-xl px-3.5 py-2 font-medium">
              Item: <strong>{inspectedSource.title}</strong>
            </div>
          )}

          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{inspectedSource.sender}</span>
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span>{inspectedSource.timestamp}</span>
            </span>
          </div>

          {/* WhatsApp bubble quote */}
          <div className="bg-[#F2F4F2] p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="text-[11px] font-bold text-emerald-800">{inspectedSource.sender}</div>
            <div className="bg-white p-3 rounded-lg text-slate-800 font-sans leading-relaxed whitespace-pre-wrap shadow-2xs text-xs">
              {inspectedSource.text}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Verified from raw chat log to avoid hallucinated dates.</span>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setInspectedSource(null)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
