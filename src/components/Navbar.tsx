import React from 'react';
import { useApp, TopTab } from '../context/AppContext';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Bell,
  Calendar,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    aiStatus,
    notices,
    events,
    isAdminToggleOn,
    setIsAdminToggleOn,
    studentName,
  } = useApp();

  const unreadNoticesCount = notices.length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-102 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  GistUp
                </span>
                <span className="text-xs text-slate-400 font-normal ml-2 hidden sm:inline">
                  Get the gist. Miss nothing.
                </span>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveTab('summarize')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'summarize'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Summarize Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('notices')}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'notices'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notices</span>
                {unreadNoticesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {unreadNoticesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'events'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Events</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings & Privacy</span>
              </button>
            </nav>
          </div>

          {/* Right Header Area: CR/Prof Toggle, AI Status, Student Name */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Small Header Toggle: "I'm a CR / Professor" */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1.5 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={isAdminToggleOn}
                onChange={e => setIsAdminToggleOn(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">
                I'm a CR / Professor
              </span>
            </label>

            {/* AI Connection Badge */}
            <div
              title={aiStatus.info}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                aiStatus.aiConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  aiStatus.aiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{aiStatus.aiConnected ? 'AI: Connected' : 'AI: Demo mode'}</span>
            </div>

            {/* Student Name */}
            {studentName && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  {studentName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{studentName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 no-scrollbar">
          {(
            [
              { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
              { id: 'summarize', label: 'Summarize', icon: MessageSquare },
              { id: 'notices', label: 'Notices', icon: Bell },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'settings', label: 'Settings', icon: Settings },
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  isCurrent ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
