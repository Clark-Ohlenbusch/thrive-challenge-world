
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardTabProps {
  challengeId: string;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  streak: number;
  joined_at: string;
  entry_count: number;
  users: {
    display_name: string;
    avatar_url: string | null;
  };
}

export function LeaderboardTab({ challengeId }: LeaderboardTabProps) {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['challenge-leaderboard', challengeId],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      // Get memberships with user data
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select(`
          id,
          user_id,
          streak,
          joined_at,
          users!inner(display_name, avatar_url)
        `)
        .eq('challenge_id', challengeId);

      if (membershipsError) throw membershipsError;

      // Get entry counts for each membership
      const membershipIds = memberships.map(m => m.id);
      
      if (membershipIds.length === 0) return [];

      const { data: entryCounts, error: entryError } = await supabase
        .from('entries')
        .select('membership_id')
        .in('membership_id', membershipIds);

      if (entryError) throw entryError;

      // Count entries per membership
      const entryCountMap = entryCounts.reduce((acc, entry) => {
        acc[entry.membership_id] = (acc[entry.membership_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Combine data and sort
      const leaderboardData = memberships.map(membership => ({
        ...membership,
        entry_count: entryCountMap[membership.id] || 0
      }));

      // Sort by streak (descending), then by entry count (descending)
      return leaderboardData.sort((a, b) => {
        if (b.streak !== a.streak) return b.streak - a.streak;
        return b.entry_count - a.entry_count;
      });
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No participants yet</h3>
          <p className="text-muted-foreground">
            Start checking in to see yourself on the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center w-8">
              {getRankIcon(index + 1)}
            </div>

            <Avatar className="h-10 w-10">
              <AvatarImage src={entry.users.avatar_url} />
              <AvatarFallback>{entry.users.display_name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="font-medium">{entry.users.display_name}</p>
              <p className="text-sm text-muted-foreground">
                {entry.entry_count} check-ins
              </p>
            </div>

            <div className="text-right">
              <Badge variant={entry.streak > 0 ? "default" : "secondary"} className="mb-1">
                🔥 {entry.streak}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
