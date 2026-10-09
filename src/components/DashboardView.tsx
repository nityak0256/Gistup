import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealType, getMealLabel } from '../core/mealConfig';
import { AddPhotoModal } from './AddPhotoModal';
import { AddEventModal } from './AddEventModal';
import { NoticeCategory, NoticeColor } from '../core/types';
import {
  Utensils,
  Plus,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquareQuote,
  Trash2,
  Bell,
  ArrowRight,
  ExternalLink,
  MoveRight,
  Sparkles,
  Calendar,
  Bookmark,
  Coffee,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Users
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    studentName,
    latestFoodPhoto,
    hideFoodPhoto,
    moveFoodPhotoMeal,
    deadlines,
    toggleDeadlineDone,
    notices,
    createNotice,
    activeUnofficialGroupId,
    setActiveUnofficialGroupId,
    unofficialSummaries,
    groups,
    events,
    toggleEventSaved,
    isAdminToggleOn,
    setInspectedSource,
    setActiveTab,
  } = useApp();

  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isDoneSectionOpen, setIsDoneSectionOpen] = useState(false);

  // Notices filter
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState<string>('All');
  const [noticeColorFilter, setNoticeColorFilter] = useState<string>('All');
  const [isNoticeFormOpen, setIsNoticeFormOpen] = useState(false);

  // New notice form state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeColor, setNewNoticeColor] = useState<NoticeColor>('red');
  const [newNoticeCategory, setNewNoticeCategory] = useState<NoticeCategory>('Deadline');

  // Move meal menu state
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  // Helper to compute countdown badge
  const getDeadlineBadge = (item: { dueDateTime?: string; dueDateTimeStr?: string; dueDateObj?: string; isDateUnclear: boolean }) => {
    const timeDisplay = item.dueDateTime || item.dueDateTimeStr || 'Date unclear';
    if (item.isDateUnclear || timeDisplay.toLowerCase().includes('unclear')) {
      return { label: 'Date unclear', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }

    let targetTime: number | null = null;
    if (item.dueDateObj) {
      targetTime = new Date(item.dueDateObj).getTime();
    } else {
      const parsed = Date.parse(timeDisplay);
      if (!isNaN(parsed)) targetTime = parsed;
    }

    if (targetTime) {
      const diffHours = (targetTime - Date.now()) / (1000 * 60 * 60);
      if (diffHours < 0) {
        return { label: 'Past due', color: 'bg-rose-100 text-rose-800 border-rose-200 font-bold' };
      }
      if (diffHours <= 24) {
        const h = Math.max(1, Math.round(diffHours));
        return {
          label: h <= 12 ? `Due in ${h}h` : 'Due today',
          color: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
        };
      }
      const diffDays = Math.ceil(diffHours / 24);
      if (diffDays <= 3) {
        return {
          label: `Due in ${diffDays} days`,
          color: 'bg-amber-100 text-amber-900 border-amber-200 font-bold',
        };
      }
      return {
        label: `Due in ${diffDays} days`,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
      };
    }

    if (/today|tonight/i.test(timeDisplay)) {
      return { label: 'Due today', color: 'bg-rose-100 text-rose-800 border-rose-200 font-bold' };
    }

    return { label: timeDisplay, color: 'bg-amber-100 text-amber-900 border-amber-200' };
  };

  // Sort deadlines: pending sorted soonest first, unclear at bottom; done collapsed
  const pendingDeadlines = deadlines.filter(d => !d.completed);
  const doneDeadlines = deadlines.filter(d => d.completed);

  const sortedPendingDeadlines = [...pendingDeadlines].sort((a, b) => {
    if (a.isDateUnclear && !b.isDateUnclear) return 1;
    if (!a.isDateUnclear && b.isDateUnclear) return -1;
    const timeA = a.dueDateObj ? new Date(a.dueDateObj).getTime() : 9999999999999;
    const timeB = b.dueDateObj ? new Date(b.dueDateObj).getTime() : 9999999999999;
    return timeA - timeB;
  });

  // Filtered notices
  const filteredNotices = notices.filter(n => {
    if (noticeCategoryFilter !== 'All' && n.category !== noticeCategoryFilter) return false;
    if (noticeColorFilter !== 'All' && n.color !== noticeColorFilter) return false;
    return true;
  });

  const handleCreateNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    createNotice({
      title: newNoticeTitle.trim(),
      category: newNoticeCategory,
      color: newNoticeColor,
      content: newNoticeContent.trim(),
    });

    setNewNoticeTitle('');
    setNewNoticeContent('');
    setIsNoticeFormOpen(false);
  };

  // Unofficial groups
  const unofficialGroups = groups.filter(g => g.type === 'unofficial');
  const activeSummary = unofficialSummaries[activeUnofficialGroupId] || Object.values(unofficialSummaries)[0];

  const allMeals: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

  return (
    <div className="space-y-12 pb-20">

      {/* ========================================================
          SECTION 1: FOOD CORNER (Small Card showing ONLY ONE photo)
         ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Food Corner
            </h2>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70">
              Latest Mess Update
            </span>
          </div>

          <button
            onClick={() => setIsAddPhotoOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add photo</span>
          </button>
        </div>

        {/* Small card showing ONLY ONE photo */}
        <div className="max-w-sm">
          {latestFoodPhoto ? (
            <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all">
              {/* Photo Area */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <img
                  src={latestFoodPhoto.photoUrl}
                  alt={latestFoodPhoto.dishName}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Dish name badge on image */}
                <div className="absolute bottom-2 left-3 right-3 text-white text-xs">
                  <span className="font-bold drop-shadow-xs line-clamp-1 text-sm">
                    {latestFoodPhoto.dishName}
                  </span>
                </div>
              </div>

              {/* Text Info Below Photo */}
              <div className="p-3.5 space-y-2.5 bg-white">
                <div className="flex items-center justify-between">
                  {/* Meal Name written below it */}
                  <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    {getMealLabel(latestFoodPhoto.meal)}
                  </span>

                  {/* Sender and time in small text */}
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <span>{latestFoodPhoto.sender}</span>
                    <span>•</span>
                    <span>{latestFoodPhoto.timestamp}</span>
                  </div>
                </div>

                {/* Not food / wrong meal actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => hideFoodPhoto(latestFoodPhoto.id)}
                    className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Not food / Hide</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Wrong meal?</span>
                    <select
                      onChange={e => {
                        if (e.target.value) {
                          moveFoodPhotoMeal(latestFoodPhoto.id, e.target.value as MealType);
                        }
                      }}
                      defaultValue=""
                      className="text-[10px] font-semibold py-0.5 px-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="" disabled>Move to...</option>
                      {allMeals.filter(m => m !== latestFoodPhoto.meal).map(m => (
                        <option key={m} value={m}>
                          {getMealLabel(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Utensils className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-600">No food photo yet</p>
              <p className="text-[11px] text-slate-400">
                Photos sent in the hostel mess group will automatically appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 2: DEADLINES REMAINING
         ======================================================== */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Deadlines Remaining
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
              {pendingDeadlines.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Sorted soonest first • Red = within 24h • Amber = within 3 days • Green = later
          </span>
        </div>

        {/* Deadlines List */}
        <div className="space-y-2.5">
          {sortedPendingDeadlines.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              🎉 No pending deadlines! All assignments and exams completed.
            </div>
          ) : (
            sortedPendingDeadlines.map(item => {
              const badge = getDeadlineBadge(item);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Mark done checkbox */}
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleDeadlineDone(item.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Countdown Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] border ${badge.color}`}>
                          {badge.label}
                        </span>

                        {/* Source Tag */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.source === 'starred'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {item.source === 'starred' ? 'Marked by CR/Prof (demo)' : 'AI found'}
                        </span>

                        <span className="text-xs text-slate-400 font-medium">
                          {item.dueDateTime}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 pt-0.5">
                        {item.task}
                      </h3>
                    </div>
                  </div>

                  {/* View original message link */}
                  <button
                    onClick={() =>
                      setInspectedSource({
                        sender: item.sourceSender,
                        timestamp: item.sourceTimestamp,
                        text: item.sourceText,
                        title: item.task,
                      })
                    }
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start sm:self-center shrink-0 pl-7 sm:pl-0"
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>View original message</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Collapsible Done / Past Deadlines */}
        {doneDeadlines.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setIsDoneSectionOpen(!isDoneSectionOpen)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Done / Past Deadlines ({doneDeadlines.length})</span>
              {isDoneSectionOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isDoneSectionOpen && (
              <div className="mt-2.5 space-y-2 opacity-75">
                {doneDeadlines.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleDeadlineDone(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="line-through text-slate-500 font-medium">
                        {item.task}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {item.completedAt ? `Done ${item.completedAt}` : 'Done'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================
          SECTION 3: NOTICES (marked by admins)
         ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Notices
            </h2>
            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
              Marked by Admins (Prof / CR)
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAdminToggleOn && (
              <button
                onClick={() => setIsNoticeFormOpen(!isNoticeFormOpen)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post notice (Admin)</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('notices')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>See all ({notices.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter chips: Category & Color */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Filter:
          </span>

          {/* Category Chips */}
          {(['All', 'Deadline', 'Exam', 'Timetable', 'General Info'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setNoticeCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                noticeCategoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <span className="text-slate-300">|</span>

          {/* Color Chips */}
          {[
            { id: 'All', label: 'All Colors', colorClass: '' },
            { id: 'red', label: 'Urgent', colorClass: 'text-rose-700 bg-rose-50 border-rose-200' },
            { id: 'orange', label: 'Important', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' },
            { id: 'blue', label: 'Normal', colorClass: 'text-blue-700 bg-blue-50 border-blue-200' },
            { id: 'green', label: 'FYI', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setNoticeColorFilter(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                noticeColorFilter === c.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : c.colorClass || 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Admin Post Notice Inline Form */}
        {isAdminToggleOn && isNoticeFormOpen && (
          <form
            onSubmit={handleCreateNoticeSubmit}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-in fade-in duration-150"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Post New Notice (CR / Professor Mode)</span>
              <button
                type="button"
                onClick={() => setIsNoticeFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              required
              placeholder="Notice title..."
              value={newNoticeTitle}
              onChange={e => setNewNoticeTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newNoticeCategory}
                onChange={e => setNewNoticeCategory(e.target.value as NoticeCategory)}
                className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
              >
                <option value="Deadline">Deadline</option>
                <option value="Exam">Exam</option>
                <option value="Timetable">Timetable</option>
                <option value="General Info">General Info</option>
              </select>

              <select
                value={newNoticeColor}
                onChange={e => setNewNoticeColor(e.target.value as NoticeColor)}
                className="p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
              >
                <option value="red">Red = Urgent</option>
                <option value="orange">Orange = Important</option>
                <option value="blue">Blue = Normal</option>
                <option value="green">Green = FYI</option>
              </select>
            </div>

            <textarea
              rows={2}
              required
              placeholder="Announcement text..."
              value={newNoticeContent}
              onChange={e => setNewNoticeContent(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors"
            >
              Publish and Star-Mark
            </button>
          </form>
        )}

        {/* Notices Cards List */}
        <div className="space-y-3">
          {filteredNotices.slice(0, 3).map(notice => {
            const colorBorder =
              notice.color === 'red'
                ? 'border-l-4 border-l-rose-500'
                : notice.color === 'orange'
                ? 'border-l-4 border-l-amber-500'
                : notice.color === 'blue'
                ? 'border-l-4 border-l-blue-500'
                : 'border-l-4 border-l-emerald-500';

            const chipColor =
              notice.color === 'red'
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : notice.color === 'orange'
                ? 'bg-amber-100 text-amber-900 border-amber-200'
                : notice.color === 'blue'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

            const importanceName =
              notice.color === 'red'
                ? 'Urgent'
                : notice.color === 'orange'
                ? 'Important'
                : notice.color === 'blue'
                ? 'Normal'
                : 'FYI';

            return (
              <div
                key={notice.id}
                className={`p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2 ${colorBorder}`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${chipColor}`}>
                      {notice.category} • {importanceName}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      ★ Star-marked by admin
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {notice.originalTimestamp}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {notice.content}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>From: <strong>{notice.originalSender}</strong></span>
                  <button
                    onClick={() =>
                      setInspectedSource({
                        sender: notice.originalSender,
                        timestamp: notice.originalTimestamp,
                        text: notice.originalText,
                        title: notice.title,
                      })
                    }
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>View original message</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 4: CASUAL CHAT SUMMARY (Unofficial Groups)
         ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Casual Chat Summary
            </h2>
            <span className="text-xs text-purple-800 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Friends & Outings
            </span>
          </div>

          {/* Dropdown to switch unofficial group */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Group:</span>
            <select
              value={activeUnofficialGroupId}
              onChange={e => setActiveUnofficialGroupId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-2xs outline-none cursor-pointer"
            >
              {unofficialGroups.length > 0 ? (
                unofficialGroups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))
              ) : (
                <option value="grp-unofficial-quad">The Quad Gang (Hostel 4)</option>
              )}
            </select>
          </div>
        </div>

        {/* Discussion Topics & Final Conclusions */}
        {activeSummary ? (
          <div className="space-y-3.5">
            {/* Headline Overview */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center font-bold shrink-0">
                <Coffee className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-purple-950">
                  {activeSummary.headline}
                </h4>
                <p className="text-xs text-purple-900/80 leading-relaxed font-sans">
                  {activeSummary.overview}
                </p>
              </div>
            </div>

            {/* List of Topic Discussions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSummary.topics.map(topic => (
                <div
                  key={topic.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Topic
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {topic.sourceMessages.length} msgs
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {topic.topic}
                    </h4>

                    {/* Key Points Discussed */}
                    <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc marker:text-purple-400">
                      {topic.keyPoints.map((pt, idx) => (
                        <li key={idx} className="leading-snug">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* FINAL CONCLUSION HIGHLIGHT */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-2">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-0.5">
                        Final Conclusion:
                      </span>
                      <p className="text-xs font-bold text-emerald-950 leading-snug">
                        {topic.finalConclusion}
                      </p>
                    </div>

                    {/* View Original Messages link */}
                    {topic.sourceMessages.length > 0 && (
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => {
                            const first = topic.sourceMessages[0];
                            setInspectedSource({
                              sender: first.sender,
                              timestamp: first.timestamp,
                              text: topic.sourceMessages.map(m => `[${m.timestamp}] ${m.sender}: ${m.text}`).join('\n\n'),
                              title: topic.topic,
                            });
                          }}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquareQuote className="w-3.5 h-3.5" />
                          <span>View original chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No casual discussion summary available for this group yet.
          </div>
        )}
      </section>

      {/* ========================================================
          SECTION 5: CAMPUS EVENTS
         ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Campus Events & Hackathons
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {events.length}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAdminToggleOn && (
              <button
                onClick={() => setIsAddEventOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add event (CR/Prof)</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('events')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View all events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.slice(0, 2).map(event => (
            <div
              key={event.id}
              className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Event Poster Banner */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <img
                  src={event.posterUrl}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Club Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                  {event.club}
                </div>

                {/* Interested Button */}
                <button
                  onClick={() => toggleEventSaved(event.id)}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                    event.isSaved
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-black/50 text-white/90 hover:bg-black/70'
                  }`}
                  title={event.isSaved ? 'Saved in My Events' : 'Save to My Events'}
                >
                  <Bookmark className={`w-4 h-4 ${event.isSaved ? 'fill-current' : ''}`} />
                </button>

                {/* Title and date overlay */}
                <div className="absolute bottom-2.5 left-4 right-4 text-white">
                  <h3 className="text-base font-bold drop-shadow-xs line-clamp-1">
                    {event.name}
                  </h3>
                  <div className="text-[11px] text-slate-200/90 flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-300" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-300" />
                      {event.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {event.venue}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 flex items-center gap-1 font-medium">
                      <Users className="w-3 h-3 text-slate-400" />
                      {event.whoCanJoin}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {event.summary}
                  </p>
                </div>

                {/* Registration Deadline & QR Code with external button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Reg. Deadline:
                    </span>
                    <span className="text-xs font-bold text-rose-600">
                      {event.registrationDeadline}
                    </span>
                  </div>

                  {event.qrCode && event.qrCode.detected ? (
                    <div className="flex items-center gap-2">
                      {event.qrCode.croppedImageUrl && (
                        <div
                          className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 bg-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                          title="Poster QR Code"
                        >
                          <img
                            src={event.qrCode.croppedImageUrl}
                            alt="QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      {event.qrCode.linkUrl && (
                        <a
                          href={event.qrCode.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Open {event.qrCode.domain || 'link'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">Walk-in entry</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Modals */}
      <AddPhotoModal
        isOpen={isAddPhotoOpen}
        onClose={() => setIsAddPhotoOpen(false)}
        defaultMeal={latestFoodPhoto ? latestFoodPhoto.meal : 'lunch'}
      />
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
      />
    </div>
  );
};
