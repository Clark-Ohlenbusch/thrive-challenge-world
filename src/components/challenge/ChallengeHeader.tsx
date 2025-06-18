
import { format } from 'date-fns';
import { Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface ChallengeHeaderProps {
  challenge: any;
  userMembership: any;
  onJoinLeave: () => void;
  onCheckIn: () => void;
}

export function ChallengeHeader({ challenge, userMembership, onJoinLeave, onCheckIn }: ChallengeHeaderProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinLeave = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      if (userMembership) {
        // Leave challenge
        const { error } = await supabase
          .from('memberships')
          .delete()
          .eq('id', userMembership.id);

        if (error) throw error;
        toast.success('Left challenge successfully');
      } else {
        // Join challenge
        const { error } = await supabase
          .from('memberships')
          .insert({
            user_id: user.id,
            challenge_id: challenge.id
          });

        if (error) throw error;
        toast.success('Joined challenge successfully!');
      }
      
      onJoinLeave();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const canCheckIn = userMembership && new Date() >= new Date(challenge.start_date) && new Date() <= new Date(challenge.end_date);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{challenge.title}</h1>
            <Badge variant="secondary">{challenge.category}</Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={challenge.users.avatar_url} />
                <AvatarFallback>{challenge.users.display_name[0]}</AvatarFallback>
              </Avatar>
              <span>by {challenge.users.display_name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{challenge.memberships.length} members</span>
            </div>
          </div>

          {userMembership && (
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                🔥 {userMembership.streak} day streak
              </Badge>
              {userMembership.last_checkin && (
                <span className="text-sm text-muted-foreground">
                  Last check-in: {format(new Date(userMembership.last_checkin), 'MMM d')}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {canCheckIn && (
            <Button onClick={onCheckIn} className="bg-green-600 hover:bg-green-700">
              Daily Check-in
            </Button>
          )}
          
          <Button
            variant={userMembership ? "outline" : "default"}
            onClick={handleJoinLeave}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : userMembership ? 'Leave Challenge' : 'Join Challenge'}
          </Button>
        </div>
      </div>
    </div>
  );
}
