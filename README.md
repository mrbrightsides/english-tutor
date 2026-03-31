# Ngenglish 🎙️📚

**Ngenglish** is an interactive, voice-powered English learning assistant built with React and the **Google Gemini 3.1 Flash Live API**. It provides a natural, low-latency speaking environment where you can practice English with a friendly AI tutor that speaks your language (Indonesian/English mix).

---

## 🌟 Key Features

### 1. Real-time Voice Interaction
Engage in natural conversations with 'Ngenglish'. Powered by Gemini's Live API, the interaction is fluid, low-latency, and supports interruptions just like a real person.

### 2. Multimodal Learning Dashboard
The tutor doesn't just talk; it *shows*. Ngenglish can dynamically update a visual dashboard to provide:
- **Vocabulary Cards**: Definitions, examples, and pronunciation tips.
- **Grammar Summaries**: Clear explanations of rules discussed in the session.
- **Interactive Quizzes**: Multiple-choice and fill-in-the-blank exercises with instant feedback.
- **Visual Aids**: High-quality images for description exercises and storytelling.

### 3. Personalized Learning Goals
Tailor your experience by selecting a specific focus:
- **General English**: Everyday conversation and fluency.
- **Business English**: Professional communication and terminology.
- **TOEFL/IELTS Preparation**: Targeted practice for standardized tests.
- **Travel English**: Essential phrases and scenarios for travelers.
- **Academic Writing**: Formal structure and advanced vocabulary.

### 4. Structured Speaking Exercises
- **Role-Play**: Practice real-world scenarios (e.g., at a restaurant, job interview).
- **Image Description**: Describe dynamic images to build descriptive vocabulary.
- **Text Summary**: Read short articles and summarize them to practice comprehension.

### 5. Session History & Progress Tracking
- **Auto-Save**: Every session is automatically saved to your browser's local storage.
- **Transcripts**: Review full transcripts of past conversations.
- **Learned Items**: Track vocabulary and grammar points you've mastered over time.

### 6. Customizable Experience
- **Playback Speed**: Adjust the tutor's speaking rate from 0.8x to 1.5x.
- **Dark/Light Mode**: Choose the interface that best suits your environment.
- **Real-time Transcript**: See what's being said as it happens.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Engine**: [Google Gemini 3.1 Flash Live API](https://ai.google.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Persistence**: Browser LocalStorage

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository** (or download the source).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** at `http://localhost:3000`.

---

## 📖 How to Use

1. **Select a Goal**: Choose your learning focus from the top-right dropdown.
2. **Connect**: Click the microphone button to start the session.
3. **Speak**: Start talking! You can ask questions, request a quiz, or just have a casual chat.
4. **Interact**: Watch the dashboard on the right for visual aids and interactive exercises.
5. **Review**: After disconnecting, check the **History** tab to see your progress and review past transcripts.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the tutor's capabilities or the user interface.

---

## 📄 License

This project is licensed under the MIT License.

---

*Made with ❤︎ by mrbrightsides*
