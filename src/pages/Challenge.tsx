
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ChallengeHeader } from '@/components/challenge/ChallengeHeader';
import { ChallengeTabs } from '@/components/challenge/ChallengeTabs';
import { CheckInModal } from '@/components/challenge/CheckInModal';
import { NotFound } from '@/pages/NotFound';
import { useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChallengeWithDetails {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  start_date: string;
  end_date: string;
  frequency: 'daily' | 'weekly';
  unit_label: string | null;
  goal_numeric: number | null;
  is_public: boolean;
  owner_id: string;
  created_at: string;
  users: {
    display_name: string;
    avatar_url: string | null;
  };
  memberships: Array<{
    id: string;
    user_id: string;
    streak: number;
    last_checkin: string | null;
    joined_at: string;
  }>;
}

export default function Challenge() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [realtimeData, setRealtimeData] = useState<any>(null);

  const { data: challenge, isLoading, error, refetch } = useQuery({
    queryKey: ['challenge', slug],
    queryFn: async (): Promise<ChallengeWithDetails> => {
      if (!slug) throw new Error('No slug provided');
      
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          users!owner_id(display_name, avatar_url),
          memberships(id, user_id, streak, last_checkin, joined_at)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as ChallengeWithDetails;
    },
    enabled: !!slug
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!challenge?.id) return;

    const channel: RealtimeChannel = supabase
      .channel(`challenge-${challenge.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memberships',
          filter: `challenge_id=eq.${challenge.id}`
        },
        (payload) => {
          console.log('Memberships change:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entries'
        },
        (payload) => {
          console.log('Entries change:', payload);
          // Refetch entries data for feed updates
          setRealtimeData(prev => ({ ...prev, entriesUpdate: Date.now() }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challenge?.id, refetch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !challenge) {
    return <NotFound />;
  }

  const userMembership = challenge.memberships.find(m => m.user_id === user?.id);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <ChallengeHeader 
          challenge={challenge} 
          userMembership={userMembership}
          onJoinLeave={refetch}
          onCheckIn={() => setIsCheckInOpen(true)}
        />
        
        <ChallengeTabs 
          challenge={challenge} 
          realtimeUpdate={realtimeData?.entriesUpdate}
        />

        {userMembership && (
          <CheckInModal
            isOpen={isCheckInOpen}
            onClose={() => setIsCheckInOpen(false)}
            challenge={challenge}
            membership={userMembership}
            onSuccess={() => {
              setIsCheckInOpen(false);
              refetch();
            }}
          />
        )}
      </div>
    </Layout>
  );
}
