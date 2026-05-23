import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import AppointmentsClient from './AppointmentsClient';

export const metadata = { title: 'Appointments' };

export default async function AppointmentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, leads(name, phone, email, interest)')
    .eq('agent_id', user.id)
    .order('scheduled_at', { ascending: true });

  return (
    <DashboardLayout user={user}>
      <AppointmentsClient appointments={appointments ?? []} />
    </DashboardLayout>
  );
}
