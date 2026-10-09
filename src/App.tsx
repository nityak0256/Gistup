/**
 * GistUp - Get the gist. Miss nothing.
 * AI conversation assistant for busy college student WhatsApp groups.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SummarizeView } from './components/SummarizeView';
import { NoticesView } from './components/NoticesView';
import { EventsView } from './components/EventsView';
import { SettingsView } from './components/SettingsView';
import { OnboardingView } from './components/OnboardingView';
import { SourceMessageModal } from './components/SourceMessageModal';
import { Toast } from './components/Toast';

const MainView: React.FC = () => {
  const { activeTab, isOnboarded } = useApp();

  if (!isOnboarded) {
    return <OnboardingView />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'summarize' && <SummarizeView />}
          {activeTab === 'notices' && <NoticesView />}
          {activeTab === 'events' && <EventsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Minimal Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">GistUp</span>
            <span className="text-slate-400">— Get the gist. Miss nothing.</span>
          </div>
          <div className="text-slate-400">
            In-Memory Session • AI Powered • College Demo
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <SourceMessageModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainView />
    </AppProvider>
  );
}
