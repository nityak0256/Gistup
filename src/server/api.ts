/**
 * Server-side API handler for GistUp ("Get the gist. Miss nothing.").
 * Uses Google GenAI SDK (gemini-3.8-flash) ONLY on the server side.
 * Zero API keys exposed to the client.
 */

import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { generateLocalSummary } from '../core/summarizer';

export const apiRouter = Router();

function isApiKeyAvailable(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY');
}

function getGeminiClient(): GoogleGenAI | null {
  if (!isApiKeyAvailable()) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// GET /api/status
apiRouter.get('/status', (req: Request, res: Response) => {
  const connected = isApiKeyAvailable();
  res.json({
    status: 'ok',
    aiConnected: connected,
    mode: connected ? 'live' : 'demo',
    model: 'gemini-3.8-flash',
    info: connected
      ? 'Live AI connected via Gemini 3.8 Flash'
      : 'Demo mode active (Rule-based detection + pre-written sample results)',
  });
});

// POST /api/summarize (Official & Unofficial Chats with Gemini Structured JSON)
apiRouter.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { rawText = '', groupName = 'WhatsApp Group', groupType = 'official' } = req.body;

    if (!isApiKeyAvailable()) {
      const fallback = generateLocalSummary({
        rawText,
        groupName,
        groupType,
        messages: [],
      });
      return res.json({ success: true, summary: fallback, isDemo: true });
    }

    const ai = getGeminiClient();
    if (!ai) throw new Error('AI client unavailable');

    const promptText = `You are GistUp, an AI conversation assistant that helps college students catch up on busy WhatsApp chats without reading hundreds of messages.
Group: "${groupName}"
Type: "${groupType}"

--- CHAT EXPORT ---
${rawText.slice(0, 8000)}
--- END CHAT EXPORT ---

Rules:
1. NEVER invent, hallucinate, or extrapolate dates, deadlines, or decisions.
2. If a deadline or date is vague, unconfirmed, or ambiguous, you MUST label it "Date unclear" and set isDateUnclear: true.
3. Every item must cite its sourceSender, sourceTimestamp, and exact sourceText quote.
${
  groupType === 'official'
    ? `4. Official groups: Provide headline, overview, structured announcements, deadlines, and questions directed at members with polite draft replies.`
    : `4. Unofficial groups: Provide headline, overview, distinct discussion topics with key points and the FINAL CONCLUSION reached (or explicitly "No conclusion yet"), and any money/task deadlines.`
}
`;

    const schemaProperties: any = {
      headline: { type: Type.STRING },
      overview: { type: Type.STRING },
    };

    if (groupType === 'official') {
      schemaProperties.announcements = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            details: { type: Type.STRING },
            sourceSender: { type: Type.STRING },
            sourceTimestamp: { type: Type.STRING },
            sourceText: { type: Type.STRING },
          },
          required: ['title', 'details', 'sourceSender', 'sourceText'],
        },
      };
      schemaProperties.deadlines = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            task: { type: Type.STRING },
            dueDateTimeStr: { type: Type.STRING },
            isDateUnclear: { type: Type.BOOLEAN },
            sourceSender: { type: Type.STRING },
            sourceTimestamp: { type: Type.STRING },
            sourceText: { type: Type.STRING },
          },
          required: ['task', 'dueDateTimeStr', 'isDateUnclear', 'sourceSender', 'sourceText'],
        },
      };
      schemaProperties.questions = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            askedBy: { type: Type.STRING },
            suggestedReply: { type: Type.STRING },
            sourceText: { type: Type.STRING },
            sourceTimestamp: { type: Type.STRING },
          },
          required: ['question', 'askedBy', 'suggestedReply', 'sourceText'],
        },
      };
    } else {
      schemaProperties.topics = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            finalConclusion: { type: Type.STRING },
            sourceSender: { type: Type.STRING },
            sourceText: { type: Type.STRING },
          },
          required: ['topic', 'keyPoints', 'finalConclusion'],
        },
      };
      schemaProperties.deadlines = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            task: { type: Type.STRING },
            dueDateTimeStr: { type: Type.STRING },
            isDateUnclear: { type: Type.BOOLEAN },
            sourceSender: { type: Type.STRING },
            sourceTimestamp: { type: Type.STRING },
            sourceText: { type: Type.STRING },
          },
          required: ['task', 'dueDateTimeStr', 'isDateUnclear', 'sourceSender', 'sourceText'],
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: ['headline', 'overview'],
        },
      },
    });

    if (!response || !response.text) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(response.text);
    return res.json({
      success: true,
      summary: {
        id: `sum-${Date.now()}`,
        groupName,
        groupType,
        headline: parsed.headline || 'Chat Summary',
        overview: parsed.overview || '',
        announcements: parsed.announcements || [],
        deadlines: (parsed.deadlines || []).map((dl: any, idx: number) => ({
          ...dl,
          id: dl.id || `dl-ai-${idx}-${Date.now()}`,
          dueDateTime: dl.dueDateTimeStr,
          source: 'ai',
          completed: false,
        })),
        questions: parsed.questions || [],
        topics: parsed.topics || [],
        isDemo: false,
        generatedAt: new Date().toISOString(),
      },
      isDemo: false,
    });
  } catch (err: any) {
    console.error('Error generating summary with Gemini, using fallback:', err);
    const fallback = generateLocalSummary({
      rawText: req.body?.rawText || '',
      groupName: req.body?.groupName || 'WhatsApp Group',
      groupType: req.body?.groupType || 'official',
      messages: [],
    });
    return res.json({ success: true, summary: fallback, isDemo: true, warning: err.message });
  }
});

// POST /api/analyze-poster (Gemini Vision for Event Posters)
apiRouter.post('/analyze-poster', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', manualDeadline = '' } = req.body;

    if (!imageBase64 || !isApiKeyAvailable()) {
      // Return high quality demo extraction
      return res.json({
        success: true,
        extracted: {
          name: 'Campus TechFest & Innovation Summit 2026',
          club: 'IEEE Student Branch',
          date: 'Nov 12, 2026',
          time: '9:30 AM – 5:00 PM',
          venue: 'Main Auditorium & Exhibition Hall',
          whoCanJoin: 'Open to all college students & faculty',
          summary: 'A day-long summit with keynote talks on generative AI, hands-on IoT workshops, and student startup showcases with industry venture funds.',
          registrationDeadline: manualDeadline || 'Nov 10, 11:59 PM',
        },
        isDemo: true,
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      throw new Error('AI client unavailable');
    }

    // Clean base64 data
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        {
          text: `You are GistUp, extracting event details from this college campus poster.
Extract ONLY what is explicitly visible on the poster image.
If something is not visible or not mentioned, return "Not mentioned". NEVER invent dates or venues.
Extract:
- name: event title
- club: organizing club or committee
- date: event date
- time: event time
- venue: location
- whoCanJoin: eligibility
- summary: 2-3 line plain-English overview
- registrationDeadline: explicitly mentioned registration deadline or last date to register. If absent, use "${manualDeadline || 'Not mentioned'}".`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            club: { type: Type.STRING },
            date: { type: Type.STRING },
            time: { type: Type.STRING },
            venue: { type: Type.STRING },
            whoCanJoin: { type: Type.STRING },
            summary: { type: Type.STRING },
            registrationDeadline: { type: Type.STRING },
          },
          required: ['name', 'club', 'date', 'summary', 'registrationDeadline'],
        },
      },
    });

    if (!response || !response.text) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(response.text);
    return res.json({
      success: true,
      extracted: parsed,
      isDemo: false,
    });
  } catch (err: any) {
    console.error('Error analyzing poster with Gemini Vision:', err);
    return res.json({
      success: true,
      extracted: {
        name: 'Campus Tech Event',
        club: 'Student Activity Center',
        date: 'Next Weekend',
        time: 'TBA',
        venue: 'College Campus',
        whoCanJoin: 'All Students',
        summary: 'Campus student event extracted from poster image.',
        registrationDeadline: req.body?.manualDeadline || 'Not mentioned',
      },
      isDemo: true,
      warning: err.message,
    });
  }
});

// POST /api/summarize-unofficial
apiRouter.post('/summarize-unofficial', async (req: Request, res: Response) => {
  try {
    const { chatText = '', groupName = 'Chat Group' } = req.body;

    if (!isApiKeyAvailable()) {
      return res.json({
        success: true,
        summary: {
          groupName,
          headline: 'Friday Movie Night Locked & Domino’s Pizza Ordered',
          overview: 'The group debated movie choices between Interstellar and Dune 2, confirmed IMAX tickets for Friday 7:30 PM, and ordered pizzas for dinner.',
          topics: [
            {
              id: 'top-1',
              topic: 'Friday Night Movie Outing',
              keyPoints: [
                'Group debated between Interstellar IMAX and Dune 2.',
                'Tanmay booked 5 tickets in Row J at PVR Forum for Friday 7:30 PM show.',
                'Tickets cost ₹320 each; Sneha and Rohan paid immediately via GPay.',
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
                'Refused mess tinda sabzi; searched Swiggy for discounts.',
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
                'Rohan suggested an early morning scooter ride.',
                'Kabir mentioned revisions needed for upcoming Midterms.',
              ],
              finalConclusion: 'No conclusion yet (postponed until after Midterm exams).',
              sourceMessages: [
                { sender: 'Kabir Sen', timestamp: '18:45', text: 'Let’s talk about road trips after midterm exams.' },
              ],
            },
          ],
          generatedAt: new Date().toISOString(),
          isDemo: true,
        },
      });
    }

    const ai = getGeminiClient();
    if (!ai) throw new Error('AI client unavailable');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are GistUp, summarizing this unofficial WhatsApp friends/hostel chat:
Group: "${groupName}"

--- CHAT LOG ---
${chatText.slice(0, 7000)}
--- END CHAT LOG ---

Instructions:
1. Group into distinct discussion topics.
2. Ignore jokes and filler.
3. For each topic: extract key points debated, and the FINAL CONCLUSION reached (or explicitly state "No conclusion yet" and what is still undecided).
4. Do NOT invent anything not said. Provide exact source quotes for key decisions.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            overview: { type: Type.STRING },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  finalConclusion: { type: Type.STRING },
                  sourceSender: { type: Type.STRING },
                  sourceText: { type: Type.STRING },
                },
                required: ['topic', 'keyPoints', 'finalConclusion'],
              },
            },
          },
          required: ['headline', 'overview', 'topics'],
        },
      },
    });

    if (!response || !response.text) throw new Error('Empty response');

    const parsed = JSON.parse(response.text);
    return res.json({
      success: true,
      summary: {
        groupId: 'grp-custom',
        groupName,
        headline: parsed.headline || 'Chat Summary',
        overview: parsed.overview || '',
        topics: (parsed.topics || []).map((t: any, idx: number) => ({
          id: `top-${idx}-${Date.now()}`,
          topic: t.topic,
          keyPoints: t.keyPoints || [],
          finalConclusion: t.finalConclusion || 'No conclusion yet',
          sourceMessages: t.sourceText ? [{ sender: t.sourceSender || 'Chat', timestamp: 'In chat', text: t.sourceText }] : [],
        })),
        generatedAt: new Date().toISOString(),
        isDemo: false,
      },
    });
  } catch (err: any) {
    console.error('Error generating unofficial summary:', err);
    return res.status(500).json({ error: err.message });
  }
});
