
import { useAuth, useUser } from '@clerk/clerk-react';
import { ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (!isSignedIn || !user) return;

      try {
        const { error } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            display_name: user.fullName ?? user.username ?? 'New Challenger',
            avatar_url: user.imageUrl || null
          }, { onConflict: 'id' });

        if (error) {
          console.error('Error syncing user to Supabase:', error);
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    if (isLoaded && isSignedIn) {
      syncUserToSupabase();
    }
  }, [isSignedIn, isLoaded, user]);

  return <>{children}</>;
}
