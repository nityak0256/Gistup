import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { detectAndCropQR, extractDomain } from '../core/qrDetector';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  Upload,
  Sparkles,
  Link2
} from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose }) => {
  const { addEvent } = useApp();

  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [posterUrl, setPosterUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80');
  const [date, setDate] = useState('Nov 12, 2026');
  const [time, setTime] = useState('5:00 PM – 8:00 PM');
  const [venue, setVenue] = useState('Auditorium Hall 1');
  const [whoCanJoin, setWhoCanJoin] = useState('Open to all branches');
  const [summary, setSummary] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('Nov 10, 11:59 PM');
  const [qrLink, setQrLink] = useState('https://forms.gle/college-fest-registration');
  const [isProcessingQR, setIsProcessingQR] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPosterUrl(dataUrl);
        setIsProcessingQR(true);
        try {
          const res = await detectAndCropQR(dataUrl);
          if (res.detected && res.linkUrl) {
            setQrLink(res.linkUrl);
          }
        } finally {
          setIsProcessingQR(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const domain = extractDomain(qrLink);
    const croppedQr = qrLink
      ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrLink)}`
      : undefined;

    addEvent({
      name: name.trim(),
      club: club.trim() || 'Student Council',
      posterUrl: posterUrl.trim(),
      date,
      time,
      venue,
      whoCanJoin,
      summary: summary.trim() || 'Annual student event with competitions, networking, and talks.',
      registrationDeadline,
      qrCode: {
        detected: Boolean(qrLink),
        croppedImageUrl: croppedQr,
        linkUrl: qrLink || undefined,
        domain,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Post Campus Event</h2>
              <p className="text-[11px] text-slate-500">Unlocked via CR / Professor toggle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Event Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. CodeStorm 2026 Hackathon"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Organizing Club</label>
              <input
                type="text"
                value={club}
                onChange={e => setClub(e.target.value)}
                placeholder="e.g. Developer Student Club"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Who Can Join</label>
              <input
                type="text"
                value={whoCanJoin}
                onChange={e => setWhoCanJoin(e.target.value)}
                placeholder="e.g. Open to all students"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="Nov 12, 2026"
                className="w-full p-2 rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="5:00 PM"
                className="w-full p-2 rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="Audi 1"
                className="w-full p-2 rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Registration Deadline</label>
            <input
              type="text"
              value={registrationDeadline}
              onChange={e => setRegistrationDeadline(e.target.value)}
              placeholder="e.g. Nov 10, 11:59 PM or In 3 days"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">2-Line Summary</label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief 2-line summary of what the event is..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Poster & QR Code */}
          <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-bold text-slate-800 block">Poster Image & QR Code</label>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-semibold cursor-pointer flex items-center gap-1.5 text-slate-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Poster Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {isProcessingQR && <span className="text-[11px] text-purple-600 animate-pulse">Scanning QR...</span>}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mt-2">Registration Link (embedded in QR):</label>
              <input
                type="text"
                value={qrLink}
                onChange={e => setQrLink(e.target.value)}
                placeholder="https://forms.gle/..."
                className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 mt-0.5"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold tracking-wide shadow-xs cursor-pointer transition-colors"
            >
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
