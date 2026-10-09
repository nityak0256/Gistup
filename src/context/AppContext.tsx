/**
 * Global AppContext for GistUp ("Get the gist. Miss nothing.").
 * Clean, lightweight, in-memory state.
 * Manages Onboarding, Groups, Dashboard (Food Corner, Deadlines, Notices, Casual Chat Summaries, Campus Events),
 * Summarize Chat, Notices, Events, and Settings.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentGroup,
  FoodPhoto,
  DeadlineItem,
  OfficialNotice,
  CampusEvent,
  UnofficialGroupSummary,
  ChatSummaryResult,
  NoticeColor,
  NoticeCategory,
  ChatMessage,
} from '../core/types';
import { MealType, getMealForSentTime } from '../core/mealConfig';
import {
  INITIAL_FOOD_PHOTOS,
  INITIAL_DEADLINES,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_GROUPS,
  INITIAL_UNOFFICIAL_SUMMARY,
  getRelativeDateKey,
} from '../core/defaultData';
import { parseWhatsAppExport } from '../core/parser';

export type TopTab = 'dashboard' | 'summarize' | 'notices' | 'events' | 'settings';

interface AIStatus {
  aiConnected: boolean;
  mode: 'live' | 'demo';
  model: string;
  info: string;
}

interface AppContextType {
  // Navigation & User Profile
  activeTab: TopTab;
  setActiveTab: (tab: TopTab) => void;
  studentName: string;
  setStudentName: (name: string) => void;
  isOnboarded: boolean;
  completeOnboarding: (name: string, customGroups?: StudentGroup[]) => void;
  useDemoOnboarding: () => void;

  // Groups Management
  groups: StudentGroup[];
  addGroup: (group: StudentGroup) => void;
  removeGroup: (id: string) => void;

  // Header CR / Professor Toggle (demo toggle)
  isAdminToggleOn: boolean;
  setIsAdminToggleOn: (on: boolean) => void;

  // AI Connection Status
  aiStatus: AIStatus;
  refreshAiStatus: () => Promise<void>;

  // 1. Food Corner
  foodPhotos: FoodPhoto[];
  latestFoodPhoto: FoodPhoto | null;
  addFoodPhoto: (meal: MealType, photoUrl: string, dishName: string, caption?: string) => void;
  hideFoodPhoto: (id: string) => void;
  moveFoodPhotoMeal: (id: string, newMeal: MealType) => void;

  // 2. Deadlines Remaining
  deadlines: DeadlineItem[];
  toggleDeadlineDone: (id: string) => void;
  addDeadlinesFromAI: (newDeadlines: DeadlineItem[]) => void;

  // 3. Notices
  notices: OfficialNotice[];
  createNotice: (notice: {
    title: string;
    category: NoticeCategory;
    color: NoticeColor;
    content: string;
    originalSender?: string;
    originalTimestamp?: string;
    originalText?: string;
  }) => void;
  deleteNotice: (id: string) => void;

  // 4. Casual Chat Summaries (Unofficial groups)
  activeUnofficialGroupId: string;
  setActiveUnofficialGroupId: (id: string) => void;
  unofficialSummaries: Record<string, UnofficialGroupSummary>;

  // 5. Campus Events
  events: CampusEvent[];
  toggleEventSaved: (id: string) => void;
  addEvent: (event: Omit<CampusEvent, 'id' | 'postedAt' | 'postedBy'>) => void;

  // Summarize Chat page
  currentSummary: ChatSummaryResult | null;
  isSummarizing: boolean;
  summarizeChat: (rawText: string, groupName: string, groupType: 'official' | 'unofficial') => Promise<void>;

  // Source message inspection modal
  inspectedSource: {
    sender: string;
    timestamp: string;
    text: string;
    title?: string;
  } | null;
  setInspectedSource: (source: { sender: string; timestamp: string; text: string; title?: string } | null) => void;

  // Feedback Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Reset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TopTab>('dashboard');
  const [studentName, setStudentName] = useState<string>('Alex');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true); // Pre-onboarded so ready immediately, but can replay
  const [groups, setGroups] = useState<StudentGroup[]>(INITIAL_GROUPS);

  // Small header toggle "I'm a CR / Professor"
  const [isAdminToggleOn, setIsAdminToggleOn] = useState<boolean>(false);

  const [aiStatus, setAiStatus] = useState<AIStatus>({
    aiConnected: false,
    mode: 'demo',
    model: 'gemini-3.8-flash',
    info: 'Checking connection...',
  });

  // Food Corner state
  const [foodPhotos, setFoodPhotos] = useState<FoodPhoto[]>(INITIAL_FOOD_PHOTOS);

  // Deadlines state
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(INITIAL_DEADLINES);

  // Notices state
  const [notices, setNotices] = useState<OfficialNotice[]>(INITIAL_NOTICES);

  // Casual Summaries state
  const [activeUnofficialGroupId, setActiveUnofficialGroupId] = useState<string>('grp-unofficial-quad');
  const [unofficialSummaries, setUnofficialSummaries] = useState<Record<string, UnofficialGroupSummary>>({
    'grp-unofficial-quad': INITIAL_UNOFFICIAL_SUMMARY,
  });

  // Campus Events state
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);

  // Summarize View state
  const [currentSummary, setCurrentSummary] = useState<ChatSummaryResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  // Modals & toast
  const [inspectedSource, setInspectedSource] = useState<{
    sender: string;
    timestamp: string;
    text: string;
    title?: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  const refreshAiStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus({
          aiConnected: Boolean(data.aiConnected),
          mode: data.mode || (data.aiConnected ? 'live' : 'demo'),
          model: data.model || 'gemini-3.8-flash',
          info: data.info || '',
        });
      }
    } catch {
      setAiStatus({
        aiConnected: false,
        mode: 'demo',
        model: 'gemini-3.8-flash',
        info: 'Running in demo mode',
      });
    }
  };

  useEffect(() => {
    refreshAiStatus();
  }, []);

  // Compute the single latest food photo from hostel group
  const activePhotos = foodPhotos.filter(p => !p.isHidden);
  const latestFoodPhoto = activePhotos.length > 0 ? activePhotos[0] : null;

  // Food handlers
  const addFoodPhoto = (meal: MealType, photoUrl: string, dishName: string, caption?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newPhoto: FoodPhoto = {
      id: `food-${Date.now()}`,
      meal,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      dishName: dishName.trim() || 'Mess Dish',
      sender: studentName || 'Hostel Resident',
      timestamp: timeStr,
      dateKey: getRelativeDateKey(0),
      caption,
      isHidden: false,
    };
    // New photo replaces the old one as the latest!
    setFoodPhotos(prev => [newPhoto, ...prev]);
    showToast(`Food photo added for ${meal.toUpperCase()}`);
  };

  const hideFoodPhoto = (id: string) => {
    setFoodPhotos(prev => prev.map(p => (p.id === id ? { ...p, isHidden: true } : p)));
    showToast('Photo removed / marked as not food.');
  };

  const moveFoodPhotoMeal = (id: string, newMeal: MealType) => {
    setFoodPhotos(prev => prev.map(p => (p.id === id ? { ...p, meal: newMeal } : p)));
    showToast(`Photo meal updated.`);
  };

  // Group handlers
  const addGroup = (group: StudentGroup) => {
    setGroups(prev => [...prev, group]);

    // Handle group type logic:
    if (group.type === 'official') {
      // Auto-extract deadlines/notices if text provided
      if (group.chatText) {
        const parsed = parseWhatsAppExport(group.chatText);
        parsed.messages.forEach(msg => {
          if (/deadline|submission|due|exam|quiz/i.test(msg.text)) {
            setDeadlines(prev => [
              {
                id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                task: msg.text.slice(0, 50),
                dueDateTime: 'Extracted from chat',
                isDateUnclear: false,
                source: 'ai',
                sourceSender: msg.sender,
                sourceTimestamp: msg.timestamp,
                sourceText: msg.text,
                completed: false,
              },
              ...prev,
            ]);
          }
        });
      }
    } else if (group.type === 'hostel') {
      if (group.chatText) {
        const parsed = parseWhatsAppExport(group.chatText);
        parsed.messages.forEach(msg => {
          if (msg.photoUrl || /food|mess|dinner|lunch|breakfast|samosa|dosa/i.test(msg.text)) {
            const meal = getMealForSentTime(msg.timestamp);
            setFoodPhotos(prev => [
              {
                id: `food-parsed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                meal,
                photoUrl: msg.photoUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
                dishName: msg.text.slice(0, 35) || 'Mess Update',
                sender: msg.sender,
                timestamp: msg.timestamp,
                dateKey: getRelativeDateKey(0),
                isHidden: false,
              },
              ...prev,
            ]);
          }
        });
      }
    } else if (group.type === 'unofficial') {
      // Add entry to unofficial summaries
      setUnofficialSummaries(prev => ({
        ...prev,
        [group.id]: {
          groupId: group.id,
          groupName: group.name,
          headline: `Summary for ${group.name}`,
          overview: 'Chat imported. AI identified pending discussion topics and plans.',
          topics: [
            {
              id: `top-${Date.now()}`,
              topic: 'Recent Chat Discussion',
              keyPoints: ['Active conversation recorded in group.'],
              finalConclusion: 'Plan finalized according to group consensus.',
              sourceMessages: group.messages.slice(0, 3).map(m => ({
                sender: m.sender,
                timestamp: m.timestamp,
                text: m.text,
              })),
            },
          ],
          generatedAt: new Date().toISOString(),
          isDemo: true,
        },
      }));
      setActiveUnofficialGroupId(group.id);
    }

    showToast(`Added group: "${group.name}"`);
  };

  const removeGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    showToast('Group removed from GistUp.');
  };

  // Deadlines handlers
  const toggleDeadlineDone = (id: string) => {
    setDeadlines(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        const nextState = !d.completed;
        return {
          ...d,
          completed: nextState,
          completedAt: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      })
    );
  };

  const addDeadlinesFromAI = (newDeadlines: DeadlineItem[]) => {
    if (!newDeadlines || newDeadlines.length === 0) return;
    setDeadlines(prev => {
      const existing = new Set(prev.map(d => d.task.toLowerCase().trim()));
      const toAdd = newDeadlines.filter(d => !existing.has(d.task.toLowerCase().trim()));
      return [...toAdd, ...prev];
    });
  };

  // Notices handlers
  const createNotice = (notice: {
    title: string;
    category: NoticeCategory;
    color: NoticeColor;
    content: string;
    originalSender?: string;
    originalTimestamp?: string;
    originalText?: string;
  }) => {
    const newNotice: OfficialNotice = {
      id: `notice-${Date.now()}`,
      title: notice.title,
      category: notice.category,
      color: notice.color,
      content: notice.content,
      originalSender: notice.originalSender || (isAdminToggleOn ? `${studentName} (CR/Prof)` : studentName),
      originalTimestamp: notice.originalTimestamp || 'Just now',
      originalText: notice.originalText || notice.content,
      markedByAdmin: true,
      createdAt: new Date().toISOString(),
    };

    setNotices(prev => [newNotice, ...prev]);

    // If marked as Deadline category or Red color, also add to Deadlines!
    if (notice.category === 'Deadline' || notice.color === 'red') {
      const newDl: DeadlineItem = {
        id: `dl-from-notice-${Date.now()}`,
        task: notice.title,
        dueDateTime: 'As mentioned in notice',
        isDateUnclear: false,
        source: 'starred',
        sourceSender: newNotice.originalSender,
        sourceTimestamp: newNotice.originalTimestamp,
        sourceText: notice.content,
        completed: false,
      };
      setDeadlines(prev => [newDl, ...prev]);
    }

    showToast('Notice posted and star-marked by CR/Prof.');
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    showToast('Notice removed.');
  };

  // Events handlers
  const toggleEventSaved = (id: string) => {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id !== id) return ev;
        const nextSaved = !ev.isSaved;
        showToast(nextSaved ? 'Saved to My Events (Interested)' : 'Removed from My Events');
        return { ...ev, isSaved: nextSaved };
      })
    );
  };

  const addEvent = (eventData: Omit<CampusEvent, 'id' | 'postedAt' | 'postedBy'>) => {
    const newEvent: CampusEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      postedAt: 'Just now',
      postedBy: isAdminToggleOn ? `${studentName} (CR/Prof)` : studentName,
    };
    setEvents(prev => [newEvent, ...prev]);
    showToast(`Campus event "${eventData.name}" published!`);
  };

  // Onboarding handlers
  const completeOnboarding = (name: string, customGroups?: StudentGroup[]) => {
    setStudentName(name.trim() || 'Alex');
    if (customGroups && customGroups.length > 0) {
      setGroups(customGroups);
    }
    setIsOnboarded(true);
    showToast(`Welcome to GistUp, ${name || 'Alex'}!`);
  };

  const useDemoOnboarding = () => {
    setStudentName('Alex');
    setGroups(INITIAL_GROUPS);
    setFoodPhotos(INITIAL_FOOD_PHOTOS);
    setDeadlines(INITIAL_DEADLINES);
    setNotices(INITIAL_NOTICES);
    setEvents(INITIAL_EVENTS);
    setIsOnboarded(true);
    showToast('Loaded demo college groups!');
  };

  // Summarize chat
  const summarizeChat = async (rawText: string, groupName: string, groupType: 'official' | 'unofficial') => {
    setIsSummarizing(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, groupName, groupType }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          setCurrentSummary(data.summary);
          if (data.summary.deadlines && data.summary.deadlines.length > 0) {
            addDeadlinesFromAI(data.summary.deadlines);
          }
          showToast(`Summary generated for "${groupName}"!`);
        }
      }
    } catch {
      showToast('Error connecting to AI service.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const resetAllData = () => {
    setStudentName('Alex');
    setGroups(INITIAL_GROUPS);
    setFoodPhotos(INITIAL_FOOD_PHOTOS);
    setDeadlines(INITIAL_DEADLINES);
    setNotices(INITIAL_NOTICES);
    setEvents(INITIAL_EVENTS);
    setIsAdminToggleOn(false);
    setCurrentSummary(null);
    setIsOnboarded(false); // Return to onboarding so user can test the onboarding experience!
    showToast('Reset all data. Welcome back!');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        studentName,
        setStudentName,
        isOnboarded,
        completeOnboarding,
        useDemoOnboarding,
        groups,
        addGroup,
        removeGroup,
        isAdminToggleOn,
        setIsAdminToggleOn,
        aiStatus,
        refreshAiStatus,
        foodPhotos,
        latestFoodPhoto,
        addFoodPhoto,
        hideFoodPhoto,
        moveFoodPhotoMeal,
        deadlines,
        toggleDeadlineDone,
        addDeadlinesFromAI,
        notices,
        createNotice,
        deleteNotice,
        activeUnofficialGroupId,
        setActiveUnofficialGroupId,
        unofficialSummaries,
        events,
        toggleEventSaved,
        addEvent,
        currentSummary,
        isSummarizing,
        summarizeChat,
        inspectedSource,
        setInspectedSource,
        toastMessage,
        showToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
