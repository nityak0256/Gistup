import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NoticeColor } from '../core/types';
import {
  Bell,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  Check,
  MessageSquareQuote,
  Trash2,
  Tag
} from 'lucide-react';

export const NoticesView: React.FC = () => {
  const {
    isAdminToggleOn,
    setIsAdminToggleOn,
    notices,
    createNotice,
    deleteNotice,
    setInspectedSource,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New notice form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<NoticeColor>('red');
  const [originalSender, setOriginalSender] = useState('');
  const [originalText, setOriginalText] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    let category: 'Deadline' | 'Exam' | 'Timetable' | 'General Info' = 'General Info';
    if (newColor === 'red') category = 'Deadline';
    else if (newColor === 'orange') category = 'Exam';
    else if (newColor === 'blue') category = 'Timetable';

    createNotice({
      title: newTitle,
      category,
      color: newColor,
      content: newContent,
      originalSender: originalSender || 'Prof. / CR',
      originalTimestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      originalText: originalText || newContent,
    });

    setNewTitle('');
    setNewContent('');
    setOriginalSender('');
    setOriginalText('');
    setIsFormOpen(false);
  };

  const filteredNotices = notices.filter(n => {
    if (categoryFilter !== 'All' && n.category !== categoryFilter) return false;
    if (colorFilter !== 'All' && n.color !== colorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.originalSender.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = ['All', 'Deadline', 'Exam', 'Timetable', 'General Info'];

  const [colorFilter, setColorFilter] = useState<string>('All');

  const colorOptions: { color: NoticeColor; label: string; desc: string; chipBg: string }[] = [
    { color: 'red', label: 'Urgent', desc: 'Red = Urgent', chipBg: 'bg-rose-500' },
    { color: 'orange', label: 'Important', desc: 'Orange = Important', chipBg: 'bg-amber-500' },
    { color: 'blue', label: 'Normal', desc: 'Blue = Normal', chipBg: 'bg-blue-500' },
    { color: 'green', label: 'FYI', desc: 'Green = FYI', chipBg: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Page Header & Admin Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Important Notices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Colour-marked announcements from academic and class groups.
          </p>
        </div>

        {/* Small Admin Toggle */}
        <div className="flex items-center gap-2.5 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs self-start sm:self-auto">
          <label className="text-xs font-bold text-slate-700 cursor-pointer select-none">
            I'm a group admin (Prof/CR)
          </label>
          <button
            type="button"
            onClick={() => setIsAdminToggleOn(!isAdminToggleOn)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
              isAdminToggleOn ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                isAdminToggleOn ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Admin Panel (when toggle is ON) */}
      {isAdminToggleOn && (
        <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200/90 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span className="text-sm font-bold text-slate-900">
                Admin Colour-Marking Tool
              </span>
            </div>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isFormOpen ? 'Close Form' : 'Post / Mark New Message'}</span>
            </button>
          </div>

          {isFormOpen && (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Colour Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {colorOptions.map(opt => (
                    <button
                      key={opt.color}
                      type="button"
                      onClick={() => setNewColor(opt.color)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        newColor === opt.color
                          ? 'border-slate-900 bg-slate-50 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${opt.chipBg}`} />
                      <span className="text-xs">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Exam Rescheduled to Oct 28"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Content / Instructions *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write notice text or copy-paste from chat..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Original Sender (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Prof. Meera Sharma"
                    value={originalSender}
                    onChange={e => setOriginalSender(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Original WhatsApp Text (for verification)
                  </label>
                  <input
                    type="text"
                    placeholder="Quote from chat..."
                    value={originalText}
                    onChange={e => setOriginalText(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Will appear with "Marked by admin (demo)" tag on dashboard and notices list.
                </span>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Color Importance Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Importance Color:
          </span>
          {[
            { id: 'All', label: 'All Colors', colorClass: '' },
            { id: 'red', label: 'Urgent (Red)', colorClass: 'text-rose-700 bg-rose-50 border-rose-200' },
            { id: 'orange', label: 'Important (Orange)', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' },
            { id: 'blue', label: 'Normal (Blue)', colorClass: 'text-blue-700 bg-blue-50 border-blue-200' },
            { id: 'green', label: 'FYI (Green)', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setColorFilter(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                colorFilter === c.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : c.colorClass || 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3.5">
        {filteredNotices.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            No notices match your filter.
          </div>
        ) : (
          filteredNotices.map(notice => {
            const borderClass =
              notice.color === 'red'
                ? 'border-l-4 border-l-rose-500'
                : notice.color === 'orange'
                ? 'border-l-4 border-l-amber-500'
                : notice.color === 'blue'
                ? 'border-l-4 border-l-blue-500'
                : 'border-l-4 border-l-emerald-500';

            const badgeBg =
              notice.color === 'red'
                ? 'bg-rose-100 text-rose-800'
                : notice.color === 'orange'
                ? 'bg-amber-100 text-amber-900'
                : notice.color === 'blue'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-emerald-100 text-emerald-800';

            return (
              <div
                key={notice.id}
                className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 ${borderClass}`}
              >
                <div className="flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeBg}`}>
                        {notice.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Marked by admin (demo)
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        • {notice.originalTimestamp}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 pt-0.5">
                      {notice.title}
                    </h3>
                  </div>

                  {isAdminToggleOn && (
                    <button
                      onClick={() => deleteNotice(notice.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {notice.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Source: <strong>{notice.originalSender}</strong></span>

                  <button
                    onClick={() =>
                      setInspectedSource({
                        sender: notice.originalSender,
                        timestamp: notice.originalTimestamp,
                        text: notice.originalText,
                        title: notice.title,
                      })
                    }
                    className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    View source message
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
