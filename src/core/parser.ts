/**
 * WhatsApp chat parser (Pure TypeScript, Zero React dependencies).
 * Extracts timestamps, senders, multiline messages, photo attachments, and skips system noise.
 */

import { ChatMessage } from './types';

const ANDROID_REGEX = /^(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s+-\s+(.+)$/;
const IOS_REGEX = /^\[(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s+(.+)$/;

const SYSTEM_PHRASES = [
  'messages and calls are end-to-end encrypted',
  'this message was deleted',
  'you deleted this message',
  '<this message was edited>',
  'joined using this group',
  'left',
  'added',
  'removed',
  'changed the subject to',
  'changed the group description',
  'security code changed',
  'created group',
];

export function isSystemMessage(senderOrText: string, textContent?: string): boolean {
  const combined = `${senderOrText} ${textContent || ''}`.toLowerCase().trim();
  return SYSTEM_PHRASES.some(phrase => combined.includes(phrase));
}

export function parseWhatsAppExport(rawText: string): {
  messages: ChatMessage[];
  stats: { totalLines: number; validCount: number; senders: string[] };
} {
  if (!rawText || !rawText.trim()) {
    return { messages: [], stats: { totalLines: 0, validCount: 0, senders: [] } };
  }

  const cleanedText = rawText.replace(/[\u200e\u200f\u202a-\u202e]/g, '');
  const lines = cleanedText.split(/\r?\n/);

  const messages: ChatMessage[] = [];
  let currentMsg: ChatMessage | null = null;
  const sendersSet = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line && !currentMsg) continue;

    let match = line.match(ANDROID_REGEX);
    if (!match) match = line.match(IOS_REGEX);

    if (match) {
      const datePart = match[1].trim();
      const timePart = match[2].trim();
      const remainder = match[3].trim();

      const colonIdx = remainder.indexOf(':');
      if (colonIdx > 0) {
        const sender = remainder.substring(0, colonIdx).trim();
        const text = remainder.substring(colonIdx + 1).trim();

        if (isSystemMessage(sender, text)) {
          currentMsg = null;
          continue;
        }

        sendersSet.add(sender);

        // Check if text indicates a photo
        let photoUrl: string | undefined;
        let cleanText = text;
        const photoMatch = text.match(/(?:<Media omitted>|IMG-\d+-WA\d+\.jpg|\(file attached\))/i);
        if (photoMatch && !text.replace(photoMatch[0], '').trim()) {
          cleanText = '📷 Photo attached';
        }

        const newMsg: ChatMessage = {
          id: `msg-${messages.length + 1}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: `${datePart}, ${timePart}`,
          dateStr: datePart,
          sender,
          text: cleanText,
          photoUrl,
          isSystem: false,
          raw: line,
        };

        messages.push(newMsg);
        currentMsg = newMsg;
      } else {
        currentMsg = null;
      }
    } else {
      if (currentMsg) {
        currentMsg.text += `\n${line}`;
        currentMsg.raw += `\n${line}`;
      }
    }
  }

  return {
    messages,
    stats: {
      totalLines: lines.length,
      validCount: messages.length,
      senders: Array.from(sendersSet),
    },
  };
}
