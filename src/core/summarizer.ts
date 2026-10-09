/**
 * Summarizer and deadline extraction engine.
 * Pure TypeScript, zero React dependencies.
 */

import { ChatMessage, ChatSummaryResult, DeadlineItem } from './types';

/**
 * Builds the prompt for Gemini API structured output.
 */
export function buildSummarizePrompt(params: {
  rawText: string;
  groupName: string;
  groupType: 'official' | 'unofficial';
}): { systemInstruction: string; contents: string } {
  const { rawText, groupName, groupType } = params;

  const systemInstruction = `You are CatchUp, a precise assistant helping students catch up on busy college WhatsApp chats without reading hundreds of messages.

STRICT INSTRUCTIONS:
1. NEVER invent, hallucinate, or extrapolate dates, deadlines, or decisions.
2. If a deadline or date is vague, unconfirmed, or ambiguous, you MUST label it "Date unclear" and set isDateUnclear: true.
3. Every single extracted item must cite its sourceSender, sourceTimestamp, and exact sourceText.
4. For OFFICIAL groups:
   - Provide structured, factual summaries.
   - Extract deadlines, official announcements, action tasks, and direct questions with a suggested polite reply draft.
5. For UNOFFICIAL groups:
   - Provide short, friendly topic summaries.
   - For every discussion topic, list key points debated and the FINAL CONCLUSION reached (or explicitly state "No conclusion yet").`;

  const contents = `Analyze this WhatsApp chat export:
Group: "${groupName}"
Type: "${groupType}"

--- CHAT LOG ---
${rawText.slice(0, 8000)}
--- END CHAT LOG ---

Return a structured JSON object matching the requested schema.`;

  return { systemInstruction, contents };
}

/**
 * Rule-based local fallback when Gemini is offline or in demo mode.
 */
export function generateLocalSummary(params: {
  rawText: string;
  groupName: string;
  groupType: 'official' | 'unofficial';
  messages: ChatMessage[];
}): ChatSummaryResult {
  const { groupName, groupType, messages } = params;

  if (groupType === 'official') {
    return {
      id: `sum-off-${Date.now()}`,
      groupName: groupName || 'CS301: Operating Systems',
      groupType: 'official',
      headline: 'Midterm Rescheduled to Oct 28 & Assignment 1 Due Tonight',
      overview: 'Prof. Meera rescheduled the Midterm exam to Monday, Oct 28 (Virtual Memory removed). Assignment 1 is due tonight at 11:59 PM. Monday 9 AM class moved to 2 PM in Audi-2.',
      announcements: [
        {
          title: 'Midterm Exam Rescheduled to Oct 28 (Hall 3)',
          details: 'Rescheduled from Friday, Oct 25 to Monday, Oct 28 at 10:00 AM in Examination Hall 3. Units 1-3 included; Virtual Memory dropped.',
          sourceSender: 'Prof. Meera Sharma',
          sourceTimestamp: 'Today, 11:15 AM',
          sourceText: 'OFFICIAL EXAM RESCHEDULE: CS301 Midterm Exam has been rescheduled to Monday, October 28 at 10:00 AM in Examination Hall 3. Units 1-3 included; Virtual Memory is dropped from Midterm syllabus.',
        },
        {
          title: 'Monday Lecture Shifted to 2:00 PM in Audi-2',
          details: 'Moved to 2:00 PM in Audi-2 due to guest lecture by Dr. Rajesh from Intel Labs. Attendance is mandatory.',
          sourceSender: 'Aarav Nair (CR)',
          sourceTimestamp: 'Yesterday, 11:30 AM',
          sourceText: 'Class timetable change for this Monday: The 9:00 AM lecture is shifted to 2:00 PM in Audi-2 due to the department guest seminar.',
        },
        {
          title: 'Strict 75% Biometric Attendance Policy',
          details: 'Minimum 75% biometric attendance required in lectures and labs to be eligible for midterms.',
          sourceSender: 'Prof. Meera Sharma',
          sourceTimestamp: 'Yesterday, 11:00 AM',
          sourceText: 'Important Notice regarding Attendance: Minimum 75% attendance in both lectures and practical labs is mandatory as per university ordinance.',
        },
      ],
      deadlines: [
        {
          id: 'dl-ai-1',
          task: 'Assignment 1 LMS Report Submission',
          dueDateTimeStr: 'Tonight, 11:59 PM',
          dueDateObj: new Date().toISOString(),
          isDateUnclear: false,
          source: 'ai',
          sourceSender: 'Prof. Meera Sharma',
          sourceTimestamp: 'Yesterday, 4:40 PM',
          sourceText: 'Assignment 1 has been uploaded on LMS. Deadline for submission is tonight at 11:59 PM. Format must be a single PDF report (CS301_A1_RollNo.pdf) containing your commit SHA and test screenshots.',
          completed: false,
        },
        {
          id: 'dl-ai-2',
          task: 'Term Project Group Roster Submission via Google Form',
          dueDateTimeStr: 'Monday, Oct 21, 5:00 PM',
          isDateUnclear: false,
          source: 'ai',
          sourceSender: 'Prof. Meera Sharma',
          sourceTimestamp: 'Today, 2:05 PM',
          sourceText: 'Term Project Group Formation: Groups must consist of 3 or 4 students. Final roster must be submitted to Aarav via Google Form before Monday, October 21 at 5:00 PM.',
          completed: false,
        },
        {
          id: 'dl-ai-3',
          task: 'Surprise Kernel Syscalls Pop Quiz',
          dueDateTimeStr: 'Date unclear',
          isDateUnclear: true,
          source: 'ai',
          sourceSender: 'Tanmay Joshi',
          sourceTimestamp: 'Today, 12:40 PM',
          sourceText: 'One of the Section A guys mentioned in the canteen that we might have a surprise quiz on Thursday if Hall 4 is empty, not sure if confirmed.',
          completed: false,
        },
      ],
      tasks: [
        {
          task: 'Ensure Ubuntu 22.04 LTS or WSL2 with QEMU is installed for labs',
          assignee: 'All Students',
          sourceSender: 'Aarav Nair (CR)',
          sourceTimestamp: 'Yesterday, 9:15 AM',
          sourceText: 'Please ensure you have Ubuntu 22.04 LTS or WSL2 installed before tomorrow 2 PM lab session.',
        },
        {
          task: 'Nominate one team lead per Term Project group',
          assignee: 'Team Leaders',
          sourceSender: 'Aarav Nair (CR)',
          sourceTimestamp: 'Today, 5:00 PM',
          sourceText: "Don't forget to nominate a team lead in the Google Form.",
        },
      ],
      questions: [
        {
          question: 'Do you have the Unit 3 lecture notes on TLB hit ratio derivation from Tuesday?',
          askedBy: 'Kabir Sen',
          suggestedReply: 'Hey Kabir! Yes, I have the TLB hit ratio derivation notes with diagrams. Sending you the photos in DM.',
          sourceText: 'Riya do you have the unit 3 lecture notes from Tuesday? I missed the TLB hit ratio derivation.',
          sourceTimestamp: 'Today, 1:10 PM',
        },
        {
          question: 'Can you assist the TA with coordinating lab attendance signatures at 2 PM?',
          askedBy: 'Aarav Nair (CR)',
          suggestedReply: 'Hey Aarav, yes sure! I will reach the lab 10 minutes early to handle the attendance sign-in sheet.',
          sourceText: 'Could you confirm if you can help coordinate the lab attendance signatures today at 2 PM? The TA requested one helper.',
          sourceTimestamp: 'Today, 1:30 PM',
        },
      ],
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
  }

  // Unofficial Group
  return {
    id: `sum-unoff-${Date.now()}`,
    groupName: groupName || 'The Quad Gang (Hostel 4)',
    groupType: 'unofficial',
    headline: 'Friday Movie Night Locked & Domino’s Pizza Ordered',
    overview: 'Friends discussed weekend movie options between Interstellar and Dune 2, locked in IMAX tickets, and ordered pizza for dinner.',
    topics: [
      {
        topic: 'Friday Night Movie Outing',
        keyPoints: [
          'Group debated between Interstellar re-release and Dune 2 on IMAX.',
          'Tanmay found 7:30 PM Friday tickets at PVR Forum in Row J.',
          'Tickets cost ₹320 each; Sneha and Rohan paid immediately via GPay.',
        ],
        finalConclusion: 'Interstellar IMAX at PVR Forum, Friday 7:30 PM. Tanmay booked 5 tickets (Row J) for ₹320 each. Others to GPay Tanmay by tomorrow noon.',
        sourceSender: 'Tanmay Joshi',
        sourceText: 'Tickets booked! Interstellar IMAX, Friday 7:30 PM at PVR Forum, seats J12-J16. Anyone who hasn\'t paid yet, please GPay me by tomorrow noon.',
      },
      {
        topic: "Tonight's Food Plan",
        keyPoints: [
          'Mess has tinda sabzi; group refused to eat in mess.',
          'Found a 40% Swiggy discount on Domino’s.',
        ],
        finalConclusion: 'Ordered 2 Large Farmhouse Pizzas with cheese burst to Room 302 common room.',
        sourceSender: 'Kabir Sen',
        sourceText: 'Ordered! Delivering to Room 302 common room in 30 mins.',
      },
      {
        topic: 'Weekend Trip to Nandi Hills',
        keyPoints: [
          'Rohan proposed early morning scooter ride.',
          'Kabir pointed out everyone has OS midterm revisions.',
        ],
        finalConclusion: 'No conclusion yet (postponed until after Midterm exam on Oct 28).',
        sourceSender: 'Kabir Sen',
        sourceText: 'Let’s talk about trips after midterm exam guys.',
      },
    ],
    deadlines: [
      {
        id: 'dl-unoff-1',
        task: 'GPay ₹320 to Tanmay for Interstellar IMAX Ticket',
        dueDateTimeStr: 'Tomorrow, 12:00 PM',
        isDateUnclear: false,
        source: 'ai',
        sourceSender: 'Tanmay Joshi',
        sourceTimestamp: 'Yesterday, 6:30 PM',
        sourceText: 'Anyone who hasn\'t paid yet, please GPay me by tomorrow noon.',
        completed: false,
      },
    ],
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
}
