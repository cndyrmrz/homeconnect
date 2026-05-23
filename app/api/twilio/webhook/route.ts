// POST /api/twilio/webhook — Twilio calls this URL when a lead replies to an SMS
// Set this URL in your Twilio console under your phone number's messaging webhook
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateTwilioSignature, sendSMS } from '@/lib/twilio';
import { generateAIReply, extractBookingFromReply, type ChatMessage } from '@/lib/openai';
import { getAvailableSlots, createCalendarEvent } from '@/lib/google-calendar';

export async function POST(req: NextRequest) {
  try {
    // Parse the URL-encoded form body that Twilio sends
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => { params[key] = value.toString(); });

    // Validate the request is genuinely from Twilio
    const signature = req.headers.get('x-twilio-signature') ?? '';
    const url = process.env.NEXT_PUBLIC_APP_URL + '/api/twilio/webhook';
    const isValid = validateTwilioSignature(url, params, signature);

    if (!isValid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid Twilio signature' }, { status: 403 });
    }

    const fromPhone = params['From'];   // lead's phone number
    const messageBody = params['Body']; // what the lead texted

    const supabase = createAdminClient();

    // Find the lead by phone number
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', fromPhone)
      .single();

    if (!lead) {
      console.warn('Received SMS from unknown number:', fromPhone);
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Fetch the active conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Append the new message from the lead
    const messages: ChatMessage[] = conversation.messages ?? [];
    messages.push({ role: 'user', content: messageBody });

    // Fetch agent settings for calendar access
    const { data: agentSettings } = await supabase
      .from('agent_settings')
      .select('*')
      .eq('agent_id', lead.agent_id)
      .single();

    // Try to get available calendar slots if Google Calendar is connected
    let availableSlots: string[] = [];
    if (agentSettings?.google_refresh_token && agentSettings?.google_calendar_id) {
      try {
        availableSlots = await getAvailableSlots(
          agentSettings.google_refresh_token,
          agentSettings.google_calendar_id,
          agentSettings.business_hours ?? { start: '09:00', end: '17:00' }
        );
      } catch (e) {
        console.warn('Could not fetch calendar slots:', e);
      }
    }

    // Generate AI reply
    const aiReply = await generateAIReply(messages, lead.name, availableSlots);

    // Append AI reply to the conversation
    messages.push({ role: 'assistant', content: aiReply });

    // Check if the AI confirmed a booking
    const bookedTime = extractBookingFromReply(aiReply);

    if (bookedTime) {
      // Parse the booked time and create a calendar event
      const appointmentDate = new Date(bookedTime);

      let googleEventId = '';
      if (agentSettings?.google_refresh_token && agentSettings?.google_calendar_id) {
        try {
          googleEventId = await createCalendarEvent(
            agentSettings.google_refresh_token,
            agentSettings.google_calendar_id,
            `Real Estate Consultation — ${lead.name}`,
            `Lead interest: ${lead.interest ?? 'not specified'}\nPhone: ${lead.phone}\nEmail: ${lead.email ?? '—'}`,
            appointmentDate
          );
        } catch (e) {
          console.warn('Calendar event creation failed:', e);
        }
      }

      // Save the appointment
      await supabase.from('appointments').insert({
        lead_id: lead.id,
        agent_id: lead.agent_id,
        scheduled_at: appointmentDate.toISOString(),
        google_event_id: googleEventId,
        status: 'confirmed',
      });

      // Mark lead and conversation as complete
      await supabase.from('leads').update({ status: 'booked' }).eq('id', lead.id);
      await supabase.from('conversations').update({ status: 'completed', messages }).eq('id', conversation.id);
    } else {
      // Keep conversation going — just save the updated messages
      await supabase
        .from('conversations')
        .update({ messages, updated_at: new Date().toISOString() })
        .eq('id', conversation.id);
    }

    // Send the AI's reply back via SMS
    const cleanReply = aiReply.replace(/\[APPOINTMENT_BOOKED:[^\]]+\]/g, '').trim();
    await sendSMS(fromPhone, cleanReply);

    // Respond to Twilio with an empty TwiML response (we sent the reply manually above)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (err: any) {
    console.error('Twilio webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
