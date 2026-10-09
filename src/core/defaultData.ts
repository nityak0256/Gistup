/**
 * Realistic default sample data for GistUp ("Get the gist. Miss nothing.").
 * Pure TypeScript, zero React dependencies.
 */

import { StudentGroup, FoodPhoto, DeadlineItem, CampusEvent, UnofficialGroupSummary, OfficialNotice } from './types';

// Helper for relative date strings
export function getRelativeDateKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function getFutureDate(daysAhead: number, hours: number, minutes: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// 1. Initial Food Photos from the Hostel Group
export const INITIAL_FOOD_PHOTOS: FoodPhoto[] = [
  // Today's dinner
  {
    id: 'food-dinner-today',
    meal: 'dinner',
    photoUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
    dishName: 'Dal Makhani, Jeera Rice & Gulab Jamun',
    sender: 'Sneha Patel',
    timestamp: '8:05 PM',
    dateKey: getRelativeDateKey(0),
    caption: 'Special Friday Dinner: Dal makhani is hot and gulab jamun is warm!',
    isHidden: false,
  },
  // Today's snacks
  {
    id: 'food-snacks-today',
    meal: 'snacks',
    photoUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    dishName: 'Hot Samosas & Masala Chai',
    sender: 'Tanmay Joshi',
    timestamp: '5:15 PM',
    dateKey: getRelativeDateKey(0),
    caption: 'Fresh samosas right out of the kadai with green chutney.',
    isHidden: false,
  },
  // Today's lunch
  {
    id: 'food-lunch-today',
    meal: 'lunch',
    photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    dishName: 'Rajma Chawal, Paneer Bhurji & Roti',
    sender: 'Karan Sharma',
    timestamp: '1:10 PM',
    dateKey: getRelativeDateKey(0),
    caption: 'Lunch counter: Paneer was fresh, rajma tadka is good.',
    isHidden: false,
  },
  // Today's breakfast
  {
    id: 'food-breakfast-today',
    meal: 'breakfast',
    photoUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    dishName: 'Crispy Masala Dosa & Sambar',
    sender: 'Arjun (Mess Sec)',
    timestamp: '8:15 AM',
    dateKey: getRelativeDateKey(0),
    caption: 'Breakfast: Hot dosas with coconut chutney and piping hot sambar.',
    isHidden: false,
  },
  // Backup photo (in case user clicks "Not food" on dinner, this one appears!)
  {
    id: 'food-dinner-prev',
    meal: 'dinner',
    photoUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
    dishName: 'Paneer Butter Masala & Butter Naan',
    sender: 'Rohan Varma',
    timestamp: '7:45 PM',
    dateKey: getRelativeDateKey(0),
    caption: 'Dinner spread: Fresh paneer butter masala.',
    isHidden: false,
  },
];

// 2. Initial Deadlines (Starred by CR/Prof + AI found)
export const INITIAL_DEADLINES: DeadlineItem[] = [
  {
    id: 'dl-star-1',
    task: 'Assignment 1 LMS Report Submission (PDF + commit SHA)',
    dueDateTime: getFutureDate(0, 23, 59).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    dueDateObj: getFutureDate(0, 23, 59).toISOString(),
    isDateUnclear: false,
    source: 'starred',
    sourceSender: 'Prof. Meera Sharma',
    sourceTimestamp: 'Yesterday, 4:40 PM',
    sourceText: 'Assignment 1 has been uploaded on LMS. Deadline for submission is tonight at 11:59 PM. Format must be a single PDF report (CS301_A1_RollNo.pdf) containing your commit SHA and test screenshots. Late penalty: 10% per day.',
    completed: false,
  },
  {
    id: 'dl-ai-1',
    task: 'Term Project Group Roster (3-4 Members Google Form)',
    dueDateTime: getFutureDate(2, 17, 0).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    dueDateObj: getFutureDate(2, 17, 0).toISOString(),
    isDateUnclear: false,
    source: 'ai',
    sourceSender: 'Prof. Meera Sharma',
    sourceTimestamp: 'Today, 2:05 PM',
    sourceText: 'Term Project Group Formation: Groups must consist of 3 or 4 students. Final roster must be submitted to Aarav via Google Form before Monday at 5:00 PM. No 2-member teams allowed.',
    completed: false,
  },
  {
    id: 'dl-star-2',
    task: 'CS301 Midterm Examination (Exam Hall 3, Units 1-3)',
    dueDateTime: getFutureDate(5, 10, 0).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    dueDateObj: getFutureDate(5, 10, 0).toISOString(),
    isDateUnclear: false,
    source: 'starred',
    sourceSender: 'Prof. Meera Sharma',
    sourceTimestamp: 'Today, 11:15 AM',
    sourceText: 'OFFICIAL EXAM RESCHEDULE: CS301 Midterm Exam has been rescheduled to next week at 10:00 AM in Examination Hall 3. Units 1-3 included; Virtual Memory is dropped from Midterm syllabus.',
    completed: false,
  },
  {
    id: 'dl-ai-2',
    task: 'Surprise Kernel Syscalls Pop Quiz',
    dueDateTime: 'Date unclear',
    isDateUnclear: true,
    source: 'ai',
    sourceSender: 'Tanmay Joshi',
    sourceTimestamp: 'Today, 12:40 PM',
    sourceText: 'One of the Section A guys mentioned in the canteen that we might have a surprise quiz on Thursday if Hall 4 is empty, not sure if confirmed.',
    completed: false,
  },
  // Completed item for collapsed section
  {
    id: 'dl-done-1',
    task: 'WSL / Linux Ubuntu QEMU Setup for xv6 labs',
    dueDateTime: 'Oct 8, 2:00 PM',
    isDateUnclear: false,
    source: 'starred',
    sourceSender: 'Aarav Nair (CR)',
    sourceTimestamp: 'Oct 8, 9:15 AM',
    sourceText: 'Please ensure you have Ubuntu 22.04 LTS or WSL2 installed before tomorrow 2 PM lab session.',
    completed: true,
    completedAt: 'Oct 8, 1:45 PM',
  },
];

// 3. Fictional Demo Campus Events with embedded QR codes
export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'event-1',
    name: 'HackGrid 2026: 24h Campus Hackathon',
    club: 'Coding & Algorithmic Society',
    posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    date: 'Oct 25 - 26, 2026',
    time: '10:00 AM onwards',
    venue: 'Computer Science Tech Park, 3rd Floor',
    whoCanJoin: 'Open to all undergraduate students (Teams of 2-4)',
    summary: 'Build innovative web, AI, and hardware prototypes in 24 hours. Free food, Red Bull, mentors from Google & Amazon, and cash prizes worth ₹1,50,000.',
    registrationDeadline: getFutureDate(1, 23, 59).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    deadlineDateObj: getFutureDate(1, 23, 59).toISOString(),
    qrCode: {
      detected: true,
      croppedImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://hackgrid2026.dev/register',
      linkUrl: 'https://hackgrid2026.dev/register',
      domain: 'hackgrid2026.dev',
    },
    isSaved: true,
    postedBy: 'Aarav Nair (CR)',
    postedAt: 'Yesterday, 3:30 PM',
  },
  {
    id: 'event-2',
    name: 'RoboWars: Combat Robotics Championship',
    club: 'Robotics & Automation Society',
    posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    date: 'Oct 29, 2026',
    time: '2:00 PM – 7:00 PM',
    venue: 'Main Sports Complex Arena',
    whoCanJoin: 'All engineering disciplines',
    summary: '15kg and 30kg combat robot duels in an armored steel cage. Witness pneumatic flippers, spinning blades, and flame-thrower rounds.',
    registrationDeadline: getFutureDate(3, 18, 0).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    deadlineDateObj: getFutureDate(3, 18, 0).toISOString(),
    qrCode: {
      detected: true,
      croppedImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://robowars.college-tech.org/signup',
      linkUrl: 'https://robowars.college-tech.org/signup',
      domain: 'robowars.college-tech.org',
    },
    isSaved: false,
    postedBy: 'Robotics Club Lead',
    postedAt: 'Today, 10:00 AM',
  },
  {
    id: 'event-3',
    name: 'BeatDrop Campus Music Night & DJ Battle',
    club: 'Cultural & Performing Arts Council',
    posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    date: 'Nov 02, 2026',
    time: '6:30 PM – 10:30 PM',
    venue: 'Open Air Amphitheatre',
    whoCanJoin: 'All campus residents & day scholars with College ID',
    summary: 'Annual EDM and indie rock night featuring student bands and headline guest DJ Nucleya. Food stalls and light shows.',
    registrationDeadline: getFutureDate(6, 20, 0).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    deadlineDateObj: getFutureDate(6, 20, 0).toISOString(),
    qrCode: {
      detected: true,
      croppedImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://beatdrop.live/passes',
      linkUrl: 'https://beatdrop.live/passes',
      domain: 'beatdrop.live',
    },
    isSaved: false,
    postedBy: 'Cultural Council Admin',
    postedAt: 'Oct 07, 1:15 PM',
  },
  {
    id: 'event-4',
    name: 'DesignSprint: UI/UX Case Study Challenge',
    club: 'Product & Design Guild',
    posterUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
    date: 'Nov 08, 2026',
    time: '4:00 PM – 6:30 PM',
    venue: 'Seminar Hall B, Design Wing',
    whoCanJoin: 'Students interested in Figma, User Research, and Product Management',
    summary: 'A fast-paced product redesign workshop. Learn how to conduct 15-minute user tests and create high-converting mobile interfaces.',
    registrationDeadline: 'Not mentioned',
    qrCode: {
      detected: true,
      croppedImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://designsprint.xyz/apply',
      linkUrl: 'https://designsprint.xyz/apply',
      domain: 'designsprint.xyz',
    },
    isSaved: false,
    postedBy: 'Design Guild Lead',
    postedAt: 'Oct 05, 11:00 AM',
  },
];

// 4. Initial Demo Student Groups
export const INITIAL_GROUPS: StudentGroup[] = [
  {
    id: 'grp-official-cs301',
    name: 'CS301: Operating Systems (Official)',
    type: 'official',
    chatText: `10/10/24, 08:30 - Aarav Nair (CR): Good morning everyone. Welcome to the official group for CS301 Operating Systems (Fall 2024). Prof. Meera Sharma is with us for all syllabus and exam notices.
10/10/24, 09:15 - Prof. Meera Sharma: First announcement: The reference textbook is Silberschatz, Operating System Concepts, 10th Edition.
10/10/24, 11:00 - Prof. Meera Sharma: Important Notice regarding Attendance: Minimum 75% attendance in both lectures and practical labs is mandatory as per university ordinance.
10/10/24, 11:30 - Aarav Nair (CR): Class timetable change for this Monday: The 9:00 AM lecture is shifted to 2:00 PM in Audi-2 due to the department guest seminar.
10/10/24, 16:40 - Prof. Meera Sharma: Assignment 1 has been uploaded on LMS. Deadline for submission is Friday, October 18 at 11:59 PM. Late penalty: 10% per day.
10/11/24, 11:15 - Prof. Meera Sharma: OFFICIAL EXAM RESCHEDULE: CS301 Midterm Exam has been rescheduled to Monday, October 28 at 10:00 AM in Examination Hall 3. Units 1-3 included; Virtual Memory is dropped from Midterm syllabus.
10/11/24, 14:05 - Prof. Meera Sharma: Term Project Group Formation: Groups must consist of 3 or 4 students. Final roster must be submitted to Aarav via Google Form before Monday, October 21 at 5:00 PM. No 2-member teams allowed.`,
    messages: [
      {
        id: 'msg-cs-1',
        sender: 'Prof. Meera Sharma',
        timestamp: 'Yesterday, 4:40 PM',
        text: 'Assignment 1 has been uploaded on LMS. Deadline for submission is tonight at 11:59 PM. Late penalty: 10% per day.',
        isStarred: true,
        starredBy: 'Prof. Meera Sharma (demo)',
      },
      {
        id: 'msg-cs-2',
        sender: 'Prof. Meera Sharma',
        timestamp: 'Today, 11:15 AM',
        text: 'OFFICIAL EXAM RESCHEDULE: CS301 Midterm Exam has been rescheduled to next week at 10:00 AM in Examination Hall 3. Units 1-3 included; Virtual Memory is dropped from Midterm syllabus.',
        isStarred: true,
        starredBy: 'Prof. Meera Sharma (demo)',
      },
      {
        id: 'msg-cs-3',
        sender: 'Prof. Meera Sharma',
        timestamp: 'Today, 2:05 PM',
        text: 'Term Project Group Formation: Groups must consist of 3 or 4 students. Final roster must be submitted to Aarav via Google Form before Monday at 5:00 PM.',
        isStarred: false,
      },
    ],
  },

  {
    id: 'grp-unofficial-quad',
    name: 'The Quad Gang (Hostel 4)',
    type: 'unofficial',
    chatText: `10/10/24, 18:00 - Kabir Sen: Finally done with the 3-hour OS lab.
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
10/10/24, 18:30 - Tanmay Joshi: Tickets booked! Interstellar IMAX, Friday 7:30 PM at PVR Forum, seats J12-J16. Anyone who hasn't paid yet, please GPay me by tomorrow noon.`,
    messages: [],
  },

  {
    id: 'grp-hostel-mess',
    name: 'Hostel 4 Mess Updates',
    type: 'hostel',
    chatText: '',
    messages: [],
  },
];

// 5. Initial Unofficial Group Summary
export const INITIAL_UNOFFICIAL_SUMMARY: UnofficialGroupSummary = {
  groupId: 'grp-unofficial-quad',
  groupName: 'The Quad Gang (Hostel 4)',
  headline: 'Friday Movie Night Locked & Domino’s Pizza Ordered',
  overview: 'The group debated movie choices between Interstellar and Dune 2, confirmed IMAX tickets for Friday 7:30 PM, and ordered pizzas for dinner.',
  topics: [
    {
      id: 'top-1',
      topic: 'Friday Night Movie Outing',
      keyPoints: [
        'Sneha and Kabir voted for the Interstellar IMAX re-release over Dune 2.',
        'Tanmay located 5 prime seats in Row J at PVR Forum for the Friday 7:30 PM show.',
        'Tickets are ₹320 each; Sneha and Rohan paid immediately via GPay.',
      ],
      finalConclusion: 'Interstellar IMAX at PVR Forum, Friday 7:30 PM. Tanmay booked 5 tickets (Row J, ₹320 each). Pay Tanmay by tomorrow noon.',
      sourceMessages: [
        { sender: 'Tanmay Joshi', timestamp: '18:18', text: 'PVR Forum has Friday 7:30 PM show. Tickets are ₹320 each. Should I book 5 seats in row J?' },
        { sender: 'Tanmay Joshi', timestamp: '18:30', text: 'Tickets booked! Interstellar IMAX, Friday 7:30 PM at PVR Forum, seats J12-J16. Anyone who hasn\'t paid yet, please GPay me by tomorrow noon.' },
      ],
    },
    {
      id: 'top-2',
      topic: "Tonight's Group Dinner",
      keyPoints: [
        'Refused mess tinda sabzi; searched Swiggy for delivery discounts.',
        'Dominos had an active 40% discount coupon.',
      ],
      finalConclusion: 'Ordered 2 Large Farmhouse Pizzas with cheese burst to Room 302 common room.',
      sourceMessages: [
        { sender: 'Sneha Patel', timestamp: '18:04', text: 'Eww no tinda. Swiggy has 40% off on Dominos.' },
        { sender: 'Kabir Sen', timestamp: '18:08', text: 'Ordered! Delivering to Room 302 common room in 30 mins.' },
      ],
    },
    {
      id: 'top-3',
      topic: 'Weekend Road Trip',
      keyPoints: [
        'Rohan suggested an early morning scooter ride to Nandi Hills.',
        'Kabir mentioned revisions needed for upcoming Midterms.',
      ],
      finalConclusion: 'No conclusion yet (postponed until after Midterm exam on Oct 28).',
      sourceMessages: [
        { sender: 'Kabir Sen', timestamp: '18:45', text: 'Let’s talk about road trips after midterm exams.' },
      ],
    },
  ],
  generatedAt: new Date().toISOString(),
  isDemo: true,
};

// 6. Initial Official Notices marked by Admin (CR/Prof)
export const INITIAL_NOTICES: OfficialNotice[] = [
  {
    id: 'notice-midterm-reschedule',
    title: 'Midterm Exam Rescheduled to Oct 28 & Syllabus Trimmed',
    category: 'Exam',
    color: 'red', // Urgent
    content: 'CS301 Midterm Exam has been rescheduled to Monday, October 28 at 10:00 AM in Examination Hall 3. Units 1-3 included; Virtual Memory is dropped from Midterm syllabus.',
    originalSender: 'Prof. Meera Sharma',
    originalTimestamp: 'Today, 11:15 AM',
    originalText: 'OFFICIAL EXAM RESCHEDULE: CS301 Midterm Exam has been rescheduled to Monday, October 28 at 10:00 AM in Examination Hall 3. Units 1-3 included; Virtual Memory is dropped from Midterm syllabus.',
    markedByAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice-assignment1-deadline',
    title: 'Assignment 1 LMS Submission Due Tonight',
    category: 'Deadline',
    color: 'red', // Urgent
    content: 'Assignment 1 submission portal is live on LMS. Format must be a single PDF (CS301_A1_RollNo.pdf) containing commit SHA and test output. Late penalty: 10% per day.',
    originalSender: 'Prof. Meera Sharma',
    originalTimestamp: 'Yesterday, 4:40 PM',
    originalText: 'Assignment 1 has been uploaded on LMS. Deadline for submission is Friday, October 18 at 11:59 PM. Late penalty: 10% per day.',
    markedByAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice-timetable-shift',
    title: 'Monday 9 AM Lecture Shifted to 2 PM (Audi-2)',
    category: 'Timetable',
    color: 'orange', // Important
    content: 'Class timetable change for this Monday: The 9:00 AM lecture is shifted to 2:00 PM in Audi-2 due to the guest lecture by visiting IIT Delhi professor.',
    originalSender: 'Aarav Nair (CR)',
    originalTimestamp: 'Yesterday, 11:30 AM',
    originalText: 'Class timetable change for this Monday: The 9:00 AM lecture is shifted to 2:00 PM in Audi-2 due to the department guest seminar.',
    markedByAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice-attendance-ordinance',
    title: 'Mandatory 75% Attendance Ordinance strictly enforced',
    category: 'General Info',
    color: 'blue', // Normal
    content: 'Minimum 75% attendance in both lectures and practical labs is mandatory as per university ordinance. Medical certificates must be submitted within 3 days of absence.',
    originalSender: 'Prof. Meera Sharma',
    originalTimestamp: 'Oct 10, 11:00 AM',
    originalText: 'Important Notice regarding Attendance: Minimum 75% attendance in both lectures and practical labs is mandatory as per university ordinance.',
    markedByAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice-reference-books',
    title: 'Silberschatz 10th Edition Soft Copy Available in Drive',
    category: 'General Info',
    color: 'green', // FYI
    content: 'The primary reference textbook is Silberschatz, Operating System Concepts, 10th Edition. Practice problems from Chapters 3 & 4 have been starred for review.',
    originalSender: 'Aarav Nair (CR)',
    originalTimestamp: 'Oct 10, 9:15 AM',
    originalText: 'First announcement: The reference textbook is Silberschatz, Operating System Concepts, 10th Edition.',
    markedByAdmin: true,
    createdAt: new Date().toISOString(),
  },
];
