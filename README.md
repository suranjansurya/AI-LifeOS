# AI LifeOS — Premium AI Personal Operating System

> **"Know what matters. Know what to do next."**

AI LifeOS is a state-of-the-art, proactive AI Personal Operating System designed to analyze your workload, goals, deadlines, and focus patterns to recommend your **Next Best Action**.

---

## 🌟 Core Features

- **Proactive AI Command Center**: Real-time workload breakdown and Next Best Action spotlight card powered by multi-factor intelligence scoring (0–100).
- **Smart AI Daily Scheduler**: Time-blocked daily schedule generator creating realistic timelines with buffer breaks and zero overlapping events.
- **AI Task Breakdown Generator**: Decomposes complex projects into bite-sized actionable subtasks with explicit user confirmation.
- **Focus Intelligence Engine**: Direct task-connected focus timer with distraction logger, automatic task completion on finish, and productivity session logging.
- **Persistent AI Memory Bank**: Inspectable, editable, and deletable preference storage injected into LLM context prompts without privacy risks.
- **Smart Notifications**: Contextual notifications for approaching deadlines, postponed items, and focus reminders.
- **Advanced Data-Driven Insights**: Analytics engine generating velocity, peak energy, and focus trends from real local data.
- **Zero API Key Exposure**: Architecture routes all AI calls through a secure Node.js/Express backend server (`port 3001`). No frontend key leaks.
- **Automatic Local Fallback**: Graceful local command parser fallback if Gemini API key or backend server is unavailable.

---

## 🛠️ Architecture & Technology Stack

```
┌────────────────────────┐         ┌───────────────────────────┐         ┌────────────────────────┐
│  React 19 + Vite UI    │  fetch  │   Express API Server      │  HTTPS  │  Google Gemini API     │
│  (http://localhost:5173)├────────►│   (http://localhost:3001) ├────────►│  (gemini-1.5-flash)    │
└────────────────────────┘  /api/  └─────────────┬─────────────┘  REST   └────────────────────────┘
                                                 │
                                                 ▼
                                     [ GEMINI_API_KEY in .env ]
```

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7.
- **Backend API**: Node.js ES Modules, Express-compatible API architecture listening on Port `3001`.
- **AI Provider**: Google Gemini 1.5 Flash REST API + Context Engine.
- **Persistence**: LocalStorage repository with JSON parse fallbacks.

---

## ⚙️ Environment Configuration

Create `.env` inside `server/`:

```env
# server/.env
PORT=3001
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> Get a free Gemini API Key at [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Backend API Server (Port 3001)
```bash
cd server
node index.js
```

### 3. Start Frontend Development Server (Port 5173)
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 📦 Production Build & Verification

```bash
cd frontend
npm run build
```

---

## 🔒 Security Architecture

- **Server-Side API Key Protection**: `GEMINI_API_KEY` is strictly accessed within `server/.env`.
- **Git Safety**: `server/.env` and `.env` are included in `.gitignore`.
- **Zero Exposure**: No `VITE_*` environment variables or frontend API keys exist.
