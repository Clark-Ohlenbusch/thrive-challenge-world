
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { copy } from '@/lib/copy';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Search, Users, Calendar, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';

const categories = [
  'All Categories',
  'Fitness',
  'Reading',
  'Wellness',
  'Creativity',
  'Learning',
  'Productivity'
];

interface ChallengeWithOwner {
  id: string;
  title: string;
  category: string;
  description: string | null;
  start_date: string;
  end_date: string;
  slug: string;
  owner: { display_name: string; avatar_url: string | null } | null;
  member_count: number;
}

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const { user } = useUser();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['public-challenges', searchTerm, selectedCategory],
    queryFn: async (): Promise<ChallengeWithOwner[]> => {
      let query = supabase
        .from('challenges')
        .select(`
          id,
          title,
          category,
          description,
          start_date,
          end_date,
          slug,
          owner:users!owner_id(display_name, avatar_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'All Categories') {
        query = query.eq('category', selectedCategory);
      }

      const { data: challengeData, error: challengeError } = await query;
      if (challengeError) throw challengeError;

      // Get member counts for each challenge
      const challengeIds = challengeData?.map(c => c.id) || [];
      if (challengeIds.length === 0) return [];

      const memberCounts = await Promise.all(
        challengeIds.map(async (challengeId) => {
          const { count, error } = await supabase
            .from('memberships')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challengeId);

          if (error) throw error;
          return { challenge_id: challengeId, count: count || 0 };
        })
      );

      // Combine the data
      return challengeData?.map(challenge => {
        const memberCount = memberCounts.find(mc => mc.challenge_id === challenge.id)?.count || 0;
        return {
          ...challenge,
          member_count: memberCount
        };
      }) || [];
    }
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Explore Challenges</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No challenges found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or create the first challenge in this category!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.category}</CardDescription>
                    </div>
                    <Badge variant="default">
                      {copy.challenges.public}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {challenge.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {challenge.member_count} members
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        by {challenge.owner?.display_name}
                      </span>
                    </div>
                    <Button asChild size="sm">
                      <Link to={`/challenge/${challenge.slug}`}>
                        {copy.actions.join}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
