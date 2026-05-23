# Supabase Setup Guide

## 1. Create a Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Choose a name, set a strong database password, pick a region close to you
4. Wait ~2 minutes for the project to be ready

## 2. Get Your API Keys
Go to **Project Settings → API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`
  - ⚠️ Never expose `service_role` to the browser — server-side only

## 3. Run the Database Schema
1. In Supabase, click **SQL Editor → New Query**
2. Open `docs/schema.sql` from this project
3. Paste the entire contents and click **Run**
4. You should see "Success" — all 4 tables are now created with RLS enabled

## 4. Enable Email Auth
1. Go to **Authentication → Providers**
2. Make sure **Email** is enabled
3. For production, configure a custom SMTP server under **Authentication → SMTP Settings**
   (Supabase's built-in mailer has rate limits)

## 5. Confirm Email Settings (Development)
To skip email confirmation during local testing:
1. Go to **Authentication → Email Templates**
2. Or: **Authentication → Settings → Disable email confirmations** (dev only)

## 6. Row Level Security
The schema already enables RLS on all tables. Each agent can only see their own rows.
The `service_role` key bypasses RLS — it's used in webhook routes where we need to write
data without an authenticated session (Twilio webhook comes from Twilio, not the browser).
