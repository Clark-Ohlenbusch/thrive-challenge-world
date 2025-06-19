
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserSetup = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const setupUser = async () => {
      if (!isLoaded || !user) return;

      console.log('Setting up user:', user.id);
      
      // Check if user already exists in our database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Existing user check:', { existingUser, fetchError });

      // If user doesn't exist, create them
      if (!existingUser && !fetchError) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            display_name: user.fullName || user.firstName || 'User',
            avatar_url: user.imageUrl || null,
          });

        if (insertError) {
          console.error('Error creating user:', insertError);
        } else {
          console.log('User created successfully');
        }
      }
    };

    setupUser();
  }, [user, isLoaded]);
};
