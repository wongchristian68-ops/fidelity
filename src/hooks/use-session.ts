
"use client";

import { useUser } from '@/firebase';
import { getClient, getRestaurant, saveClient } from '@/lib/db';
import type { Session, Client, Restaurant } from '@/lib/types';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

// This custom hook now wraps the Firebase `useUser` hook
// and fetches the user's profile from Firestore.
export function useSession() {
  const { user, isUserLoading: isAuthLoading, userError } = useUser();
  const auth = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }
    if (userError) {
      setError(userError);
      setIsLoading(false);
      setSession(null);
      return;
    }
    if (!user) {
      // User is not authenticated
      setSession(null);
      setIsLoading(false);
      return;
    }
    
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        let profile: Client | Restaurant | null = null;
        let role: 'client' | 'resto' | null = null;

        // Check if it's a restaurant user (they log in with email)
        if (user.email) {
          profile = await getRestaurant(user.uid);
          role = 'resto';
        } else if (user.isAnonymous) {
          // Check if it's a client (anonymous auth)
          profile = await getClient(user.uid);
          role = 'client';
        }

        if (profile && role) {
          setSession({
            id: user.uid,
            name: profile.name,
            role: role,
          });
        } else {
            // This can happen if the profile document hasn't been created yet.
            // For anonymous users, we create one on the fly on the login page.
            // We'll wait for the login flow to create the user profile.
            // if we are here it might be during login flow, so we wait.
            // if we already have a user but no profile, something is wrong.
             if (user.isAnonymous && !profile) {
                // This might happen if the user authenticated but the page reloaded
                // before the profile was created on the login page. We can try to fetch it again shortly.
                // For now, we assume it's being created.
                setSession(null);
             } else {
                 setSession(null);
             }
        }
      } catch (e: any) {
        console.error("Error fetching user profile:", e);
        setError(e);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthLoading, userError]);

  const logout = async () => {
    try {
      await signOut(auth);
      setSession(null);
      // AuthRedirect component will handle navigation to '/'
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { session, isLoading, logout, error };
}
