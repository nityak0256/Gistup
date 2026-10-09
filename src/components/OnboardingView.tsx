import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GroupType, StudentGroup } from '../core/types';
import {
  Sparkles,
  Layers,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  Coffee,
  Utensils,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding, useDemoOnboarding } = useApp();

  const [name, setName] = useState('Alex');
  const [customGroups, setCustomGroups] = useState<StudentGroup[]>([]);

  // Form to add a new group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<GroupType>('official');
  const [chatInputText, setChatInputText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    if (!newGroupName.trim()) {
      setNewGroupName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setChatInputText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const group: StudentGroup = {
      id: `grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newGroupName.trim(),
      type: newGroupType,
      chatText: chatInputText,
      messages: [],
    };

    setCustomGroups(prev => [...prev, group]);
    setNewGroupName('');
    setChatInputText('');
    setUploadedFileName('');
  };

  const handleRemoveGroup = (id: string) => {
    setCustomGroups(prev => prev.filter(g => g.id !== id));
  };

  const handleFinish = () => {
    completeOnboarding(name, customGroups.length > 0 ? customGroups : undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-[#FAFAF7] to-[#FAFAF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8 animate-in fade-in duration-200">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-md mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome to GistUp
          </h1>
          <p className="text-sm font-medium text-emerald-800 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-200">
            Get the gist. Miss nothing.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto pt-1 leading-relaxed">
            Stop scrolling through 300+ WhatsApp messages. Catch up on hostel food, upcoming deadlines, CR announcements, and plan conclusions in seconds.
          </p>
        </div>

        {/* Quick Demo Button Banner */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-950 block">Want to see it in action right away?</span>
            <span className="text-emerald-800/80">Skip setup with realistic college classes, hostel mess photos, and group chats.</span>
          </div>
          <button
            type="button"
            onClick={useDemoOnboarding}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Try with demo groups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step 1: Student Name */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            1. What's your name?
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Alex"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
          <p className="text-[11px] text-slate-400">
            Used locally to personalize your dashboard. No accounts or password needed.
          </p>
        </div>

        {/* Step 2: Add Your Groups */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Add your WhatsApp groups
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the group type so GistUp knows how to process the messages:
            </p>
          </div>

          {/* Group Type Guide Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-900 block">Official</span>
                <span className="text-[11px] text-blue-700">Deadlines & notices</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/50 flex items-start gap-2">
              <Coffee className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-900 block">Unofficial</span>
                <span className="text-[11px] text-purple-700">Chat plan & conclusions</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/50 flex items-start gap-2">
              <Utensils className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 block">Hostel</span>
                <span className="text-[11px] text-amber-700">Latest meal photo</span>
              </div>
            </div>
          </div>

          {/* New Group Mini-Form */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Group Name (e.g. CS301 Operating Systems)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              <select
                value={newGroupType}
                onChange={e => setNewGroupType(e.target.value as GroupType)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="official">Official (Prof/CR)</option>
                <option value="unofficial">Unofficial (Friends)</option>
                <option value="hostel">Hostel (Mess)</option>
              </select>
            </div>

            {/* Import / Paste chat */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{uploadedFileName || 'Upload .txt or .zip'}</span>
                  <input
                    type="file"
                    accept=".txt,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-400">or paste exported chat below</span>
              </div>

              <textarea
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                placeholder="Paste WhatsApp chat export here (optional)..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="button"
              onClick={handleAddGroup}
              disabled={!newGroupName.trim()}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add this group</span>
            </button>
          </div>

          {/* List of currently added groups */}
          {customGroups.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Added Groups ({customGroups.length}):</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {customGroups.map(grp => (
                  <div
                    key={grp.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          grp.type === 'official'
                            ? 'bg-blue-100 text-blue-800'
                            : grp.type === 'hostel'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {grp.type}
                      </span>
                      <span className="font-bold text-slate-800 truncate">{grp.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(grp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Finish / Continue Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>In-memory demo • You can add more groups anytime in Settings</span>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Start using GistUp</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
