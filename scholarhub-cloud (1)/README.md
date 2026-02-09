
# ScholarHub Cloud 🎓

ScholarHub is a decentralized academic repository where students can store, share, and intelligently analyze academic papers. Powered by **Google Gemini AI** and **Google Drive**.

## ✨ Key Features

- **Google Drive Storage**: All files are synced directly to a central or personal Google Drive node.
- **AI Paper Summaries**: Instantly generate 2-sentence intellectual briefs for any document.
- **Neural Audio Briefs**: Listen to AI summaries using Gemini's Text-to-Speech.
- **ScholarBot Research Assistant**: An AI chat interface with Google Search grounding for real citations.
- **Community Chat**: Real-time discussion node for collaboration.

## 🚀 Deployment Guide

### Environment Variables
You must set the following variables in your hosting provider (Vercel/Netlify):

- `API_KEY`: Your Google Gemini API Key.
- `GOOGLE_CLIENT_ID`: Your OAuth 2.0 Client ID from Google Cloud Console.

### Google Cloud Console Setup
1. Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2. Enable the **Google Drive API**.
3. Create **OAuth 2.0 Credentials** (Web Application).
4. Add your production URL (e.g., `https://my-scholarhub.vercel.app`) to:
   - **Authorized JavaScript Origins**
5. Configure the **OAuth Consent Screen** to allow access to `.../auth/drive.file`.

## 🛠 Tech Stack
- **React 19**
- **Tailwind CSS** (Neural Glassmorphism UI)
- **Google Gemini 1.5/2.5** (LLM & TTS)
- **Google Drive v3 API**
