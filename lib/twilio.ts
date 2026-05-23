// Twilio helper — sends SMS and validates incoming webhooks
import twilio from 'twilio';

// Build a Twilio client using environment variables
export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not set in environment variables.');
  }

  return twilio(accountSid, authToken);
}

// Send an outbound SMS message to a lead
export async function sendSMS(to: string, body: string): Promise<void> {
  const client = getTwilioClient();
  await client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER!,
    body,
  });
}

// Validate that an incoming request really came from Twilio
// Pass the full request URL and the request body as a URL-params object
export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  return twilio.validateRequest(authToken, signature, url, params);
}
