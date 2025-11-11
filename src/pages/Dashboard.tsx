import { useEffect, useState } from 'react';
import { storage, Quest } from '@/lib/storage';
import { StatCard, QuestCard, SkillBar } from '@/components/GameUI';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { completeQuest, undoQuestCompletion, getWeeklyXP } from '@/lib/gameEngine';
import { getMotivationalMessage, isAIConfigured } from '@/lib/aiService';
import { Trophy, Zap, Flame, ArrowRight, ListChecks, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(storage.getUser());
  const [skills, setSkills] = useState(storage.getSkills());
  const [quests, setQuests] = useState(storage.getQuests());
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(storage.getUser());
      setSkills(storage.getSkills());
      setQuests(storage.getQuests());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && isAIConfigured() && !motivationalMessage) {
      loadMotivationalMessage();
    }
  }, [user]);

  const loadMotivationalMessage = async () => {
    if (!user) return;
    setLoadingMotivation(true);
    try {
      const topSkill = [...skills].sort((a, b) => b.xp - a.xp)[0];
      const recentCompletions = storage.getCompletions().filter(c => {
        const completedDate = new Date(c.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return completedDate >= weekAgo;
      }).length;

      const message = await getMotivationalMessage({
        streakCount: user.streakCount,
        level: user.level,
        recentCompletions,
        topSkill: topSkill?.name || 'discipline',
      });
      setMotivationalMessage(message);
    } catch (error) {
      console.error('Failed to load motivational message:', error);
    } finally {
      setLoadingMotivation(false);
    }
  };

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
  const completedToday = quests.filter(q => {
    if (!q.completed) return false;
    const completions = storage.getCompletions().filter(c => c.questId === q.id);
    if (completions.length === 0) return false;
    const lastCompletion = completions[completions.length - 1];
    const today = new Date().toISOString().split('T')[0];
    return lastCompletion.completedAt.split('T')[0] === today;
  }).length;

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
        <h1 className="text-3xl font-bold">Welcome back, {user.displayName}! 👋</h1>
        <p className="text-muted-foreground">Level {user.level} • Ready for today's quests?</p>
      </div>

      {/* AI Motivational Message */}
      {isAIConfigured() && (
        <Card className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 backdrop-blur-sm p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                AI Coach Message
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400">Powered by Llama 3.1</span>
              </h3>
              {loadingMotivation ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm">Getting your personalized message...</span>
                </div>
              ) : (
                <p className="text-muted-foreground">{motivationalMessage || "Keep pushing forward! You're doing amazing! 🚀"}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Level" value={user.level.toString()} hint={`${user.totalXP} total XP`} icon={<Trophy className="h-8 w-8" />} />
        <StatCard label="Weekly XP" value={weeklyXP.toString()} hint="This week" icon={<Zap className="h-8 w-8" />} />
        <StatCard label="Streak" value={`${user.streakCount} days`} hint={user.streakCount > 0 ? 'On fire!' : 'Start today!'} icon={<Flame className="h-8 w-8" />} />
        <StatCard label="Today" value={`${completedToday} quests`} hint="Completed" icon={<TrendingUp className="h-8 w-8" />} />
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
          <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-white/10 transition-all">
            <ListChecks className="h-6 w-6" />
            <span className="text-sm">Manage Quests</span>
          </Button>
        </Link>
        <Link to="/leaderboard" className="block">
          <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-white/10 transition-all">
            <Trophy className="h-6 w-6" />
            <span className="text-sm">Leaderboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}