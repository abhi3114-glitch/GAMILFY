# LevelUp - Real-Life Gamification App - MVP Implementation Plan

## Project Overview
Building an RPG-style habit/productivity platform with Next.js, Tailwind, and Supabase (localStorage for MVP since Supabase is disabled).

## Tech Stack
- React + TypeScript + Vite (using shadcn-ui template)
- Tailwind CSS with glassmorphism design
- localStorage for data persistence (Supabase disabled)
- Framer Motion for animations
- Lucide React for icons

## MVP Features (Simplified for localStorage)
1. ✅ Quest Management (CRUD)
2. ✅ XP & Skills System (5 skills)
3. ✅ Streaks Tracking
4. ✅ Badges System
5. ✅ Leaderboard (mock data for demo)
6. ✅ Responsive Mobile-First UI
7. ✅ Auth (Simple username-based for localStorage)

## File Structure (Max 8 code files limit)

### 1. src/pages/Index.tsx (Main Dashboard)
- Home page with stats overview
- Quest list with quick complete
- Streak display
- Navigation to other pages

### 2. src/pages/Quests.tsx (Quest Management)
- Create/Edit/Delete quests
- Filter by skill/status
- Complete/Undo completion

### 3. src/pages/Profile.tsx (User Profile)
- Display user stats (level, total XP)
- Show all 5 skill progress bars
- Badge collection display
- Username management

### 4. src/pages/Leaderboard.tsx (Rankings)
- Weekly & All-time tabs
- Top users list (mock + current user)
- Rank display

### 5. src/lib/gameEngine.ts (Core Logic)
- XP calculation: level = floor((totalXP)^(1/2.7))
- Streak bonus: +2% per day, max +30%
- Badge unlock conditions
- Quest completion logic
- Skills XP distribution

### 6. src/lib/storage.ts (Data Layer)
- localStorage wrapper
- CRUD operations for quests, profile, completions
- Data models/types

### 7. src/components/GameUI.tsx (Shared Components)
- StatCard component
- SkillBar component
- QuestCard component
- BadgeCard component
- BottomNav component (mobile)
- ConfettiEffect component

### 8. src/App.tsx (Router & Layout)
- Route configuration
- Layout with responsive nav
- Theme provider

## Data Models (localStorage)

```typescript
interface User {
  id: string;
  username: string;
  displayName: string;
  level: number;
  totalXP: number;
  streakCount: number;
  lastCompletionDate: string;
  createdAt: string;
}

interface Skill {
  name: 'strength' | 'intelligence' | 'discipline' | 'social' | 'finance';
  xp: number;
  level: number;
}

interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  skill: Skill['name'];
  xpReward: number;
  size: 'S' | 'M' | 'L' | 'XL';
  dueDate?: string;
  isRecurring: boolean;
  completed: boolean;
  createdAt: string;
}

interface Completion {
  id: string;
  questId: string;
  userId: string;
  completedAt: string;
  xpAwarded: number;
  weekStart: string;
}

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
}

interface UserBadge {
  badgeId: string;
  awardedAt: string;
}
```

## XP & Balancing
- Quest XP: S=10, M=25, L=50, XL=100
- Profile Level: `Math.floor(Math.pow(totalXP, 1/2.7))`
- Skill Level: Same formula per skill
- Streak Bonus: Math.min(30, streakCount * 2)%
- Weekly Reset: Track completions by week

## Badges (Initial Set)
1. First Steps - Complete first quest
2. Week Warrior - 7-day streak
3. Level 5 - Reach level 5
4. Level 10 - Reach level 10
5. Skill Master - Max out any skill to level 10
6. Perfectionist - 100% daily completion for 7 days
7. Century Club - 100 total quests completed

## Responsive Design
- Mobile: Bottom nav, stacked cards, compact stats
- Desktop: Sidebar nav, grid layout, expanded stats
- Breakpoints: sm(640), md(768), lg(1024), xl(1280)

## Color Scheme
- Primary: Indigo-500 to Cyan-400 gradient
- Background: Slate-900 (dark) / Slate-50 (light)
- Cards: Glassmorphism with backdrop-blur
- Skills: Different gradient per skill

## Implementation Order
1. ✅ Setup data models and storage layer
2. ✅ Implement game engine (XP, levels, streaks, badges)
3. ✅ Create shared UI components
4. ✅ Build Profile page (stats, skills, badges)
5. ✅ Build Quests page (CRUD, completion)
6. ✅ Build Dashboard (overview, quick actions)
7. ✅ Build Leaderboard page
8. ✅ Add animations and micro-interactions
9. ✅ Responsive layout and navigation
10. ✅ Final polish and testing

## Notes
- Using localStorage means single-user experience
- Leaderboard will show mock data + current user
- No real-time sync (refresh to see updates)
- Simple username-based "auth" (no passwords)
- Focus on core gameplay loop and UX