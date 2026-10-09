import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GroupType, StudentGroup } from '../core/types';
import {
  Lock,
  Puzzle,
  Trash2,
  RefreshCw,
  Cpu,
  Layers,
  Plus,
  BookOpen,
  Coffee,
  Utensils,
  Upload,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    groups,
    addGroup,
    removeGroup,
    aiStatus,
    refreshAiStatus,
    resetAllData,
    showToast,
  } = useApp();

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add group state in settings
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<GroupType>('official');
  const [newGroupChatText, setNewGroupChatText] = useState('');
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
      if (text) setNewGroupChatText(text);
    };
    reader.readAsText(file);
  };

  const handleAddGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    addGroup({
      id: `grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newGroupName.trim(),
      type: newGroupType,
      chatText: newGroupChatText,
      messages: [],
    });

    setNewGroupName('');
    setNewGroupChatText('');
    setUploadedFileName('');
    setIsAddGroupOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAiStatus();
    setIsRefreshing(false);
    showToast('AI connection status refreshed.');
  };

  const handleConfirmReset = () => {
    resetAllData();
    setShowConfirmReset(false);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings & Privacy
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your WhatsApp groups, review privacy guarantees, and control application state.
        </p>
      </div>

      {/* Group Management Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Imported WhatsApp Groups</h2>
              <p className="text-[11px] text-slate-400">
                Official (deadlines), Unofficial (summaries), or Hostel (mess photo)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddGroupOpen(!isAddGroupOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddGroupOpen ? 'Close' : 'Add new group'}</span>
          </button>
        </div>

        {/* Add Group Inline Form */}
        {isAddGroupOpen && (
          <form
            onSubmit={handleAddGroupSubmit}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-in fade-in duration-150"
          >
            <div className="font-bold text-slate-800">Add a New WhatsApp Group</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Group name (e.g. EC202 Digital Circuits)"
                className="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              <select
                value={newGroupType}
                onChange={e => setNewGroupType(e.target.value as GroupType)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="official">Official (Professors / CRs)</option>
                <option value="unofficial">Unofficial (Friends / Casual)</option>
                <option value="hostel">Hostel (Mess food photos)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{uploadedFileName || 'Upload .txt or .zip'}</span>
                  <input
                    type="file"
                    accept=".txt,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-400">or paste export below</span>
              </div>

              <textarea
                value={newGroupChatText}
                onChange={e => setNewGroupChatText(e.target.value)}
                placeholder="Paste WhatsApp exported chat text..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors"
            >
              Save Group to GistUp
            </button>
          </form>
        )}

        {/* Groups List */}
        <div className="space-y-2 pt-1">
          {groups.map(group => {
            const badge =
              group.type === 'official'
                ? { label: 'Official', class: 'bg-blue-100 text-blue-800 border-blue-200' }
                : group.type === 'hostel'
                ? { label: 'Hostel', class: 'bg-amber-100 text-amber-800 border-amber-200' }
                : { label: 'Unofficial', class: 'bg-purple-100 text-purple-800 border-purple-200' };

            return (
              <div
                key={group.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.class}`}>
                    {badge.label}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {group.name}
                  </span>
                </div>

                <button
                  onClick={() => removeGroup(group.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                  title="Remove group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Honest Privacy Disclosure Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Data Privacy & AI Processing</h2>
            <p className="text-[11px] text-slate-400">Honest overview of where data goes</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            • <strong>AI Processing:</strong> When an API key is configured on the server, chat text and photos may be sent securely to Google's Gemini AI service for summarization and deadline extraction with structured JSON schemas.
            When running in demo mode or without a key, all processing is performed via rule-based code in <code className="bg-slate-100 font-mono px-1 rounded">/src/core/</code> with no external calls.
          </p>
          <p>
            • <strong>No Real WhatsApp Connection:</strong> GistUp does not claim any official connection or integration with WhatsApp or Meta. It does not use unofficial WhatsApp APIs or scraping. It operates solely on exported chat text or manual inputs.
          </p>
          <p>
            • <strong>In-Memory Lifecycle:</strong> GistUp does not store your chats or photos in any database. Everything lives in active browser session memory and disappears if you close the tab or reset.
          </p>
        </div>
      </div>

      {/* Chrome Extension Roadmap Note */}
      <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <Puzzle className="w-4 h-4 text-amber-700" />
          <span>Chrome extension for WhatsApp Web: planned, not available yet.</span>
        </div>
        <p className="text-amber-900/90 leading-relaxed font-sans">
          All parsing, meal categorization, and summarization logic are stored in a dedicated <code className="bg-amber-100 font-mono px-1 rounded">/src/core/</code> folder with zero React dependencies so a future Chrome extension can inspect WhatsApp Web directly without redesigning the core logic.
        </p>
      </div>

      {/* AI Connection Diagnostic */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Connection Status</h2>
              <p className="text-[11px] text-slate-400">Current status of the backend Gemini service</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check again</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus.aiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-bold text-slate-800">
              {aiStatus.aiConnected ? 'AI: Connected' : 'AI: Demo mode'}
            </span>
          </div>

          <span className="font-mono text-slate-500 text-[11px]">
            Model: {aiStatus.model}
          </span>
        </div>
      </div>

      {/* Delete All Data / Reset Button */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Delete All My Data & Reset</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset all loaded food photos, added deadlines, and groups, and return to onboarding.
          </p>
        </div>

        {showConfirmReset ? (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Confirm Reset
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Delete all my data
          </button>
        )}
      </div>
    </div>
  );
};
