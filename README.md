# Begging-Rights

Begging Rights - Because passwords are outdated. Convince the lock you're worthy, survive its judgment, and experience premium Humiliation-as-a-Service (HaaS). 

A tiny hackathon project for making cool, stupid, unnecessary things.

This project wires together a web frontend, a Node.js backend, and an ESP32-based door latch so a sassy AI judge can decide whether to physically unlock a gate.

Why it exists
- Built fast for a hackathon: the goal was to make something playful and unnecessary- combining software and hardware together.
- Objective: explore audio, speech-to-text, LLM-driven responses, and simple IoT actuation (ESP32 controlling a door latch).

High-level architecture
- `frontend/` — Vite + React UI with components to record pleas, show judge responses, and request TTS audio.
- `backend/` — Express API that evaluates pleas (via Gemini/Groq or a local mock), manages lock state, and generates TTS audio.
- `ESP/door_latch/door_latch.ino` — Arduino sketch for the ESP32 that polls the backend and actuates the latch.

Quick run (backend)
1. Copy `.env.example` to `.env` and set required keys (see Environment variables).
2. From `backend/`:

```powershell
npm install
npm start
```

Quick run (frontend)
1. From `frontend/`:

```powershell
npm install
npm run dev
```

Environment variables
- `ELEVENLABS_API_KEY` — (optional) For TTS audio generation.
- `GEMINI_API_KEY` — (optional) Google Gemini for AI judgments.
- `GROQ_API_KEY` — (optional) Groq/OpenAI-compatible provider.
- `USE_MOCK_AI` — set to `true` to force the deterministic local judge (useful during development / hackathon demos).

Hardware
- This was tested with an ESP32 controlling a small servo latch. The ESP polls the backend and will actuate when the backend signals `shouldOpen`.
- See `ESP/door_latch/door_latch.ino` for wiring and logic. Use proper level shifting and power for your actuator.

Notes
- Hackathon quality: quick and playful, not production-hardened. Be careful with exposing the physical latch to the public - make sure to treat it as a demo.
- Security: no authentication on admin endpoints; do not deploy to an untrusted network without adding auth and safety checks.

Enjoy the nonsense.

