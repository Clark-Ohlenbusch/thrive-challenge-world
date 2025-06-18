
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart } from 'lucide-react';
import { CommentComposer } from './CommentComposer';
import { useEffect } from 'react';

interface FeedTabProps {
  challengeId: string;
  realtimeUpdate?: number;
}

interface FeedEntry {
  id: string;
  entry_date: string;
  value_numeric: number | null;
  note: string | null;
  photo_url: string | null;
  created_at: string;
  memberships: {
    users: {
      display_name: string;
      avatar_url: string | null;
    };
  };
}

export function FeedTab({ challengeId, realtimeUpdate }: FeedTabProps) {
  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['challenge-entries', challengeId],
    queryFn: async (): Promise<FeedEntry[]> => {
      const { data, error } = await supabase
        .from('entries')
        .select(`
          id,
          entry_date,
          value_numeric,
          note,
          photo_url,
          created_at,
          memberships!inner(
            users!inner(display_name, avatar_url)
          )
        `)
        .eq('memberships.challenge_id', challengeId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as FeedEntry[];
    }
  });

  // Refetch when realtime update occurs
  useEffect(() => {
    if (realtimeUpdate) {
      refetch();
    }
  }, [realtimeUpdate, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No entries yet</h3>
          <p className="text-muted-foreground">
            Be the first to check in and share your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <Card key={entry.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.memberships.users.avatar_url} />
                <AvatarFallback>{entry.memberships.users.display_name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.memberships.users.display_name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {format(new Date(entry.entry_date), 'MMM d')}
                  </Badge>
                </div>

                {entry.photo_url && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={entry.photo_url} 
                      alt="Check-in photo" 
                      className="w-full max-w-md h-auto object-cover"
                    />
                  </div>
                )}

                {entry.note && (
                  <p className="text-gray-700">{entry.note}</p>
                )}

                {entry.value_numeric && (
                  <Badge variant="outline" className="w-fit">
                    {entry.value_numeric} completed
                  </Badge>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{format(new Date(entry.created_at), 'h:mm a')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <CommentComposer challengeId={challengeId} />
    </div>
  );
}
