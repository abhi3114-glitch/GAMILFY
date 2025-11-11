import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quest, SkillType, Skill, BADGES } from '@/lib/storage';
import { SKILL_COLORS, calculateLevel, xpForLevel } from '@/lib/gameEngine';
import { CheckCircle2, Circle, Trash2, Edit, Home, Trophy, User, ListTodo, Dumbbell, Brain, Target, Users, DollarSign, Flame, Star, Crown, Award, Sparkles, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

// Skill icon mapping
const SKILL_ICONS: Record<SkillType, React.ComponentType<{ className?: string }>> = {
  strength: Dumbbell,
  intelligence: Brain,
  discipline: Target,
  social: Users,
  finance: DollarSign,
};

// Badge icon mapping
const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Flame,
  Star,
  Crown,
  Award,
  Sparkles,
  TrendingUp,
};

// Stat Card Component
export function StatCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{value}</div>
          {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && <div className="text-indigo-400 opacity-70">{icon}</div>}
      </div>
    </Card>
  );
}

// Skill Bar Component
export function SkillBar({ skill }: { skill: Skill }) {
  const currentLevelXP = xpForLevel(skill.level);
  const nextLevelXP = xpForLevel(skill.level + 1);
  const progressXP = skill.xp - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const percentage = Math.min(100, Math.round((progressXP / requiredXP) * 100));

  const SkillIcon = SKILL_ICONS[skill.name];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkillIcon className="h-5 w-5 text-indigo-400" />
          <span className="font-medium capitalize">{skill.name}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Lv {skill.level} • {skill.xp} XP
        </div>
      </div>
      <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${SKILL_COLORS[skill.name]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-right">
        {progressXP} / {requiredXP} XP to next level
      </div>
    </div>
  );
}

// Quest Card Component
export function QuestCard({
  quest,
  onComplete,
  onUndo,
  onEdit,
  onDelete,
}: {
  quest: Quest;
  onComplete?: () => void;
  onUndo?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const SkillIcon = SKILL_ICONS[quest.skill];

  return (
    <Card className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm p-4 shadow-lg hover:shadow-xl transition-all">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold ${quest.completed ? 'line-through text-muted-foreground' : ''}`}>{quest.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {quest.size}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize flex items-center gap-1">
                <SkillIcon className="h-3 w-3" />
                {quest.skill}
              </Badge>
            </div>
            {quest.description && <p className="text-sm text-muted-foreground">{quest.description}</p>}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-indigo-400">+{quest.xpReward} XP</span>
              {quest.dueDate && <span>• Due: {new Date(quest.dueDate).toLocaleDateString()}</span>}
              {quest.isRecurring && <span>• Recurring</span>}
            </div>
          </div>
          <Button
            size="icon"
            variant={quest.completed ? 'secondary' : 'default'}
            onClick={quest.completed ? onUndo : onComplete}
            className="shrink-0"
          >
            {quest.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </Button>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2 border-t border-white/10">
            {onEdit && (
              <Button size="sm" variant="ghost" onClick={onEdit} className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" onClick={onDelete} className="flex-1 text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Badge Card Component
export function BadgeCard({ badge, awarded }: { badge: { id: string; name: string; description: string; iconName: string }; awarded: boolean }) {
  const IconComponent = BADGE_ICONS[badge.iconName] || Award;

  return (
    <Card className={`rounded-xl p-4 text-center transition-all ${awarded ? 'border-indigo-500/50 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10' : 'border-white/10 bg-white/5 opacity-50'}`}>
      <div className="flex justify-center mb-2">
        <IconComponent className={`h-10 w-10 ${awarded ? 'text-indigo-400' : 'text-muted-foreground'}`} />
      </div>
      <div className="font-semibold text-sm mb-1">{badge.name}</div>
      <div className="text-xs text-muted-foreground">{badge.description}</div>
    </Card>
  );
}

// Bottom Navigation Component
export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/quests', icon: ListTodo, label: 'Quests' },
    { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-white/10 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-indigo-400' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Sidebar Navigation Component
export function SideNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/quests', icon: ListTodo, label: 'Quests' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-background/50 backdrop-blur-sm p-6 space-y-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">LevelUp</h1>
        <p className="text-sm text-muted-foreground">Turn life into a game</p>
      </div>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}