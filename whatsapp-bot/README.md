# 🤖 Nexus Clinic - WhatsApp Auto Reminder Bot

This standalone Node.js microservice runs independently to check for upcoming appointments and send personalized WhatsApp reminders based on the doctor's custom templates.

## 🚀 Setup & Installation

1. Open a new terminal and navigate to the `whatsapp-bot` folder:
```bash
cd whatsapp-bot
```

2. Install all required dependencies from package.json:
```bash
npm install
```

3. Start the bot:
```bash
npm start
```
*(or run `node index.js`)*

## 📱 How to link WhatsApp
Once you start the bot, a **QR Code** will be generated and printed directly inside your terminal window. 
- Open the WhatsApp App on your phone.
- Go to Settings > **Linked Devices**.
- Scan the terminal QR code.

The bot will authenticate automatically and save your session (so you don't need to scan the code every time). It will begin polling your Supabase database every **1 minute**.

## ⚡ Features
- **Zero Vercel Timeout:** Node.js script avoids API delays and serverless timeout boundaries.
- **Doctor Specific Settings:** Actively detects and targets doctors where `is_reminders_enabled: true`.
- **Dynamic Variable Replacements:** Replaces `{{patient_name}}`, `{{time}}`, and `{{date}}` in seconds.
- **Anti-Spam Shield:** Ensures only one message per appointment by writing true to the `reminder_sent` Boolean in Supabase Database.
