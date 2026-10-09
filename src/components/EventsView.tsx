import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AddEventModal } from './AddEventModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Bookmark,
  ExternalLink,
  Plus,
  Search,
  Sparkles,
  Check,
  QrCode
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, toggleEventSaved, isAdminToggleOn } = useApp();

  const [tabFilter, setTabFilter] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredEvents = events.filter(ev => {
    if (tabFilter === 'saved' && !ev.isSaved) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.name.toLowerCase().includes(q) ||
        ev.club.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Campus Events & Hackathons
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {events.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upcoming college workshops, cultural fests, and hackathons found in student chats.
          </p>
        </div>

        {/* Add Event Button (unlocked for CR / Prof) */}
        {isAdminToggleOn && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Event (CR/Prof)</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setTabFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tabFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setTabFilter('saved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              tabFilter === 'saved'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3 h-3 fill-current" />
            <span>My Events ({events.filter(e => e.isSaved).length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events, clubs..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            {tabFilter === 'saved'
              ? 'You have not saved any events yet. Click "Interested" on any event card to save it here!'
              : 'No events match your search.'}
          </div>
        ) : (
          filteredEvents.map(event => (
            <div
              key={event.id}
              className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Event Poster Banner */}
              <div className="relative h-48 bg-slate-900 overflow-hidden">
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

                {/* Bottom title on image */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
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

              {/* Event Content Details */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  {/* Venue & Who can join */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {event.venue}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 flex items-center gap-1 font-medium">
                      <Users className="w-3 h-3 text-slate-500" />
                      {event.whoCanJoin}
                    </span>
                  </div>

                  {/* 2-line summary */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {event.summary}
                  </p>
                </div>

                {/* Registration Deadline & QR Code Section */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Reg. Deadline:
                    </span>
                    <span className="text-xs font-bold text-rose-600">
                      {event.registrationDeadline}
                    </span>
                  </div>

                  {/* QR Code display & Link button */}
                  {event.qrCode && event.qrCode.detected ? (
                    <div className="flex items-center gap-2">
                      {event.qrCode.croppedImageUrl && (
                        <div
                          className="w-10 h-10 p-0.5 rounded-lg border border-slate-200 bg-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
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
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1 transition-colors"
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
          ))
        )}
      </div>

      <AddEventModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
};
