// Data models
export type SkillType = 'strength' | 'intelligence' | 'discipline' | 'social' | 'finance';
export type QuestSize = 'S' | 'M' | 'L' | 'XL';

export interface User {
  id: string;
  username: string;
  displayName: string;
  level: number;
  totalXP: number;
  streakCount: number;
  lastCompletionDate: string | null;
  createdAt: string;
}

export interface Skill {
  name: SkillType;
  xp: number;
  level: number;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  skill: SkillType;
  xpReward: number;
  size: QuestSize;
  dueDate?: string;
  isRecurring: boolean;
  completed: boolean;
  createdAt: string;
}

export interface Completion {
  id: string;
  questId: string;
  userId: string;
  completedAt: string;
  xpAwarded: number;
  weekStart: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
}

export interface UserBadge {
  badgeId: string;
  awardedAt: string;
}

export interface GameData {
  user: User | null;
  skills: Skill[];
  quests: Quest[];
  completions: Completion[];
  userBadges: UserBadge[];
}

const STORAGE_KEY = 'levelup_game_data';

// Initialize default skills
export const DEFAULT_SKILLS: Skill[] = [
  { name: 'strength', xp: 0, level: 1 },
  { name: 'intelligence', xp: 0, level: 1 },
  { name: 'discipline', xp: 0, level: 1 },
  { name: 'social', xp: 0, level: 1 },
  { name: 'finance', xp: 0, level: 1 },
];

// Predefined badges (using lucide-react icon names)
export const BADGES: Badge[] = [
  { id: 'first_steps', code: 'FIRST_STEPS', name: 'First Steps', description: 'Complete your first quest', iconName: 'Target' },
  { id: 'week_warrior', code: 'WEEK_WARRIOR', name: 'Week Warrior', description: 'Maintain a 7-day streak', iconName: 'Flame' },
  { id: 'level_5', code: 'LEVEL_5', name: 'Rising Star', description: 'Reach level 5', iconName: 'Star' },
  { id: 'level_10', code: 'LEVEL_10', name: 'Champion', description: 'Reach level 10', iconName: 'Crown' },
  { id: 'skill_master', code: 'SKILL_MASTER', name: 'Skill Master', description: 'Max out any skill to level 10', iconName: 'Award' },
  { id: 'perfectionist', code: 'PERFECTIONIST', name: 'Perfectionist', description: '100% daily completion for 7 days', iconName: 'Sparkles' },
  { id: 'century_club', code: 'CENTURY_CLUB', name: 'Century Club', description: 'Complete 100 total quests', iconName: 'TrendingUp' },
];

// Storage operations
export const storage = {
  load(): GameData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load game data:', error);
    }
    return {
      user: null,
      skills: [],
      quests: [],
      completions: [],
      userBadges: [],
    };
  },

  save(data: GameData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save game data:', error);
    }
  },

  createUser(username: string, displayName: string): User {
    const user: User = {
      id: crypto.randomUUID(),
      username,
      displayName,
      level: 1,
      totalXP: 0,
      streakCount: 0,
      lastCompletionDate: null,
      createdAt: new Date().toISOString(),
    };
    const data = this.load();
    data.user = user;
    data.skills = [...DEFAULT_SKILLS];
    this.save(data);
    return user;
  },

  getUser(): User | null {
    return this.load().user;
  },

  updateUser(updates: Partial<User>): void {
    const data = this.load();
    if (data.user) {
      data.user = { ...data.user, ...updates };
      this.save(data);
    }
  },

  getSkills(): Skill[] {
    return this.load().skills;
  },

  updateSkill(skillName: SkillType, xp: number, level: number): void {
    const data = this.load();
    const skill = data.skills.find(s => s.name === skillName);
    if (skill) {
      skill.xp = xp;
      skill.level = level;
      this.save(data);
    }
  },

  getQuests(): Quest[] {
    return this.load().quests;
  },

  createQuest(quest: Omit<Quest, 'id' | 'userId' | 'createdAt'>): Quest {
    const data = this.load();
    const newQuest: Quest = {
      ...quest,
      id: crypto.randomUUID(),
      userId: data.user?.id || '',
      createdAt: new Date().toISOString(),
    };
    data.quests.push(newQuest);
    this.save(data);
    return newQuest;
  },

  updateQuest(id: string, updates: Partial<Quest>): void {
    const data = this.load();
    const index = data.quests.findIndex(q => q.id === id);
    if (index !== -1) {
      data.quests[index] = { ...data.quests[index], ...updates };
      this.save(data);
    }
  },

  deleteQuest(id: string): void {
    const data = this.load();
    data.quests = data.quests.filter(q => q.id !== id);
    this.save(data);
  },

  getCompletions(): Completion[] {
    return this.load().completions;
  },

  addCompletion(completion: Omit<Completion, 'id'>): Completion {
    const data = this.load();
    const newCompletion: Completion = {
      ...completion,
      id: crypto.randomUUID(),
    };
    data.completions.push(newCompletion);
    this.save(data);
    return newCompletion;
  },

  getUserBadges(): UserBadge[] {
    return this.load().userBadges;
  },

  awardBadge(badgeId: string): void {
    const data = this.load();
    const exists = data.userBadges.find(ub => ub.badgeId === badgeId);
    if (!exists) {
      data.userBadges.push({
        badgeId,
        awardedAt: new Date().toISOString(),
      });
      this.save(data);
    }
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};