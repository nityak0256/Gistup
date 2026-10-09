import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Upload,
  FileText,
  Copy,
  Check,
  MessageSquareQuote,
  Clock,
  CheckCircle2,
  HelpCircle,
  GraduationCap,
  Coffee,
  AlertCircle
} from 'lucide-react';

const SAMPLE_OFFICIAL_CHAT = `10/10/24, 08:30 - Aarav Nair (CR): Good morning everyone. Welcome to the official group for CS301 Operating Systems (Fall 2024).
10/10/24, 09:15 - Prof. Meera Sharma: First announcement: The reference textbook is Silberschatz, Operating System Concepts, 10th Edition.
10/10/24, 11:00 - Prof. Meera Sharma: Important Notice regarding Attendance: Minimum 75% attendance in both lectures and practical labs is mandatory as per university ordinance.
10/10/24, 11:30 - Aarav Nair (CR): Class timetable change for this Monday: The 9:00 AM lecture is shifted to 2:00 PM in Audi-2 due to the department guest seminar.
10/10/24, 16:40 - Prof. Meera Sharma: Assignment 1 has been uploaded on LMS. Deadline for submission is Friday, October 18 at 11:59 PM. Late penalty: 10% per day.
10/11/24, 11:15 - Prof. Meera Sharma: OFFICIAL EXAM RESCHEDULE: CS301 Midterm Exam has been rescheduled to Monday, October 28 at 10:00 AM in Examination Hall 3. Units 1-3 included; Virtual Memory is dropped from Midterm syllabus.
10/11/24, 13:10 - Kabir Sen: Alex do you have the unit 3 lecture notes from Tuesday? I missed the TLB hit ratio derivation.
10/11/24, 14:05 - Prof. Meera Sharma: Term Project Group Formation: Groups must consist of 3 or 4 students. Final roster must be submitted to Aarav via Google Form before Monday, October 21 at 5:00 PM.`;

const SAMPLE_UNOFFICIAL_CHAT = `10/10/24, 18:00 - Kabir Sen: Finally done with the 3-hour OS lab.
10/10/24, 18:02 - Rohan Varma: What are we eating tonight? Mess has tinda.
10/10/24, 18:04 - Sneha Patel: Eww no tinda. Swiggy has 40% off on Dominos.
10/10/24, 18:05 - Tanmay Joshi: Yes! Let's order 2 Large Farmhouse pizzas with cheese burst.
10/10/24, 18:08 - Kabir Sen: Ordered! Delivering to Room 302 common room in 30 mins.
10/10/24, 18:15 - Rohan Varma: What are we watching on Friday? Interstellar or Dune 2?
10/10/24, 18:16 - Sneha Patel: Interstellar IMAX hands down!
10/10/24, 18:18 - Tanmay Joshi: PVR Forum has Friday 7:30 PM show. Tickets are ₹320 each. Should I book 5 seats in row J?
10/10/24, 18:20 - Kabir Sen: Lock it in Tanmay!
10/10/24, 18:21 - Rohan Varma: Sent you ₹320 on GPay.
10/10/24, 18:22 - Sneha Patel: Sent ₹320 too!
10/10/24, 18:30 - Tanmay Joshi: Tickets booked! Interstellar IMAX, Friday 7:30 PM at PVR Forum, seats J12-J16. Anyone who hasn't paid yet, please GPay me by tomorrow noon.`;

export const SummarizeView: React.FC = () => {
  const { currentSummary, isSummarizing, summarizeChat, setInspectedSource, showToast } = useApp();

  const [rawText, setRawText] = useState(SAMPLE_OFFICIAL_CHAT);
  const [groupName, setGroupName] = useState('CS301: Operating Systems');
  const [groupType, setGroupType] = useState<'official' | 'unofficial'>('official');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        setGroupName(file.name.replace(/\.[^/.]+$/, ''));
        showToast(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleRun = async () => {
    if (!rawText.trim()) {
      showToast('Please paste or upload chat text first.');
      return;
    }
    await summarizeChat(rawText, groupName, groupType);
  };

  const handleCopyReply = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Suggested reply copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Summarize Chat
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload or paste any exported WhatsApp chat to extract official circulars, deadlines, or casual discussion conclusions.
        </p>
      </div>

      {/* Input Box and Controls */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Group Type:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setGroupType('official');
                  setGroupName('CS301: Operating Systems');
                  setRawText(SAMPLE_OFFICIAL_CHAT);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  groupType === 'official'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Official (Classes, Exams)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGroupType('unofficial');
                  setGroupName('The Quad Gang');
                  setRawText(SAMPLE_UNOFFICIAL_CHAT);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  groupType === 'unofficial'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unofficial (Friends, Plans)</span>
              </button>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .txt export</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
            placeholder="e.g. CS301 Operating Systems"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            WhatsApp Chat Text
          </label>
          <textarea
            rows={7}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            className="w-full font-mono text-xs p-3 rounded-2xl border border-slate-300 focus:border-emerald-500 outline-none text-slate-800 bg-slate-50/60"
            placeholder="Paste exported chat text here..."
          />
        </div>

        {/* Big What Did I Miss Button */}
        <button
          onClick={handleRun}
          disabled={isSummarizing || !rawText.trim()}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
          <span>{isSummarizing ? 'Analyzing Chat...' : 'What Did I Miss?'}</span>
        </button>
      </div>

      {/* Summary Output */}
      {currentSummary && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {currentSummary.groupType === 'official' ? 'Official Factual Briefing' : 'Friendly Topics Summary'}
              </span>
              <span className="text-slate-400">
                {currentSummary.isDemo ? 'Rule-Based Demo' : 'Gemini 3.8 Flash'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentSummary.headline}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {currentSummary.overview}
            </p>
          </div>

          {/* OFFICIAL RESULTS */}
          {currentSummary.groupType === 'official' && (
            <div className="space-y-6">
              {/* Deadlines with AI found tag */}
              {currentSummary.deadlines && currentSummary.deadlines.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-600" />
                      <span>Deadlines Discovered (Synced to Dashboard)</span>
                    </h3>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Tagged: AI found
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentSummary.deadlines.map((dl: any, i: number) => (
                      <div
                        key={dl.id || i}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{dl.task}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              dl.isDateUnclear
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {dl.dueDateTimeStr || dl.dueDateTime}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                          <span>From: {dl.sourceSender} ({dl.sourceTimestamp})</span>
                          <button
                            onClick={() =>
                              setInspectedSource({
                                sender: dl.sourceSender,
                                timestamp: dl.sourceTimestamp,
                                text: dl.sourceText,
                                title: dl.task,
                              })
                            }
                            className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                          >
                            View source
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements */}
              {currentSummary.announcements && currentSummary.announcements.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-600" />
                    <span>Official Announcements</span>
                  </h3>

                  <div className="space-y-2.5">
                    {currentSummary.announcements.map((ann: any, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs space-y-1"
                      >
                        <h4 className="font-bold text-slate-900">{ann.title}</h4>
                        <p className="text-slate-600 font-sans leading-relaxed">{ann.details}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>By: {ann.sourceSender}</span>
                          <button
                            onClick={() =>
                              setInspectedSource({
                                sender: ann.sourceSender,
                                timestamp: ann.sourceTimestamp,
                                text: ann.sourceText,
                                title: ann.title,
                              })
                            }
                            className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                          >
                            View source
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Questions with Copyable Draft Replies */}
              {currentSummary.questions && currentSummary.questions.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Questions Awaiting Reply</span>
                  </h3>

                  <div className="space-y-3">
                    {currentSummary.questions.map((q: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">"{q.question}"</span>
                          <span className="text-[11px] text-slate-400">{q.askedBy}</span>
                        </div>

                        {/* Suggested Reply Box */}
                        <div className="p-3 rounded-xl bg-white border border-amber-200/90 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Suggested Draft Reply:
                            </span>
                            <button
                              onClick={() => handleCopyReply(`q-${i}`, q.suggestedReply)}
                              className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedId === `q-${i}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-emerald-600" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-slate-700 leading-relaxed font-sans">{q.suggestedReply}</p>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              setInspectedSource({
                                sender: q.askedBy,
                                timestamp: q.sourceTimestamp,
                                text: q.sourceText,
                                title: q.question,
                              })
                            }
                            className="text-[11px] text-emerald-700 font-semibold cursor-pointer"
                          >
                            View source message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UNOFFICIAL RESULTS: TOPICS & FINAL CONCLUSIONS */}
          {currentSummary.groupType === 'unofficial' && currentSummary.topics && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Topics & Final Conclusions
              </h3>

              <div className="space-y-4">
                {currentSummary.topics.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{t.topic}</h4>
                      {t.sourceSender && (
                        <span className="text-[11px] text-slate-400">Led by {t.sourceSender}</span>
                      )}
                    </div>

                    <ul className="space-y-1 list-disc list-inside text-slate-600">
                      {t.keyPoints.map((pt: any, j: number) => (
                        <li key={j} className="leading-relaxed">{pt}</li>
                      ))}
                    </ul>

                    {/* Final Conclusion Box */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 space-y-1">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Final Conclusion:
                      </span>
                      <p className="font-medium leading-relaxed">{t.finalConclusion}</p>
                    </div>

                    {t.sourceText && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() =>
                            setInspectedSource({
                              sender: t.sourceSender || 'Group',
                              timestamp: 'From chat',
                              text: t.sourceText || '',
                              title: t.topic,
                            })
                          }
                          className="text-[11px] text-emerald-700 font-semibold cursor-pointer"
                        >
                          View source
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
