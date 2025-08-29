<div align="center">
  <!-- TODO: Create a simple, clean logo for your project and add the link here -->
  <!-- <img src="https://your-logo-link-here.com/logo.svg" alt="Interview Prep AI Logo" width="150"> -->
  <h1 align="center">Interview Prep AI 🚀</h1>
  <p align="center">
    From Zero to One: The Story of a Personal AI Interview Coach
  </p>
  <p align="center">
    <a href="https://interview-prep-ai-kappa.vercel.app/"><strong>✨ View the Live Application ✨</strong></a>
  </p>
</div>

<br>

> **Note from the Developer:** This project was more than a technical exercise; it was a journey. It started with a simple idea—to build a better way to prepare for tech interviews—and evolved into a comprehensive platform. Every feature, every challenge, and every line of code represents a real story of problem-solving and growth.

---

### 🎬 The Final Product in Action

*(This is the perfect place for a high-quality GIF that walks through the user journey: creating a deck, a review session, and a practice session.)*

![Interview Prep AI Showcase GIF](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGc5c2R0dGZ5a2ZqZTV3cjV2c2w5eW5ocnZtZzB6Z2w0bHk2aW5oZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/your-gif-id/giphy.gif)

---

## ✨ What It Does: A Smarter Way to Prepare

Interview Prep AI is an intelligent learning platform that transforms how tech professionals prepare for interviews. It moves beyond static flashcards to create a dynamic, feedback-driven ecosystem that helps you not only **know** the material but also **master** communicating it.

- **🤖 Build Custom Decks in Seconds:** Create hyper-relevant interview decks for any role, or let the AI build one for you by simply pasting a link to a real job description.
- **🧠 Learn with Spaced Repetition:** A smart SRS algorithm schedules your reviews at the optimal time to ensure knowledge moves into your long-term memory.
- **🎙️ Practice Aloud, Get Real Feedback:** Use your voice to practice your answers and receive instant, AI-powered critiques on your content, clarity, and delivery.
- **📊 Track Your Growth:** A personalized dashboard visualizes your progress, showing you exactly where you're strong and where you need to focus.

---

## 🛠️ The Technology Behind the Build

This project is a full-stack MERN application, architected for a modern, scalable, and real-time user experience.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E77D8?style=for-the-badge&logo=google-gemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

---

## 🧠 The Story Behind the Build: Challenges & Learnings

A project's true value is in the problems solved along the way. This application's most advanced features are the direct result of tackling and overcoming significant engineering hurdles.

### 1. The AI Reliability Challenge
- **The Ambition:** To provide consistently accurate, structured feedback from the AI.
- **The Roadblock:** The LLM would occasionally "bleed" conversational text around its JSON output, breaking the frontend. After multiple failed attempts to perfect the prompt, the application's core feature was at risk.
- **The Breakthrough:** Instead of trying to force the AI to be perfect, I built a resilient system around its imperfections. I engineered a robust parsing layer on the backend that intelligently finds and extracts the valid JSON from the raw text.
- **The Takeaway:** This was a profound lesson in defensive programming. **A senior engineer's job isn't just to make things work; it's to build systems that don't break when faced with the unexpected.**

### 2. The SRS Algorithm Challenge
- **The Ambition:** To move beyond a simple flashcard app and implement a true Spaced Repetition System.
- **The Roadblock:** Translating the theoretical SM-2 algorithm into performant, stateful backend logic was far more complex than anticipated. My initial attempts were buggy and didn't correctly schedule the review intervals.
- **The Breakthrough:** I took a step back and dedicated time to studying open-source SRS implementations. This research allowed me to refactor my logic, resulting in a stable and effective scheduling engine.
- **The Takeaway:** This taught me the value of deep research before implementation. **Sometimes, the fastest way to solve a problem is to slow down and learn from the work of others.**

This project is a testament to the engineering process: ambition, struggle, learning, and ultimately, resilience.

---

## ⚙️ Getting Started

To run this project locally, follow these steps:

### Prerequisites
- Node.js (v18 or later)
- MongoDB instance (local or cloud-based)
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone 
cd interview-prep

Install Dependencies
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

Configure Environment Variables
In the backend directory, create a .env file.
Add your MONGO_URI and GEMINI_API_KEY.

 Run the Application
# Run the backend server (from the backend folder)
npm run dev

# Run the frontend development server (from the frontend folder)
npm start

Roadmap(Future Advancements)

 AI-driven behavioral interview scoring
 Role-based question banks (SDE, Analyst, Designer)
 Video interview simulation
 Resume analysis and feedback
 Leaderboards and community features

Contributing

Contributions are welcome!
Fork this repo
Create your feature branch: git checkout -b feature/amazing-feature
Commit changes: git commit -m 'Add amazing feature'
Push to branch: git push origin feature/amazing-feature
Open a PR 🚀

Author: Shashank Chakraborty
Live Project: https://interview-prep-ai-kappa.vercel.app/
Email: shashankchakraborty712005@gmail.com
