# Email and SMS Setup Guide for Pay4Me

## Gmail Email Setup (Free)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the steps to enable it (you'll need your phone)

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or Other)
3. Click "Generate"
4. Copy the 16-character password (example: `abcd efgh ijkl mnop`)
5. Save this password - you'll need it!

### Step 3: Add to Render Environment Variables
1. Go to https://dashboard.render.com
2. Click on your "pay4mee" service
3. Go to "Environment" tab
4. Add these variables:
   - Key: `EMAIL_USER` Value: `your-email@gmail.com`
   - Key: `EMAIL_PASS` Value: `abcdefghijklmnop` (the app password)

---

## SMS Setup Options

### Option A: Termii (Recommended for Nigeria) - Paid Service

#### Why Termii?
- Nigerian company, perfect for Nigerian numbers
- Pricing: ~₦2-4 per SMS
- Fast delivery
- Good for Nigerian customers

#### Setup Steps:
1. Go to https://termii.com
2. Click "Sign Up" or "Get Started"
3. Fill in your business details
4. Verify your email
5. Log in to your dashboard
6. Go to "API Settings" or "Integration"
7. Copy your API Key (looks like: `TLxxxxxxxxxxxxxxxxxxxx`)
8. Choose a Sender ID (e.g., "Pay4Me" - needs approval)

#### Add to Render:
- Key: `TERMII_API_KEY` Value: `TLxxxxxxxxxxxxxxxxxxxx`
- Key: `TERMII_SENDER_ID` Value: `Pay4Me`

#### Pricing:
- Sign up and purchase SMS units
- Minimum: ₦5,000 (~2,500 SMS)
- Pay as you go

---

### Option B: Twilio (International) - Paid Service

#### Why Twilio?
- Works globally
- More expensive for Nigeria
- Trial: $15 free credit

#### Setup Steps:
1. Go to https://www.twilio.com/try-twilio
2. Sign up with your email
3. Verify your phone number
4. Get $15 free trial credit
5. Go to Console Dashboard
6. Note these values:
   - Account SID: `ACxxxxxxxxxxxxxxxxxxxx`
   - Auth Token: `xxxxxxxxxxxxxxxxxxxxxxxx`
7. Get a Twilio phone number from the console

#### Add to Render:
- Key: `TWILIO_ACCOUNT_SID` Value: `ACxxxxxxxxxxxxxxxxxxxx`
- Key: `TWILIO_AUTH_TOKEN` Value: `xxxxxxxxxxxxxxxxxxxxxxxx`
- Key: `TWILIO_PHONE_NUMBER` Value: `+1234567890`

#### Pricing:
- $1.00 per phone number/month
- ~$0.0075 per SMS to Nigeria

---

### Option C: Demo Mode (Free - For Testing Only)

#### No Setup Required!
- OTP will be shown in console logs and API response
- Perfect for development and testing
- No actual SMS/Email sent
- Just don't add the API keys to Render

---

## Recommended Setup for You

### For Testing/Development:
**Use Demo Mode** - No setup needed, OTP shows in response

### For Production:
1. **Gmail** (Free) - Set up for email OTP
2. **Termii** (Paid ~₦2/SMS) - Best for Nigerian SMS
   OR
3. **Twilio** (Free trial $15) - If you want to test SMS for free first

---

## Quick Start (Testing Without Setup)

Your app already works in demo mode! Just:
1. Register on your site
2. Click "Verify via Email" or "Verify via SMS"
3. Click "Send OTP"
4. The OTP will appear in the success message
5. Copy and paste it in the verification box

---

## Need Help?

Let me know which option you want to set up and I'll guide you through it step by step!
