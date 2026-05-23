// POST /api/leads — creates a new lead, saves it to the DB, and triggers the AI SMS
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/twilio';
import { generateAIReply } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, interest, agentId } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // If agentId is provided (manual add from dashboard) use it;
    // otherwise this is a public form submission — find the first agent (single-agent MVP)
    let resolvedAgentId = agentId;
    if (!resolvedAgentId) {
      const { data: agentRow } = await supabase.auth.admin.listUsers();
      resolvedAgentId = agentRow?.users?.[0]?.id;
    }

    if (!resolvedAgentId) {
      return NextResponse.json({ error: 'No agent found.' }, { status: 500 });
    }

    // Save the lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({ agent_id: resolvedAgentId, name, phone, email, interest, status: 'new' })
      .select()
      .single();

    if (error) throw error;

    // Create an empty conversation record for this lead
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({ lead_id: lead.id, agent_id: resolvedAgentId, messages: [], status: 'active' })
      .select()
      .single();

    // Build the opening AI message
    const openingMessages = [
      { role: 'user' as const, content: `Hi, I'm ${name}. I'm interested in ${interest || 'real estate'}.` }
    ];

    const aiReply = await generateAIReply(openingMessages, name, []);

    // Store the opening exchange in the conversation
    await supabase
      .from('conversations')
      .update({
        messages: [
          { role: 'user', content: openingMessages[0].content, timestamp: new Date().toISOString() },
          { role: 'assistant', content: aiReply, timestamp: new Date().toISOString() },
        ],
      })
      .eq('id', conversation.id);

    // Update lead status to "contacted"
    await supabase.from('leads').update({ status: 'contacted' }).eq('id', lead.id);

    // Send the SMS to the lead
    await sendSMS(phone, aiReply.replace(/\[APPOINTMENT_BOOKED:[^\]]+\]/g, '').trim());

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err: any) {
    console.error('POST /api/leads error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}

// GET /api/leads — returns all leads for the authenticated agent
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
