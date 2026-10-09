/**
 * Core domain types for GistUp ("Get the gist. Miss nothing.").
 * Pure TypeScript, zero React dependencies.
 */

import { MealType } from './mealConfig';

export type GroupType = 'official' | 'unofficial' | 'hostel';

export interface ChatMessage {
  id: string;
  sender: string;
  timestamp: string; // e.g. "10/10/24, 08:30" or "8:30 AM"
  dateStr?: string;
  text: string;
  photoUrl?: string;
  isStarred?: boolean;      // Star-marked by CR/Professor
  starredBy?: string;       // e.g. "Marked by CR/Prof (demo)"
  starredAt?: string;
  raw?: string;
  isSystem?: boolean;
}

export interface StudentGroup {
  id: string;
  name: string;
  type: GroupType;
  chatText: string;
  messages: ChatMessage[];
  lastActivity?: string;
}

export interface FoodPhoto {
  id: string;
  meal: MealType;
  photoUrl: string;
  dishName: string;
  sender: string;
  timestamp: string;
  dateKey: string;
  caption?: string;
  isHidden: boolean;
}

export interface DeadlineItem {
  id: string;
  task: string;
  dueDateTime?: string; // Display string, e.g. "Oct 18, 11:59 PM" or "Date unclear"
  dueDateTimeStr?: string; // Backwards compatible alias
  dueDateObj?: string; // ISO string if parseable
  isDateUnclear: boolean;
  source: 'starred' | 'ai'; // 'starred' = "Marked by CR/Prof (demo)", 'ai' = "AI found"
  sourceSender: string;
  sourceTimestamp: string;
  sourceText: string;
  completed: boolean;
  completedAt?: string;
}

export interface TopicSummary {
  id: string;
  topic: string;
  keyPoints: string[];
  finalConclusion: string; // e.g. "Interstellar IMAX Friday 7:30 PM..." or "No conclusion yet"
  sourceMessages: {
    sender: string;
    timestamp: string;
    text: string;
  }[];
}

export interface UnofficialGroupSummary {
  groupId: string;
  groupName: string;
  headline: string;
  overview: string;
  topics: TopicSummary[];
  generatedAt: string;
  isDemo: boolean;
}

export interface CampusEvent {
  id: string;
  name: string;
  club: string;
  posterUrl: string;
  date: string;
  time: string;
  venue: string;
  whoCanJoin: string;
  summary: string;
  registrationDeadline: string; // e.g. "Oct 22, 11:59 PM" or "Not mentioned"
  deadlineDateObj?: string;
  qrCode: {
    detected: boolean;
    croppedImageUrl?: string;
    linkUrl?: string;
    domain?: string;
  };
  isSaved?: boolean; // Interested button
  postedBy: string;
  postedAt: string;
}

export type NoticeColor = 'red' | 'orange' | 'blue' | 'green';
export type NoticeCategory = 'Deadline' | 'Exam' | 'Timetable' | 'General Info';

export interface OfficialNotice {
  id: string;
  title: string;
  category: NoticeCategory;
  color: NoticeColor;
  content: string;
  originalSender: string;
  originalTimestamp: string;
  originalText: string;
  markedByAdmin?: boolean;
  createdAt: string;
}

export interface ChatSummaryResult {
  id?: string;
  groupName: string;
  groupType: 'official' | 'unofficial';
  summaryLength?: 'quick' | 'standard' | 'detailed';
  headline?: string;
  overview?: string;
  generatedAt?: string;
  createdAt?: string;
  isDemo: boolean;
  announcements?: any[];
  deadlines?: DeadlineItem[];
  tasks?: any[];
  questions?: any[];
  topics?: any[];
  officialData?: {
    announcements: {
      id: string;
      title: string;
      content: string;
      sender: string;
      timestamp: string;
      sourceText: string;
    }[];
    deadlines: DeadlineItem[];
    timetableChanges: {
      id: string;
      title: string;
      content: string;
      sender: string;
      timestamp: string;
    }[];
    actionItems: {
      id: string;
      task: string;
      assignee?: string;
      completed: boolean;
    }[];
  };
  unofficialData?: UnofficialGroupSummary;
}
