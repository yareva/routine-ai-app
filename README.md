# 🧠 Routine AI

> **Built in 2 hours at Agents for Impact Hackathon · March 16, 2026**
> Powered by NVIDIA Nemotron

**[Live Demo →](https://v0-routine-ai-app.vercel.app/)**

---

## What It Does

Routine AI turns your chaotic thoughts into a clean, time-blocked daily schedule — using your voice, camera, or keyboard.

Speak (or type, or snap a photo of) your day: errands, meetings, tasks, supplements, whatever's on your mind. The app runs it through NVIDIA's Nemotron AI and returns a structured, color-coded schedule in seconds.

---

## Features

- 🎙️ **Voice-first input** — tap the mic, speak your brain dump, get a schedule
- 📷 **Scan mode** — photograph a to-do list, supplement label, grocery list, or anything printed; OCR extracts the text and builds a routine from it
- ⌨️ **Text fallback** — "or type" expands a minimal inline textarea
- 🕐 **Context-aware** — morning / afternoon / night toggle shapes the output
- 📋 **Animated schedule output** — time-block cards with color-coded tags (focus, urgent, break, meeting, admin, personal)
- 📊 **Summary stats** — tasks, focus hours, and breaks at a glance
- 🗂️ **History drawer** — past routines stored locally, accessible anytime

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Deployment | Vercel |
| AI Scheduling | NVIDIA Nemotron (`nvidia/llama-3.1-nemotron-ultra-253b-v1`) |
| Speech-to-Text | NVIDIA ASR API |
| OCR | NVIDIA Infer API |

All NVIDIA APIs are called via `https://integrate.api.nvidia.com/v1`.

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
1. User taps the mic button → browser records audio
2. Audio is sent as base64 to the NVIDIA ASR endpoint
3. Transcript appears as a floating caption below the mic
4. "Make my routine" sends the transcript to Nemotron

### Scan Mode
1. User taps the camera icon → file picker opens (camera on mobile)
2. Image is converted to base64 and sent to the NVIDIA OCR endpoint
3. Extracted text is joined and passed to Nemotron with a scan-specific prompt
4. A thumbnail preview with a checkmark replaces the camera icon

### Text Mode
1. "or type" expands a minimal inline textarea
2. User types their brain dump and hits "make my routine"

### Schedule Generation (all modes)
Nemotron returns structured JSON — no markdown, no fluff:

```json
{
  "summary": { "tasks": 6, "focus_hours": 3, "free_blocks": 2 },
  "blocks": [
    {
      "time": "9:00 AM",
      "duration": "30 min",
      "title": "Deep work: writing",
      "note": "No notifications",
      "tag": "focus"
    }
  ]
}
```

Blocks are rendered as animated cards with staggered slide-up entry.

---

## System Prompts

**Brain dump:**
> "You are a calm, no-nonsense personal scheduler. Return ONLY raw JSON. 6–10 blocks, always include a break and a meal."

**Scan mode:**
> "You are a routine expert. Build a practical ordered routine from the scanned label text — skincare, supplements, meal prep, workout, cleaning, anything. Flag conflicts in notes."

---

## Roadmap

- [ ] Audio as the default input (text as fallback)
- [ ] End-of-day reflection tab
- [ ] Auto-prioritization engine
- [ ] Calendar integration with reminders
- [ ] Stress score / productivity rating (optional, user-controlled)
- [ ] Gender-neutral scan use cases beyond skincare

---

## Hackathon

Built at **Agents for Impact**, hosted by NVIDIA · March 16, 2026

**Prize track requirements met:** NVIDIA Nemotron as the core AI engine ✅

---

## License

MIT
