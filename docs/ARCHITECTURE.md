# Jarvis Voice AI Bot - Architecture

This document describes the system architecture, component design, and data flow for the Jarvis Voice AI Bot.

---

## System Overview

```
+-----------------------------------------------------+
|                 BROWSER (Client)                    |
|                                                     |
|  +---------------+     +------------------------+  |
|  |  React UI     |<--->|  useVoice Hook         |  |
|  |  (ChatWindow, |     |  (Web Speech API:      |  |
|  |  VoiceCtrl,   |     |   SpeechRecognition +  |  |
|  |  StatusBadge) |     |   SpeechSynthesis)     |  |
|  +------+--------+     +----------+-------------+  |
|         |                         |                 |
|         +----------+--------------+                 |
|                    |                                |
|  +-------------------------------+                  |
|  |  useJarvisClient Hook         |                  |
|  |  (fetch /api/voice/process)   |                  |
|  +------------+------------------+                  |
+---------------|-------------------------------------+
                | HTTPS
+---------------|-------------------------------------+
|               |   SERVER (Node.js + Express)        |
|  +------------v--------------------+               |
|  |  Express Router                 |               |
|  |  POST /api/voice/process        |               |
|  |  GET/POST /api/notes            |               |
|  |  GET/POST /api/reminders        |               |
|  |  GET /api/health                |               |
|  +------------+--------------------+               |
|               |                                     |
|  +------------v--------------------+               |
|  |  Intent Router Service          |               |
|  |  - Pattern matching             |               |
|  |  - Intent classification        |               |
|  |  - Parameter extraction         |               |
|  +---+---+---+---+---+------------+               |
|      |   |   |   |   |                             |
|  +---v+  |  +v-+ | +-v--+  +------+               |
|  |Time|  |  |Wth| | |LLM|  |Notes |               |
|  |Svc |  |  |Svc| | |Svc|  |Svc   |               |
|  +----+  |  +---+ | +---+  +--+---+               |
|          |        |           |                     |
|          v        v           v                     |
|       OpenWeather  Groq API  MongoDB Atlas          |
+-----------------------------------------------------+
```

---

## Component Descriptions

### Frontend (client/)

#### Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `App` | `src/App.tsx` | Root component, global state, layout |
| `ChatWindow` | `src/components/ChatWindow.tsx` | Renders conversation message history |
| `MessageBubble` | `src/components/MessageBubble.tsx` | Individual user/Jarvis message |
| `VoiceControls` | `src/components/VoiceControls.tsx` | Listen/Stop button, mic level |
| `StatusIndicator` | `src/components/StatusIndicator.tsx` | Listening/Thinking/Speaking badge |
| `SettingsPanel` | `src/components/SettingsPanel.tsx` | Personality and voice toggles |

#### Custom Hooks

| Hook | File | Responsibility |
|------|------|----------------|
| `useVoice` | `src/hooks/useVoice.ts` | Web Speech API (recognition + synthesis) |
| `useJarvisClient` | `src/hooks/useJarvisClient.ts` | API calls, session management, loading state |
| `useSettings` | `src/hooks/useSettings.ts` | User preferences (localStorage) |

### Backend (server/)

#### Routes

| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/voice.ts` | `POST /api/voice/process` | Main voice processing |
| `routes/notes.ts` | `GET,POST,DELETE /api/notes` | Notes CRUD |
| `routes/reminders.ts` | `GET,POST,PATCH /api/reminders` | Reminders CRUD |
| `routes/health.ts` | `GET /api/health` | Health check |

#### Services

| Service | File | Responsibility |
|---------|------|----------------|
| `intentRouter` | `services/intentRouter.ts` | Route transcript to correct handler |
| `llmClient` | `services/llmClient.ts` | Groq API adapter |
| `weatherService` | `services/weatherService.ts` | OpenWeatherMap API calls |
| `timeService` | `services/timeService.ts` | Time/date response generation |
| `notesService` | `services/notesService.ts` | Notes business logic |
| `remindersService` | `services/remindersService.ts` | Reminders business logic |

#### Database Models

| Model | File | Schema |
|-------|------|--------|
| `Note` | `db/models/Note.ts` | `{ content, sessionId, createdAt }` |
| `Reminder` | `db/models/Reminder.ts` | `{ content, reminderTime, isComplete, sessionId }` |
| `UserSettings` | `db/models/UserSettings.ts` | `{ sessionId, personality, voiceEnabled }` |

---

## Request Sequence Diagram

```
 Browser                 Server                External
   |                       |                      |
   |  User clicks Listen   |                      |
   |                       |                      |
   |  Web Speech API starts|                      |
   |  [microphone active]  |                      |
   |                       |                      |
   |  User speaks: "What   |                      |
   |  time is it?"         |                      |
   |                       |                      |
   |  onResult() fires     |                      |
   |  transcript ready     |                      |
   |                       |                      |
   |  POST /api/voice/     |                      |
   |  process              |                      |
   |  { transcript,        |                      |
   |    sessionId }------->|                      |
   |                       |                      |
   |                 Intent Router                |
   |                 matches "what time"          |
   |                 → timeService.getTime()      |
   |                       |                      |
   |                 returns "It is 3:47 PM"      |
   |                       |                      |
   |<--------- 200 OK ------|                      |
   |  { reply: "It is      |                      |
   |    3:47 PM, Sir." }   |                      |
   |                       |                      |
   |  Display message in   |                      |
   |  chat window          |                      |
   |                       |                      |
   |  Speech Synthesis     |                      |
   |  speaks the reply     |                      |
   |                       |                      |
```

### Weather Query Sequence

```
 Browser             Server           OpenWeatherMap
   |                    |                    |
   | POST /process      |                    |
   | "weather Mumbai"-->|                    |
   |                    |                    |
   |              Intent Router              |
   |              matches WEATHER            |
   |              extracts city="Mumbai"     |
   |                    |                    |
   |                    |  GET /weather?     |
   |                    |  q=Mumbai&        |
   |                    |  appid=KEY-------> |
   |                    |                    |
   |                    |<---- weather JSON -|
   |                    |                    |
   |<-- 200 { reply,    |                    |
   |    actions }-------|                    |
```

---

## Data Flow

### Speech Input Pipeline

```
Microphone
    ↓
Web Speech API (SpeechRecognition)
    ↓
Transcript (string)
    ↓
useJarvisClient.sendMessage(transcript)
    ↓
fetch POST /api/voice/process
    ↓
[Server: Intent Router]
    ↓
[Service: time/weather/notes/llm]
    ↓
JSON response { reply, actions }
    ↓
Update chat history state
    ↓
Web Speech API (SpeechSynthesis)
    ↓
Browser speaks the reply
```

---

## State Management

```typescript
// Global App State (React Context)
interface AppState {
  // Chat
  messages: Message[];
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  
  // Session
  sessionId: string;  // UUID, persisted in sessionStorage
  
  // Settings
  settings: {
    personality: 'formal' | 'casual';
    voiceEnabled: boolean;
    language: string;
  };
}
```

---

## Security Considerations

1. **Environment Variables**: All API keys in `.env`, never in code
2. **Input Sanitization**: All user input sanitized before DB writes
3. **Rate Limiting**: Express rate-limiter on API routes (100 req/15min)
4. **CORS**: Strict origin whitelist (only Vercel production + localhost dev)
5. **No Auth (MVP)**: Sessions are anonymous by session ID. Authentication can be added in v2.
6. **LLM Safety**: System prompt instructs Jarvis to never reveal keys or internal configs

---

## Deployment Architecture (Vercel)

```
GitHub repo
    ↓ (git push)
Vercel CI builds:
  - client/ → static HTML/JS/CSS (CDN)
  - server/src/index.ts → Serverless Function
    ↓
vercel.json routes:
  /api/* → serverless function
  /* → static client build
    ↓
Environment variables from Vercel dashboard:
  MONGODB_URI, GROQ_API_KEY, OPENWEATHER_API_KEY
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Voice-to-text latency | < 1s (Web Speech API, browser native) |
| API response time (time/date) | < 50ms |
| API response time (weather) | < 500ms |
| API response time (LLM) | < 3s |
| First contentful paint | < 2s |
| Client bundle size | < 500KB gzipped |
