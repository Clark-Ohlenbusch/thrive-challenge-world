
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { copy } from '@/lib/copy';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['my-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          memberships!inner(streak, last_checkin),
          _count:memberships(count)
        `)
        .eq('memberships.user_id', 'current-user-id'); // TODO: Replace with actual auth

      if (error) throw error;
      return data;
    }
  });

  const { data: invites = [] } = useQuery({
    queryKey: ['pending-invites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invites')
        .select(`
          *,
          challenges(title, category),
          inviter:users!inviter_id(display_name)
        `)
        .eq('email', 'user@example.com') // TODO: Replace with actual user email
        .eq('accepted', false);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Button asChild>
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Link>
          </Button>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pending Invites</h2>
            <div className="grid gap-4">
              {invites.map((invite) => (
                <Card key={invite.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{invite.challenges?.title}</span>
                      <div className="space-x-2">
                        <Button size="sm">Accept</Button>
                        <Button variant="outline" size="sm">Decline</Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Invited by {invite.inviter?.display_name} • {invite.challenges?.category}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Challenges */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Challenges</h2>
          {challenges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your journey by joining an existing challenge or creating your own!
                </p>
                <div className="space-x-4">
                  <Button asChild>
                    <Link to="/explore">Explore Challenges</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/create">Create Challenge</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-2">{challenge.title}</CardTitle>
                        <CardDescription>{challenge.category}</CardDescription>
                      </div>
                      <Badge variant={challenge.is_public ? "default" : "secondary"}>
                        {challenge.is_public ? copy.challenges.public : copy.challenges.private}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {challenge._count} members
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Streak: </span>
                          <span className="text-lg font-bold text-primary">
                            {challenge.memberships[0]?.streak || 0}
                          </span>
                        </div>
                        <Button asChild size="sm">
                          <Link to={`/challenge/${challenge.slug}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
