// Main dashboard — server component fetches data, client components handle animation
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardClient from './DashboardClient';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Fetch all data in parallel
  const [leadsRes, appointmentsRes, convRes] = await Promise.all([
    supabase
      .from('leads')
      .select('id, name, phone, status, created_at')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('appointments')
      .select('id, scheduled_at, status, leads(name, phone)')
      .eq('agent_id', user.id)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at')
      .limit(5),
    supabase
      .from('conversations')
      .select('id, status, updated_at, lead_id')
      .eq('agent_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <DashboardLayout user={user}>
      <DashboardClient
        leads={leadsRes.data ?? []}
        appointments={appointmentsRes.data ?? []}
        conversations={convRes.data ?? []}
        agentId={user.id}
      />
    </DashboardLayout>
  );
}
