// Google Calendar helper — fetches free slots and creates events
import { google } from 'googleapis';

// Build an authenticated OAuth2 client using stored refresh token
export function getOAuthClient(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

// Return the Google OAuth consent URL so the agent can connect their calendar
export function getAuthUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent', // force refresh_token to always be returned
  });
}

// Exchange the one-time auth code for tokens
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Fetch the next N available 30-minute slots during business hours
export async function getAvailableSlots(
  refreshToken: string,
  calendarId: string,
  businessHours: { start: string; end: string }, // e.g. { start: "09:00", end: "17:00" }
  daysAhead = 3,
  slotsNeeded = 3
): Promise<string[]> {
  const auth = getOAuthClient(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + daysAhead);

  // Get existing events to find busy times
  const busyResponse = await calendar.freebusy.query({
    requestBody: {
      timeMin: now.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  const busyTimes = busyResponse.data.calendars?.[calendarId]?.busy ?? [];

  const available: string[] = [];
  const cursor = new Date(now);
  cursor.setMinutes(0, 0, 0);
  cursor.setHours(cursor.getHours() + 1); // start from the next full hour

  while (available.length < slotsNeeded && cursor < end) {
    const [startHour] = businessHours.start.split(':').map(Number);
    const [endHour] = businessHours.end.split(':').map(Number);
    const hour = cursor.getHours();

    // Skip outside business hours and weekends
    const day = cursor.getDay();
    if (day === 0 || day === 6 || hour < startHour || hour >= endHour) {
      cursor.setHours(cursor.getHours() + 1);
      continue;
    }

    const slotEnd = new Date(cursor);
    slotEnd.setMinutes(30);

    // Check if this slot overlaps with any busy time
    const isConflict = busyTimes.some((busy) => {
      const bStart = new Date(busy.start!);
      const bEnd = new Date(busy.end!);
      return cursor < bEnd && slotEnd > bStart;
    });

    if (!isConflict) {
      available.push(
        cursor.toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      );
    }

    cursor.setHours(cursor.getHours() + 1);
  }

  return available;
}

// Create a Google Calendar event for a confirmed appointment
export async function createCalendarEvent(
  refreshToken: string,
  calendarId: string,
  title: string,
  description: string,
  startTime: Date,
  durationMinutes = 30
): Promise<string> {
  const auth = getOAuthClient(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: title,
      description,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
    },
  });

  return event.data.id ?? '';
}
