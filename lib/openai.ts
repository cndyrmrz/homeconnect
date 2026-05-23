// OpenAI helper — runs the AI conversation for lead qualification and booking
import OpenAI from 'openai';

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set.');
  return new OpenAI({ apiKey });
}

// The system prompt defines how the AI behaves as a real estate appointment setter
const SYSTEM_PROMPT = `You are a friendly and professional AI assistant for a real estate agent.
Your job is to:
1. Greet the lead warmly by name
2. Ask 1-2 short qualifying questions (budget, timeline, area of interest, buying or renting)
3. Overcome simple objections politely (e.g. "just browsing" → ask if they'd like a free 15-min call)
4. Offer 2-3 specific appointment time slots from the available times provided
5. Confirm the booking once the lead picks a time

Rules:
- Keep every message SHORT (2-4 sentences max) — this is SMS, not email
- Be warm, not pushy
- Never ask more than one question per message
- Once appointment is booked, confirm it and say the agent will be in touch — then stop
- If the lead says they're not interested, thank them politely and stop
- Never make up information about properties

When you have successfully booked an appointment, end your message with exactly:
[APPOINTMENT_BOOKED: <ISO datetime the lead chose>]
This tag is parsed by the system — always include it when a booking is confirmed.`;

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Generate the next AI reply given conversation history and available time slots
export async function generateAIReply(
  messages: ChatMessage[],
  leadName: string,
  availableSlots: string[] // e.g. ["Monday June 3 at 10am", "Monday June 3 at 2pm"]
): Promise<string> {
  const client = getOpenAIClient();

  // Inject available time slots into the system prompt at call time
  const slotsText =
    availableSlots.length > 0
      ? `\n\nAvailable appointment slots to offer:\n${availableSlots.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
      : '\n\nNo specific slots available yet — ask the lead for their preferred time.';

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini', // Fast and cost-effective for conversational SMS
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + slotsText },
      ...messages,
    ],
    max_tokens: 200, // Keep replies short — this is SMS
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() ?? 'Hi! Could you give me a moment to connect you with our agent?';
}

// Check if the AI's reply contains a booking confirmation tag
export function extractBookingFromReply(reply: string): string | null {
  const match = reply.match(/\[APPOINTMENT_BOOKED:\s*([^\]]+)\]/);
  return match ? match[1].trim() : null;
}
