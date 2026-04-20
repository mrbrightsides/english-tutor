# Ngenglish 🎙️⚡

**Ngenglish** is a next-generation AI English Tutor built for the **TechnoFest 2026 Hackathon**. Powered by **Google Gemini 3.1 Flash Live API**, it offers a futuristic, low-latency, and highly proactive voice-learning experience.

Unlike traditional apps, Ngenglish tracks your mastery from scratch, analyzing your fluency, vocabulary, and grammar in real-time as you speak.

---

## 🌟 Why Ngenglish is Different

### 1. Zero-to-Hero Mastery Tracking 📈
All your stats start from **zero**. Watch your XP, Level, and "Words Mastered" grow dynamically based on your actual speech. Your progress is saved locally, so every "Level Up" feels real.
- **Leveling System**: Gain 500 XP to advance your Proficiency Level.
- **Words Mastered**: Real-time analysis of new vocabulary used.
- **Streak Tuning**: Consistent daily practice is rewarded.

### 2. Hyper-Proactive AI Agent 🤖
Ngenglish doesn't just wait for you to talk. It’s alive:
- **Silence Detection**: If you're stuck for more than 5 seconds, the agent will chime in with a guidance or a new topic.
- **Interruptible Flow**: Talk over the agent anytime—it listens and stops immediately for a natural "human" flow.
- **Proactive Greeting**: On connection, it immediately initializes your dashboard and welcomes you.

### 3. Active Mission Grid 🎮
Choose from dynamic challenges that push your limits:
- **Speaking Marathon**: Maintain a fluent 5-minute conversation.
- **Idiom Hunt**: Incorporate specific business idioms into your talk.
- **Creative Storytelling**: Use past tense to weave a story and earn massive XP.

### 4. Hardware-Inspired "Techno" UI 🌌
A polished, hardware-aesthetic interface designed for focus:
- **Integrated Sidebar**: Controls, stats (Mastery HUD), and memory history all in one place.
- **Dashboard Iframe**: A clean, dedicated space where the AI "projects" learning materials, quizzes, and live feedback.
- **Dark/Light Mode**: Unified styling for maximum comfort during late-night study sessions.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **AI Core**: [Google Gemini 3.1 Flash Live API](https://ai.google.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Sync**: Browser LocalStorage + `window.postMessage` Interop
- **Animations**: [Motion 12](https://motion.dev/)

---

## 🚀 Getting Started (Hackathon Mode)

### Prerequisites
- Node.js (v20+)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Setup**:
   ```bash
   npm install
   ```
2. **Key Config**:
   Add `GEMINI_API_KEY` to your environment.
3. **Run**:
   ```bash
   npm run dev
   ```

---

## 📖 Pro-Tips for Demo

1. **Start fresh**: Click the **Reset** button in the top right to clear all stats to 0.
2. **Kickoff**: Use an **Active Challenge** to start the session with a specific goal.
3. **Be Silent**: During the demo, stop talking for 5 seconds to show off the AI's proactive re-engagement.
4. **Speak Over**: Demonstrate the interruption capability by asking a question while the AI is explaining something.

---

*Made for TechnoFest 2026 Hackathon* 🚀🏆
