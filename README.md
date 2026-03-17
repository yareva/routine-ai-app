# 🧠 Routine AI

> **Built in 2 hours at Agents for Impact Hackathon · March 16, 2026**
> Powered by NVIDIA

**[Live Demo →](https://v0-routine-ai-app.vercel.app/)**

---

## What It Does

Just rant about your day — Routine AI turns it into a clean, time-blocked schedule.

No forms, no dropdowns, no structure required. You dump whatever's on your plate and the app figures out the rest:

> *"I have an exam tomorrow and two homework assignments due at midnight, but I also want to do yoga at 6 and I have class at 2:30 and a meeting at 10:30 AM"*

That's it. Hit the button and get back a full structured day.

---

## Features

- 🎙️ **Voice-first input** — tap the mic, rant about your day, get a schedule back
- ⌨️ **Text fallback** — prefer typing? tap "or type" for a minimal inline textarea
- 📷 **Scan mode** — photograph a to-do list, supplement label, or anything printed; OCR reads it and builds a routine from it
- 🕐 **Time-of-day context** — morning / afternoon / night toggle so the schedule fits where you're at
- 📋 **Animated schedule output** — time-block cards with color-coded tags (focus, urgent, break, meeting, admin, personal)
- 📊 **Summary stats** — tasks, focus hours, and breaks at a glance
- 🗂️ **History** — past routines saved locally so you can reference what you built before

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Deployment | Vercel |
| AI Scheduling | NVIDIA Nemotron (`nvidia/llama-3.1-nemotron-ultra-253b-v1`) |
| Speech-to-Text | NVIDIA ASR API |
| Image OCR | NVIDIA Infer API |

All APIs are NVIDIA — called via `https://integrate.api.nvidia.com/v1`.

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/routine-ai.git
cd routine-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

Create a `.env` file in the root:

```env
VITE_NVIDIA_API_KEY=your_nvidia_api_key_here
```

### 4. Run locally

```bash
npm run dev
```

---

## How It Works

### Voice Mode
1. Tap the mic → speak freely about your day
2. Audio sent as base64 to the NVIDIA ASR (speech-to-text) endpoint
3. Transcript appears below the mic as a floating caption
4. "Make my routine" sends it to Nemotron

### Scan Mode
1. Tap the camera icon → file picker opens (camera on mobile)
2. Image sent as base64 to the NVIDIA OCR endpoint
3. Extracted text is passed to Nemotron with a scan-specific prompt
4. A checkmark preview replaces the camera icon once processed

### Text Mode
Tap "or type" → inline textarea expands → type your brain dump → submit

### Schedule Output (all modes)
Nemotron returns structured JSON:

```json
{
  "summary": { "tasks": 6, "focus_hours": 3, "free_blocks": 2 },
  "blocks": [
    {
      "time": "9:00 AM",
      "duration": "30 min",
      "title": "Meeting prep",
      "note": "Review notes beforehand",
      "tag": "focus"
    }
  ]
}
```

Cards animate in one by one with a staggered slide-up effect.

---

## System Prompts

**Brain dump:**
> "You are a calm, no-nonsense personal scheduler. Return ONLY raw JSON, no markdown. 6–10 blocks, always include a break and a meal."

**Scan mode:**
> "You are a routine expert. Build a practical ordered routine from the scanned label text — skincare, supplements, meal prep, workout, cleaning, anything. Flag conflicts in notes."

---

## Roadmap

- [ ] Voice as the default input (text as opt-in fallback)
- [ ] End-of-day reflection check-in
- [ ] Auto-prioritization
- [ ] Calendar integration with follow-up reminders
- [ ] Optional stress score / productivity rating

---

## Hackathon

Built at **Agents for Impact**, hosted by NVIDIA · March 16, 2026  
**Nemotron requirement:** ✅

---

## License

MIT
