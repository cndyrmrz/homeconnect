 # HomeConnect AI — Real Estate Appointment Setter

An AI-powered SMS appointment setter for real estate agents.

**Flow:** Lead submits form → AI texts them → AI qualifies and books an appointment → Google Calendar event created.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Database + Auth | Supabase |
| SMS | Twilio |
| AI | OpenAI GPT-4o-mini |
| Calendar | Google Calendar API |
| Deployment | Vercel |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- A Supabase account and project
- A Twilio account with a phone number
- An OpenAI API key
- A Google Cloud project with Calendar API enabled (optional)

### 1. Install dependencies
```bash
cd real-estate-ai-setter
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in all values. See the guides below.

### 3. Set up the database
Follow [docs/SUPABASE_GUIDE.md](docs/SUPABASE_GUIDE.md), then run `docs/schema.sql` in the Supabase SQL Editor.

### 4. Set up Twilio
Follow [docs/TWILIO_GUIDE.md](docs/TWILIO_GUIDE.md).

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Set up the Twilio webhook (for local testing)
Install ngrok and run:
```bash
ngrok http 3000
```
Set the webhook URL in Twilio to `https://your-ngrok-url.ngrok.io/api/twilio/webhook`.

---

## Pages

| URL | Description |
|---|---|
| `/` | Agent login / sign up |
| `/dashboard` | Overview stats and recent activity |
| `/leads` | All leads + manual add form |
| `/leads/capture` | Public form to share with prospects |
| `/appointments` | All booked appointments |
| `/settings` | API keys and calendar connection |

---

## Deploying to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create my-app --public --push
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)

### 3. Set Environment Variables
In Vercel → Project → Settings → Environment Variables, add all values from your `.env.local`.

Change `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL, e.g.:
```
NEXT_PUBLIC_APP_URL=https://my-app.vercel.app
```

Also update `GOOGLE_REDIRECT_URI`:
```
GOOGLE_REDIRECT_URI=https://my-app.vercel.app/api/auth/callback
```

### 4. Deploy
Click **Deploy**. Vercel auto-deploys on every push to main.

### 5. Update Twilio Webhook
After deployment, go to Twilio → your phone number → set the webhook to:
```
https://your-app.vercel.app/api/twilio/webhook
```

---

## Required API Keys

| Key | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) → API Keys |
| `TWILIO_ACCOUNT_SID` | [console.twilio.com](https://console.twilio.com) → Account Info |
| `TWILIO_AUTH_TOKEN` | [console.twilio.com](https://console.twilio.com) → Account Info |
| `TWILIO_PHONE_NUMBER` | Twilio → Phone Numbers → your number |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_REDIRECT_URI` | Your app URL + `/api/auth/callback` |

---

## Google Calendar Setup (Optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable the **Google Calendar API**
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add your redirect URI: `https://your-app.vercel.app/api/auth/callback`
7. Copy the Client ID and Client Secret to your environment variables
8. In the app, go to **Settings → Connect Google Calendar**

---

## How the AI Works

1. A lead submits the capture form at `/leads/capture`
2. The API creates a lead record and a conversation record in Supabase
3. The AI generates an opening message and sends it via Twilio
4. When the lead replies, Twilio calls the webhook at `/api/twilio/webhook`
5. The webhook fetches the conversation history, generates an AI reply, and sends it back
6. The AI qualifies the lead with 1-2 questions, then offers available calendar slots
7. When the lead picks a time, the AI confirms and tags the message with `[APPOINTMENT_BOOKED: ...]`
8. The webhook creates a Google Calendar event and saves the appointment to Supabase
9. The conversation is marked `completed` and the lead status is set to `booked`

---

## File Structure

```
├── app/
│   ├── page.tsx                    # Login
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── leads/page.tsx              # Lead management
│   ├── leads/capture/page.tsx      # Public lead form
│   ├── appointments/page.tsx       # Appointments
│   ├── settings/page.tsx           # API key settings
│   └── api/
│       ├── leads/route.ts          # Create lead + trigger AI
│       ├── twilio/webhook/route.ts # Handle SMS replies
│       ├── appointments/route.ts   # List appointments
│       ├── auth/google/route.ts    # Start Google OAuth
│       └── auth/callback/route.ts  # Google OAuth callback
├── components/
│   ├── Navbar.tsx
│   ├── LeadForm.tsx
│   └── LeadTable.tsx
├── lib/
│   ├── supabase/client.ts          # Browser Supabase client
│   ├── supabase/server.ts          # Server Supabase client
│   ├── twilio.ts                   # SMS sending + validation
│   ├── openai.ts                   # AI conversation + booking detection
│   └── google-calendar.ts         # Calendar slots + event creation
├── docs/
│   ├── schema.sql                  # Run this in Supabase
│   ├── SUPABASE_GUIDE.md
│   └── TWILIO_GUIDE.md
├── middleware.ts                   # Auth protection for dashboard routes
└── .env.example                    # Copy to .env.local
```
