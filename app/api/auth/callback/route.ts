// GET /api/auth/callback — handles Google OAuth callback and saves the refresh token
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=no_code', req.url));
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // Save the refresh token so we can make calendar calls later
    await supabase
      .from('agent_settings')
      .upsert(
        { agent_id: user.id, google_refresh_token: tokens.refresh_token, google_connected: true },
        { onConflict: 'agent_id' }
      );

    return NextResponse.redirect(new URL('/settings?google=connected', req.url));
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/settings?error=oauth_failed', req.url));
  }
}
