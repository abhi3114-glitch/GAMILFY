import { useEffect, useState } from 'react';
import { storage, Quest } from '@/lib/storage';
import { StatCard, QuestCard, SkillBar } from '@/components/GameUI';
import { Button } from '@/components/ui/button';
import { completeQuest, undoQuestCompletion, getWeeklyXP } from '@/lib/gameEngine';
import { Trophy, Zap, Flame, ArrowRight, ListChecks, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(storage.getUser());
  const [skills, setSkills] = useState(storage.getSkills());
  const [quests, setQuests] = useState(storage.getQuests());

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(storage.getUser());
      setSkills(storage.getSkills());
      setQuests(storage.getQuests());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Welcome to LevelUp!</h1>
          <p className="text-muted-foreground">Create your profile to start</p>
          <Link to="/profile">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeQuests = quests.filter(q => !q.completed).slice(0, 5);
  const weeklyXP = getWeeklyXP();
  const topSkills = [...skills].sort((a, b) => b.xp - a.xp).slice(0, 3);

  const handleComplete = (quest: Quest) => {
    completeQuest(quest);
    setQuests(storage.getQuests());
  };

  const handleUndo = (quest: Quest) => {
    undoQuestCompletion(quest);
    setQuests(storage.getQuests());
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.displayName}!</h1>
        <p className="text-muted-foreground">Level {user.level} • Ready for today's quests?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Level" value={user.level.toString()} hint={`${user.totalXP} total XP`} icon={<Trophy className="h-8 w-8" />} />
        <StatCard label="Weekly XP" value={weeklyXP.toString()} hint="This week" icon={<Zap className="h-8 w-8" />} />
        <StatCard label="Streak" value={`${user.streakCount} days`} hint={user.streakCount > 0 ? 'On fire!' : 'Start today!'} icon={<Flame className="h-8 w-8" />} />
      </div>

      {/* Top Skills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Top Skills</h2>
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {topSkills.map(skill => (
            <SkillBar key={skill.name} skill={skill} />
          ))}
        </div>
      </div>

      {/* Active Quests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Active Quests</h2>
          <Link to="/quests">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {activeQuests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No active quests. Create your first quest!</p>
            <Link to="/quests">
              <Button>Create Quest</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} onComplete={() => handleComplete(quest)} onUndo={() => handleUndo(quest)} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/quests" className="block">
          <Button variant="outline" className="w-full h-20 flex-col gap-2">
            <ListChecks className="h-6 w-6" />
            <span className="text-sm">Manage Quests</span>
          </Button>
        </Link>
        <Link to="/leaderboard" className="block">
          <Button variant="outline" className="w-full h-20 flex-col gap-2">
            <Trophy className="h-6 w-6" />
            <span className="text-sm">Leaderboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}