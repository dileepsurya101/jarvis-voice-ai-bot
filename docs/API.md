# Jarvis Voice AI Bot - API Documentation

All API endpoints are available under the `/api` prefix.

---

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-project.vercel.app/api`

---

## Endpoints

### 1. Process Voice/Text Input

**POST** `/api/voice/process`

The main endpoint. Accepts a text transcript (from speech-to-text), routes it through the intent engine, and returns a Jarvis reply.

#### Request

```json
{
  "transcript": "What is the weather in Mumbai today?",
  "sessionId": "session_abc123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transcript` | string | Yes | The user's speech converted to text |
| `sessionId` | string | Yes | Unique session identifier (UUID) |

#### Response (200 OK)

```json
{
  "reply": "Currently 32 degrees Celsius in Mumbai, Sir. Partly cloudy with high humidity.",
  "intent": "WEATHER",
  "actions": [
    {
      "type": "WEATHER_RESULT",
      "data": {
        "city": "Mumbai",
        "temperature": 32,
        "description": "Partly cloudy",
        "humidity": 78
      }
    }
  ],
  "meta": {
    "sessionId": "session_abc123",
    "processingTime": 450,
    "source": "weatherService"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `reply` | string | The Jarvis reply text (for display and TTS) |
| `intent` | string | Detected intent type |
| `actions` | Action[] | List of actions taken (for UI updates) |
| `meta.sessionId` | string | Echo of the request sessionId |
| `meta.processingTime` | number | Time in milliseconds |
| `meta.source` | string | Which service handled the request |

#### Error Response (400/500)

```json
{
  "error": "transcript is required",
  "code": "VALIDATION_ERROR"
}
```

---

### 2. Notes Management

#### Create Note

**POST** `/api/notes`

```json
// Request
{
  "content": "Call client about proposal",
  "sessionId": "session_abc123"
}

// Response
{
  "id": "note_xyz789",
  "content": "Call client about proposal",
  "createdAt": "2026-03-15T10:30:00Z"
}
```

#### List Notes

**GET** `/api/notes?sessionId=session_abc123`

```json
// Response
{
  "notes": [
    {
      "id": "note_xyz789",
      "content": "Call client about proposal",
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

#### Delete Note

**DELETE** `/api/notes/:id`

```json
// Response
{
  "success": true,
  "message": "Note deleted"
}
```

---

### 3. Reminders Management

#### Create Reminder

**POST** `/api/reminders`

```json
// Request
{
  "content": "Call John at 5 PM",
  "reminderTime": "2026-03-15T17:00:00Z",
  "sessionId": "session_abc123"
}

// Response
{
  "id": "rem_abc123",
  "content": "Call John at 5 PM",
  "reminderTime": "2026-03-15T17:00:00Z",
  "isComplete": false,
  "createdAt": "2026-03-15T10:30:00Z"
}
```

#### List Reminders

**GET** `/api/reminders?sessionId=session_abc123`

```json
// Response
{
  "reminders": [
    {
      "id": "rem_abc123",
      "content": "Call John at 5 PM",
      "reminderTime": "2026-03-15T17:00:00Z",
      "isComplete": false
    }
  ],
  "count": 1
}
```

---

### 4. Health Check

**GET** `/api/health`

```json
// Response
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-03-15T10:30:00Z",
  "services": {
    "database": "connected",
    "llm": "available"
  }
}
```

---

## Intent Types

| Intent | Description |
|--------|-------------|
| `TIME` | Current time query |
| `DATE` | Current date query |
| `WEATHER` | Weather information query |
| `NOTE_CREATE` | Create a new note |
| `NOTE_LIST` | List all notes |
| `NOTE_DELETE` | Delete a note |
| `REMINDER_CREATE` | Create a reminder |
| `REMINDER_LIST` | List reminders |
| `LINK_OPEN` | Open a URL/website |
| `SEARCH` | Web search |
| `LLM` | General LLM conversation |

---

## Action Types

The `actions` array in responses can contain:

```typescript
type Action =
  | { type: 'WEATHER_RESULT'; data: WeatherData }
  | { type: 'NOTE_SAVED'; data: { id: string; content: string } }
  | { type: 'NOTE_LIST'; data: { notes: Note[] } }
  | { type: 'REMINDER_SAVED'; data: Reminder }
  | { type: 'OPEN_URL'; data: { url: string; label: string } }
  | { type: 'SEARCH_RESULTS'; data: { query: string; url: string } }

```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Missing/invalid request fields |
| `LLM_ERROR` | 500 | Groq API failure |
| `WEATHER_ERROR` | 503 | OpenWeatherMap API failure |
| `DB_ERROR` | 500 | MongoDB connection/query failure |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT` | 429 | Too many requests |

---

## TypeScript Interfaces

```typescript
// shared/types/api.ts

export interface VoiceProcessRequest {
  transcript: string;
  sessionId: string;
}

export interface VoiceProcessResponse {
  reply: string;
  intent: IntentType;
  actions: Action[];
  meta: {
    sessionId: string;
    processingTime: number;
    source: string;
  };
}

export interface Note {
  id: string;
  content: string;
  sessionId: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  content: string;
  reminderTime: string;
  isComplete: boolean;
  sessionId: string;
  createdAt: string;
}

export type IntentType =
  | 'TIME' | 'DATE' | 'WEATHER'
  | 'NOTE_CREATE' | 'NOTE_LIST' | 'NOTE_DELETE'
  | 'REMINDER_CREATE' | 'REMINDER_LIST'
  | 'LINK_OPEN' | 'SEARCH' | 'LLM';
```
