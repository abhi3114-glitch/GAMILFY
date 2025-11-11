# 🎮 LevelUp - Gamify Your Life with AI

Transform your daily habits into an epic RPG adventure with AI-powered coaching! Complete quests, earn XP, level up skills, and achieve your goals with personalized guidance from Llama 3.1.

![LevelUp Banner](https://img.shields.io/badge/AI-Llama%203.1-blue) ![React](https://img.shields.io/badge/React-19.1-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

### 🤖 AI-Powered Features (NEW!)
- **AI Quest Generator**: Get personalized quest suggestions based on your skills and goals
- **AI Coach**: Receive motivational messages and daily check-ins
- **Smart Assistant**: Chat with AI for quest management and productivity advice
- **Progress Insights**: AI-powered analysis of your weekly progress

### 🎯 Core Features
- **Quest Management**: Create, edit, and complete quests with XP rewards
- **5 Skill System**: Strength, Intelligence, Discipline, Social, Finance
- **Streak Tracking**: Maintain daily streaks with bonus XP multipliers
- **Badge System**: Unlock achievements as you progress
- **Leaderboard**: Compete with others (demo mode)
- **Responsive Design**: Beautiful UI on mobile and desktop

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Groq API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abhi3114-glitch/GAMILFY.git
cd GAMILFY
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure AI (Required for AI features)**

Get your free API key from [Groq Console](https://console.groq.com/keys)

Edit `.env` file:
```env
VITE_GROQ_API_KEY=your_actual_groq_api_key_here
```

4. **Run the development server**
```bash
pnpm run dev
```

5. **Build for production**
```bash
pnpm run build
```

## 🎯 How to Use

### Getting Started
1. **Create Your Profile**: Enter your name when you first open the app
2. **Create Your First Quest**: Click "New Quest" to add a task
3. **Complete Quests**: Click the circle icon to mark quests as complete
4. **Earn XP & Level Up**: Watch your skills and level grow!

### AI Features

#### 🤖 AI Quest Generator
1. Click "New Quest" button
2. Click "Get AI Quest Suggestions" 
3. AI will generate 3 personalized quest suggestions
4. Click any suggestion to auto-fill the form
5. Customize and create!

#### 💬 AI Chat Assistant
1. Click the sparkle button (bottom-right corner)
2. Ask questions about:
   - Creating effective quests
   - Staying motivated
   - Setting goals
   - General productivity advice

#### 📊 AI Motivational Messages
- Automatically displayed on your dashboard
- Personalized based on your streak, level, and progress
- Updates daily to keep you motivated

### Quest System

**Quest Sizes & XP:**
- **S (Small)**: 10 XP - Quick 15-minute tasks
- **M (Medium)**: 25 XP - 30-minute activities
- **L (Large)**: 50 XP - 1-hour commitments
- **XL (Extra Large)**: 100 XP - 2+ hour projects

**Skills:**
- 💪 **Strength**: Physical fitness, sports, workouts
- 🧠 **Intelligence**: Learning, reading, studying
- 🎯 **Discipline**: Habits, routines, self-control
- 👥 **Social**: Relationships, networking, communication
- 💰 **Finance**: Money management, investments, career

### Streak System
- Complete quests daily to maintain your streak
- Earn +2% bonus XP per day (max +30%)
- 4-hour grace period after 24 hours

### Badges
Unlock achievements by:
- Completing your first quest
- Reaching level milestones (5, 10)
- Maintaining 7-day streaks
- Maxing out skills to level 10
- Completing 100+ quests

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI**: Groq API (Llama 3.1-8b-instant)
- **Storage**: localStorage (client-side)
- **Routing**: React Router v6
- **Build**: Vite
- **Animations**: Framer Motion

## 📁 Project Structure

```
GAMILFY/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── GameUI.tsx       # Game-specific UI components
│   │   └── AIAssistant.tsx  # AI chat interface
│   ├── lib/
│   │   ├── storage.ts       # Data persistence layer
│   │   ├── gameEngine.ts    # Game logic & XP calculations
│   │   ├── aiService.ts     # AI integration (Groq/Llama)
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Quests.tsx       # Quest management
│   │   ├── Profile.tsx      # User profile & skills
│   │   └── Leaderboard.tsx  # Rankings
│   └── App.tsx              # Main app component
├── .env                     # Environment variables
└── package.json
```

## 🎨 Design Philosophy

- **Glassmorphism**: Modern frosted glass effects
- **Gradient Accents**: Vibrant indigo-to-cyan gradients
- **Dark Theme**: Eye-friendly dark mode by default
- **Micro-interactions**: Smooth animations and transitions
- **Mobile-First**: Responsive design for all devices

## 🔧 Configuration

### Environment Variables

```env
# Required for AI features
VITE_GROQ_API_KEY=your_groq_api_key

# Optional: Add more API keys as needed
```

### Customization

**Modify XP Values** (`src/lib/gameEngine.ts`):
```typescript
export const QUEST_XP: Record<string, number> = {
  S: 10,   // Change these values
  M: 25,
  L: 50,
  XL: 100,
};
```

**Add New Skills** (`src/lib/storage.ts`):
```typescript
export type SkillType = 'strength' | 'intelligence' | 'discipline' | 'social' | 'finance' | 'your_skill';
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Groq](https://groq.com/) and Llama 3.1
- Icons by [Lucide](https://lucide.dev/)
- Inspired by gamification principles and RPG mechanics

## 📧 Contact

Created by [@abhi3114-glitch](https://github.com/abhi3114-glitch)

---

**Start your journey today! Turn your life into an epic adventure! 🚀**