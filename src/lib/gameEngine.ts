import { storage, Quest, SkillType, BADGES } from './storage';
import { toast } from 'sonner';

// XP to Level conversion
export function calculateLevel(xp: number): number {
  return Math.floor(Math.pow(xp, 1 / 2.7));
}

// Level to XP required
export function xpForLevel(level: number): number {
  return Math.ceil(Math.pow(level, 2.7));
}

// Streak bonus calculation
export function getStreakBonus(streakCount: number): number {
  return Math.min(30, streakCount * 2);
}

// Check if streak is maintained (within 24h + 4h grace period)
export function isStreakActive(lastCompletionDate: string | null): boolean {
  if (!lastCompletionDate) return false;
  const last = new Date(lastCompletionDate);
  const now = new Date();
  const hoursDiff = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 28; // 24h + 4h grace
}

// Get week start date (Monday)
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Complete a quest
export function completeQuest(quest: Quest): void {
  const user = storage.getUser();
  if (!user || quest.completed) return;

  // Calculate XP with streak bonus
  const streakBonus = getStreakBonus(user.streakCount);
  const bonusMultiplier = 1 + streakBonus / 100;
  const xpAwarded = Math.round(quest.xpReward * bonusMultiplier);

  // Update quest
  storage.updateQuest(quest.id, { completed: true });

  // Add completion record
  const now = new Date().toISOString();
  storage.addCompletion({
    questId: quest.id,
    userId: user.id,
    completedAt: now,
    xpAwarded,
    weekStart: getWeekStart(),
  });

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  let newStreakCount = user.streakCount;
  
  if (user.lastCompletionDate) {
    const lastDate = new Date(user.lastCompletionDate).toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastDate === today) {
      // Same day, no change
    } else if (lastDate === yesterdayStr) {
      // Consecutive day
      newStreakCount += 1;
    } else if (isStreakActive(user.lastCompletionDate)) {
      // Within grace period
      newStreakCount += 1;
    } else {
      // Streak broken
      newStreakCount = 1;
    }
  } else {
    newStreakCount = 1;
  }

  // Update skill XP
  const skills = storage.getSkills();
  const skill = skills.find(s => s.name === quest.skill);
  if (skill) {
    const newSkillXP = skill.xp + xpAwarded;
    const newSkillLevel = calculateLevel(newSkillXP);
    storage.updateSkill(quest.skill, newSkillXP, newSkillLevel);
  }

  // Update user
  const newTotalXP = user.totalXP + xpAwarded;
  const newLevel = calculateLevel(newTotalXP);
  storage.updateUser({
    totalXP: newTotalXP,
    level: newLevel,
    streakCount: newStreakCount,
    lastCompletionDate: now,
  });

  // Check for badges
  checkAndAwardBadges();

  // Show toast
  toast.success(`Quest completed! +${xpAwarded} XP`, {
    description: streakBonus > 0 ? `Streak bonus: +${streakBonus}%` : undefined,
  });
}

// Undo quest completion
export function undoQuestCompletion(quest: Quest): void {
  if (!quest.completed) return;

  const completions = storage.getCompletions();
  const completion = completions
    .filter(c => c.questId === quest.id)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

  if (!completion) return;

  const user = storage.getUser();
  if (!user) return;

  // Revert quest
  storage.updateQuest(quest.id, { completed: false });

  // Revert skill XP
  const skills = storage.getSkills();
  const skill = skills.find(s => s.name === quest.skill);
  if (skill) {
    const newSkillXP = Math.max(0, skill.xp - completion.xpAwarded);
    const newSkillLevel = calculateLevel(newSkillXP);
    storage.updateSkill(quest.skill, newSkillXP, newSkillLevel);
  }

  // Revert user XP
  const newTotalXP = Math.max(0, user.totalXP - completion.xpAwarded);
  const newLevel = calculateLevel(newTotalXP);
  storage.updateUser({
    totalXP: newTotalXP,
    level: newLevel,
  });

  toast.info('Quest completion undone');
}

// Check and award badges
export function checkAndAwardBadges(): void {
  const user = storage.getUser();
  if (!user) return;

  const completions = storage.getCompletions();
  const skills = storage.getSkills();
  const userBadges = storage.getUserBadges();
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

  const newBadges: string[] = [];

  // First Steps - Complete first quest
  if (completions.length >= 1 && !earnedBadgeIds.has('first_steps')) {
    storage.awardBadge('first_steps');
    newBadges.push('First Steps');
  }

  // Week Warrior - 7-day streak
  if (user.streakCount >= 7 && !earnedBadgeIds.has('week_warrior')) {
    storage.awardBadge('week_warrior');
    newBadges.push('Week Warrior');
  }

  // Level 5
  if (user.level >= 5 && !earnedBadgeIds.has('level_5')) {
    storage.awardBadge('level_5');
    newBadges.push('Rising Star');
  }

  // Level 10
  if (user.level >= 10 && !earnedBadgeIds.has('level_10')) {
    storage.awardBadge('level_10');
    newBadges.push('Champion');
  }

  // Skill Master - Any skill level 10
  if (skills.some(s => s.level >= 10) && !earnedBadgeIds.has('skill_master')) {
    storage.awardBadge('skill_master');
    newBadges.push('Skill Master');
  }

  // Century Club - 100 completions
  if (completions.length >= 100 && !earnedBadgeIds.has('century_club')) {
    storage.awardBadge('century_club');
    newBadges.push('Century Club');
  }

  // Show badge notifications
  newBadges.forEach(badgeName => {
    toast.success(`Badge Unlocked: ${badgeName}!`, {
      duration: 5000,
    });
  });
}

// Get weekly XP
export function getWeeklyXP(): number {
  const weekStart = getWeekStart();
  const completions = storage.getCompletions();
  return completions
    .filter(c => c.weekStart === weekStart)
    .reduce((sum, c) => sum + c.xpAwarded, 0);
}

// Skill colors
export const SKILL_COLORS: Record<SkillType, string> = {
  strength: 'from-red-500 to-orange-500',
  intelligence: 'from-blue-500 to-cyan-500',
  discipline: 'from-purple-500 to-pink-500',
  social: 'from-green-500 to-emerald-500',
  finance: 'from-yellow-500 to-amber-500',
};

// Skill icons (lucide-react icon names)
export const SKILL_ICON_NAMES: Record<SkillType, string> = {
  strength: 'Dumbbell',
  intelligence: 'Brain',
  discipline: 'Target',
  social: 'Users',
  finance: 'DollarSign',
};

// Quest size to XP mapping
export const QUEST_XP: Record<string, number> = {
  S: 10,
  M: 25,
  L: 50,
  XL: 100,
};