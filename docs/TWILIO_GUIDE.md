# Twilio Setup Guide

## 1. Create a Twilio Account
1. Go to [twilio.com](https://twilio.com) and sign up (free trial available)
2. Verify your personal phone number

## 2. Get a Phone Number
1. In the Twilio Console, click **Phone Numbers → Manage → Buy a Number**
2. Search for a number with SMS capability
3. Buy it (free with trial credit)

## 3. Get Your Credentials
From the Twilio Console homepage, copy:
- **Account SID** → `TWILIO_ACCOUNT_SID`
- **Auth Token** → `TWILIO_AUTH_TOKEN`
- Your purchased number → `TWILIO_PHONE_NUMBER` (in +1XXXXXXXXXX format)

## 4. Set the Webhook URL
This is how Twilio calls your app when a lead replies.

1. Go to **Phone Numbers → Manage → Active Numbers**
2. Click your number
3. Under **Messaging Configuration → A message comes in**:
   - Set to: `Webhook`
   - URL: `https://your-app.vercel.app/api/twilio/webhook`
   - Method: `HTTP POST`
4. Click **Save**

## 5. Local Development Webhook
Twilio can't reach `localhost`, so use [ngrok](https://ngrok.com):

```bash
# Install ngrok, then:
ngrok http 3000
```

Copy the `https://xxxxx.ngrok.io` URL and set it as the webhook URL temporarily.

## 6. Trial Account Limitations
On a free trial:
- You can only send SMS to **verified** phone numbers
- Go to **Verified Caller IDs** to add test numbers

Upgrade to a paid account to send to any number.
