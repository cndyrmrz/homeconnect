import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import SettingsClient from './SettingsClient';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: settings } = await supabase
    .from('agent_settings')
    .select('*')
    .eq('agent_id', user.id)
    .single();

  return (
    <DashboardLayout user={user}>
      <SettingsClient initialSettings={settings} agentId={user.id} />
    </DashboardLayout>
  );
}
