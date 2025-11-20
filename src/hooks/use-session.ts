"use client";

import { useState, useEffect } from 'react';
import type { Session } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sessionData = sessionStorage.getItem('session');
    if (sessionData) {
      setSession(JSON.parse(sessionData));
    } else {
      // If no session, redirect to login page.
      // This protects routes.
      router.replace('/');
    }
    setIsLoading(false);
  }, [router]);

  const logout = () => {
    sessionStorage.removeItem('session');
    setSession(null);
    router.push('/');
  }

  return { session, isLoading, logout };
}
