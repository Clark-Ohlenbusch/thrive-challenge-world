
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Flame, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: userChallenges, isLoading } = useQuery({
    queryKey: ['user-challenges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          *,
          challenges (
            id,
            title,
            description,
            slug,
            start_date,
            end_date,
            category,
            is_public
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: ownedChallenges } = useQuery({
    queryKey: ['owned-challenges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your dashboard...</div>
        </div>
      </Layout>
    );
  }

  const hasChallenges = userChallenges && userChallenges.length > 0;
  const hasOwnedChallenges = ownedChallenges && ownedChallenges.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || 'Champion'}!</h1>
            <p className="text-muted-foreground">Track your progress and stay motivated</p>
          </div>
          <Button asChild>
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Link>
          </Button>
        </div>

        {!hasChallenges && !hasOwnedChallenges ? (
          <Card className="text-center p-12">
            <CardHeader>
              <CardTitle>Ready to start your first challenge?</CardTitle>
              <CardDescription>
                Join existing challenges or create your own to begin your journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <Link to="/explore">
                    <Users className="h-4 w-4 mr-2" />
                    Explore Challenges
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Challenge
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {hasOwnedChallenges && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Your Challenges</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedChallenges?.map((challenge) => (
                    <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <Badge variant={challenge.is_public ? "default" : "secondary"}>
                            {challenge.is_public ? "Public" : "Private"}
                          </Badge>
                        </div>
                        <CardDescription>{challenge.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d')}
                          </div>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                          <Link to={`/challenge/${challenge.slug}`}>
                            Manage Challenge
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {hasChallenges && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Joined Challenges</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userChallenges?.map((membership) => (
                    <Card key={membership.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{membership.challenges.title}</CardTitle>
                        <CardDescription>{membership.challenges.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <Flame className="h-4 w-4 mr-1 text-orange-500" />
                            <span className="font-semibold">{membership.streak} day streak</span>
                          </div>
                          <Badge variant="outline">{membership.challenges.category}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          Last check-in: {membership.last_checkin ? format(new Date(membership.last_checkin), 'MMM d') : 'Never'}
                        </div>
                        <Button asChild className="w-full">
                          <Link to={`/challenge/${membership.challenges.slug}`}>
                            View Challenge
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
