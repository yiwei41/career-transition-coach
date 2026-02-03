<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UHMC3HsS0GGhH9-VaoK7A3xkZu4tvoHx

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy [.env.example](.env.example) to `.env.local` and set `GEMINI_API_KEY` to your [Gemini API key](https://aistudio.google.com/apikey).
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs at [http://localhost:3000](http://localhost:3000).
