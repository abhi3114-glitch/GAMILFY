import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getWeeklyXP } from '@/lib/gameEngine';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  isCurrentUser: boolean;
}

export default function Leaderboard() {
  const [user, setUser] = useState(storage.getUser());
  const [weeklyXP, setWeeklyXP] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(storage.getUser());
      setWeeklyXP(getWeeklyXP());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock leaderboard data (in real app, this would come from backend)
  const mockUsers: Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'>[] = [
    { name: 'Alex Chen', level: 15, xp: 2450 },
    { name: 'Sarah Johnson', level: 14, xp: 2280 },
    { name: 'Mike Rodriguez', level: 13, xp: 2100 },
    { name: 'Emily Davis', level: 12, xp: 1950 },
    { name: 'James Wilson', level: 11, xp: 1820 },
    { name: 'Lisa Anderson', level: 10, xp: 1650 },
    { name: 'David Lee', level: 10, xp: 1580 },
    { name: 'Maria Garcia', level: 9, xp: 1420 },
    { name: 'Chris Taylor', level: 9, xp: 1350 },
    { name: 'Anna Martinez', level: 8, xp: 1200 },
  ];

  const createLeaderboard = (xpType: 'total' | 'weekly'): LeaderboardEntry[] => {
    const currentUserXP = xpType === 'total' ? user?.totalXP || 0 : weeklyXP;
    const currentUserLevel = user?.level || 1;
    const currentUserName = user?.displayName || 'You';

    // Combine mock users with current user
    const allUsers = [
      ...mockUsers.map(u => ({
        ...u,
        xp: xpType === 'weekly' ? Math.floor(u.xp * 0.3) : u.xp, // Weekly is ~30% of total
      })),
      {
        name: currentUserName,
        level: currentUserLevel,
        xp: currentUserXP,
      },
    ];

    // Sort by XP (descending), then by level
    const sorted = allUsers.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.level - a.level;
    });

    // Add ranks and mark current user
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.name === currentUserName,
    }));
  };

  const allTimeLeaderboard = createLeaderboard('total');
  const weeklyLeaderboard = createLeaderboard('weekly');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  const LeaderboardTable = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {entries.map(entry => (
        <Card
          key={`${entry.rank}-${entry.name}`}
          className={`p-4 transition-all ${
            entry.isCurrentUser ? 'border-indigo-500 bg-indigo-500/10 shadow-lg' : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 flex items-center justify-center font-bold">{getRankIcon(entry.rank)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{entry.name}</span>
                {entry.isCurrentUser && <Badge variant="secondary">You</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">Level {entry.level}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-indigo-400">{entry.xp.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Create a profile to see the leaderboard</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against others</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <div className="text-sm text-muted-foreground">Rankings reset every Monday at midnight</div>
          <LeaderboardTable entries={weeklyLeaderboard} />
        </TabsContent>

        <TabsContent value="alltime" className="space-y-4">
          <div className="text-sm text-muted-foreground">Overall rankings based on total XP earned</div>
          <LeaderboardTable entries={allTimeLeaderboard} />
        </TabsContent>
      </Tabs>
    </div>
  );
}