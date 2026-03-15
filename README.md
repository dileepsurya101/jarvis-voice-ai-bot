# 🤖 Jarvis Voice AI Bot

> A production-ready, browser-based personal AI assistant inspired by Jarvis from Iron Man. Built with voice input/output, natural language understanding, and real task execution — completely free, open-source, and deployable in minutes.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-43853D?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 What is This?

**Jarvis Voice AI Bot** is a fully functional, Jarvis-like voice assistant that runs in your browser. Talk to it, and it responds with a confident, helpful personality while executing real tasks:

- 🎤 **Voice Input**: Uses Web Speech API for natural speech recognition
- 🔊 **Voice Output**: Responds with speech synthesis
- 🧠 **LLM-Powered**: Groq-hosted Llama 3 for natural language understanding
- ⚡ **Real Actions**: Time/date, weather, notes, reminders, search, link opening
- 💾 **Persistent Data**: MongoDB Atlas free tier for notes and reminders
- 🚀 **Zero Cost**: Built entirely on free tiers and open-source tools
- 📱 **Progressive Web App**: Installable on desktop and mobile

---

## ✨ Features

### Phase 1 (MVP) ✅
- ✅ Voice input and output via Web Speech API
- ✅ Natural language understanding with Groq LLM
- ✅ Basic commands:
  - Current time and date
  - Weather by city (OpenWeatherMap API)
  - Save and retrieve notes
  - Chat-style UI with conversation history
  - Status indicators (Listening / Thinking / Speaking)

### Phase 2 (Enhanced) 🚧
- ⏰ Reminders with scheduling
- 🔍 Web search integration
- 🔗 Open links (GitHub, Google, etc.)
- ⚙️ Settings panel (personality toggle, voice on/off)
- 📱 PWA support with offline capability

### Phase 3 (Production-Ready) 📋
- 🧪 Unit tests for core logic
- 📚 Comprehensive documentation
- 🔄 CI/CD with GitHub Actions
- 🎨 ESLint + Prettier for code quality

---

## 🏗️ Tech Stack

| Component | Technology | Why? |
|-----------|------------|------|
| **Frontend** | React 18 + Vite + TypeScript | Fast dev, type safety, modern tooling |
| **UI State** | React Context + Hooks | Simple, no extra dependencies |
| **Voice I/O** | Web Speech API | Built into browsers, zero cost |
| **Backend** | Node.js + Express (TypeScript) | Industry standard, easy to deploy |
| **Database** | MongoDB Atlas M0 (512MB free) | Document DB perfect for notes/reminders |
| **LLM** | Groq API (Llama 3 free tier) | Fast inference, generous free limits |
| **Weather** | OpenWeatherMap free tier | 1000 calls/day, more than enough |
| **Hosting** | Vercel Hobby (free) | Serverless API + static hosting |
| **CI/CD** | GitHub Actions | Free for public repos |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm/pnpm
- MongoDB Atlas account (free)
- Groq API key (free)
- OpenWeatherMap API key (free)

### 1. Clone and Install

```bash
git clone https://github.com/dileepsurya101/jarvis-voice-ai-bot.git
cd jarvis-voice-ai-bot
npm install
```

### 2. Set Up Environment Variables

Create `.env` in the project root:

```env
# MongoDB Atlas (create free cluster at https://www.mongodb.com/cloud/atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jarvis?retryWrites=true&w=majority

# Groq API (get free key at https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here

# OpenWeatherMap (get free key at https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Optional: Default city for weather
DEFAULT_CITY=Mumbai
```

### 3. Run Locally

```bash
npm run dev
```

This starts:
- **Client** on `http://localhost:5173`
- **Server** on `http://localhost:3000`

Open your browser and start talking to Jarvis!

---

## 🌐 Deploy to Production

### Deploy on Vercel (Recommended)

1. **Push to GitHub** (if you haven't already)

2. **Import on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import your GitHub repo
   - Vercel auto-detects the config from `vercel.json`

3. **Add Environment Variables** in Vercel dashboard:
   - `MONGODB_URI`
   - `GROQ_API_KEY`
   - `OPENWEATHER_API_KEY`
   - `DEFAULT_CITY`

4. **Deploy**! Vercel builds and deploys automatically.

Your Jarvis is now live at `https://your-project.vercel.app` 🎉

---

## 📖 Usage Examples

Once running, click the **"Listen"** button and try:

- "Jarvis, what time is it?"
- "Jarvis, what's the weather in London?"
- "Jarvis, create a note: Buy groceries tomorrow"
- "Jarvis, show me my notes"
- "Jarvis, remind me to call John at 3 PM"
- "Jarvis, search for best TypeScript practices"
- "Jarvis, open GitHub"

Jarvis responds with:
- Short, confident replies ("Yes sir, it's 3:47 PM.")
- Real actions (saves notes to DB, fetches weather, etc.)
- Voice output (browser speaks the reply)

---

## 🗂️ Project Structure

```
jarvis-voice-ai-bot/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks (voice, API)
│   │   ├── api/           # API client
│   │   └── App.tsx
│   └── package.json
├── server/                 # Node + Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── db/            # MongoDB models
│   │   └── index.ts
│   └── package.json
├── docs/                   # Documentation
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── PROMPTS.md
├── tests/                  # Unit tests
├── .github/workflows/      # CI/CD
├── vercel.json             # Vercel config
├── .env.example            # Environment template
└── README.md
```

---

## 🧠 How It Works

### Architecture Overview

```
User speaks → Web Speech API → Text
                                 ↓
                          Intent Router
                                 ↓
                    ┌────────────┴────────────┐
                    ↓                         ↓
              Built-in Tools            Groq LLM
              (time, weather,           (reasoning,
               notes, etc.)             conversation)
                    ↓                         ↓
                    └────────────┬────────────┘
                                 ↓
                            Text Reply
                                 ↓
                         Speech Synthesis
                                 ↓
                          User hears reply
```

### Request Flow

1. **User activates mic** → Browser starts listening
2. **Speech → Text** → Web Speech API transcribes
3. **Text sent to `/api/voice/process`**
4. **Intent Router** checks for built-in commands:
   - "what time" → timeService
   - "weather in X" → weatherService
   - "create note" → notesService
   - Otherwise → send to Groq LLM
5. **Response built** → JSON with `reply` + `actions`
6. **Client receives** → Displays text + plays voice

---

## 🛠️ Development

### Install Dependencies

```bash
npm install          # Install root + all workspaces
```

### Run in Dev Mode

```bash
npm run dev          # Runs client + server concurrently
```

### Build for Production

```bash
npm run build        # Builds client + server
```

### Run Tests

```bash
npm test             # Run all tests
```

### Lint & Format

```bash
npm run lint         # ESLint check
npm run format       # Prettier format
```

---

## 📚 Documentation

- **[SPEC.md](./docs/SPEC.md)**: Full project specification
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)**: System design and data flow
- **[API.md](./docs/API.md)**: API endpoints and contracts
- **[PROMPTS.md](./docs/PROMPTS.md)**: LLM system prompt design
- **[ROADMAP.md](./docs/ROADMAP.md)**: Future enhancements

---

## 🗺️ Roadmap

### Short-term
- [ ] Add more built-in commands (calculator, unit converter)
- [ ] Improve error handling and user feedback
- [ ] Add dark/light theme toggle
- [ ] Multi-language support

### Long-term
- [ ] Email integration (read/send emails)
- [ ] Calendar integration (Google Calendar API)
- [ ] Desktop app with Electron
- [ ] OS-level control (open apps, control system)
- [ ] Multi-user support with authentication
- [ ] Voice customization (different voices/accents)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

Feel free to use, modify, and distribute this project as you wish.

---

## 🙏 Acknowledgments

- Inspired by Jarvis from the Iron Man movies
- Built with ❤️ using free and open-source tools
- Thanks to:
  - [Groq](https://groq.com) for fast LLM inference
  - [Vercel](https://vercel.com) for free hosting
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for free database
  - [OpenWeatherMap](https://openweathermap.org) for weather data

---

## 📧 Contact

**Built by**: [Dileep Surya](https://github.com/dileepsurya101)  
**Company**: [Yukthimantra Services](https://yukthimantra.com)  
**Email**: contact@yukthimantra.com

If you find this project useful, please ⭐ star it on GitHub!

---

## 🎬 Demo

*Coming soon: Video demo and screenshots*

---

**Made with ❤️ in Mumbai, India** 🇮🇳
