import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LeadsClient from './LeadsClient';

export const metadata = { title: 'Leads' };

export default async function LeadsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: leads } = await supabase
    .from('leads')
    .select('*, conversations(id, status, updated_at, messages)')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout user={user}>
      <LeadsClient leads={leads ?? []} agentId={user.id} />
    </DashboardLayout>
  );
}
