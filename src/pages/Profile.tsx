import { useEffect, useState } from 'react';
import { storage, BADGES } from '@/lib/storage';
import { StatCard, SkillBar, BadgeCard } from '@/components/GameUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { calculateLevel, xpForLevel, getWeeklyXP } from '@/lib/gameEngine';
import { Trophy, Zap, Flame, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const [user, setUser] = useState(storage.getUser());
  const [skills, setSkills] = useState(storage.getSkills());
  const [userBadges, setUserBadges] = useState(storage.getUserBadges());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(storage.getUser());
      setSkills(storage.getSkills());
      setUserBadges(storage.getUserBadges());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full space-y-4">
          <h2 className="text-2xl font-bold text-center">Welcome to LevelUp!</h2>
          <p className="text-muted-foreground text-center">Create your profile to start your journey</p>
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              placeholder="Enter your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && displayName.trim()) {
                  const username = displayName.toLowerCase().replace(/\s+/g, '_');
                  storage.createUser(username, displayName);
                  setUser(storage.getUser());
                  toast.success('Profile created! Start your adventure!');
                }
              }}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (displayName.trim()) {
                const username = displayName.toLowerCase().replace(/\s+/g, '_');
                storage.createUser(username, displayName);
                setUser(storage.getUser());
                toast.success('Profile created! Start your adventure!');
              }
            }}
          >
            Start Adventure
          </Button>
        </Card>
      </div>
    );
  }

  const currentLevelXP = xpForLevel(user.level);
  const nextLevelXP = xpForLevel(user.level + 1);
  const progressXP = user.totalXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const levelProgress = Math.round((progressXP / requiredXP) * 100);
  const weeklyXP = getWeeklyXP();

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

  const handleUpdateProfile = () => {
    if (displayName.trim()) {
      storage.updateUser({ displayName });
      setUser(storage.getUser());
      setEditDialogOpen(false);
      toast.success('Profile updated!');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Profile</h1>
          <p className="text-muted-foreground">Your stats and achievements</p>
        </div>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Info */}
      <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 backdrop-blur-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.displayName}</h2>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Level {user.level}</span>
            <span className="text-muted-foreground">
              {progressXP} / {requiredXP} XP
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total XP" value={user.totalXP.toString()} icon={<Zap />} />
        <StatCard label="Weekly XP" value={weeklyXP.toString()} hint="This week" icon={<Trophy />} />
        <StatCard label="Streak" value={`${user.streakCount} days`} hint={user.streakCount > 0 ? 'Keep it up!' : 'Start today!'} icon={<Flame />} />
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Skills</h2>
        <div className="space-y-4">
          {skills.map(skill => (
            <SkillBar key={skill.name} skill={skill} />
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Badges</h2>
          <span className="text-sm text-muted-foreground">
            {userBadges.length} / {BADGES.length}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGES.map(badge => (
            <BadgeCard key={badge.id} badge={badge} awarded={earnedBadgeIds.has(badge.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}