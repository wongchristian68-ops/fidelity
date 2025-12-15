
'use client';

import { useSession } from '@/hooks/use-session';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * A component that handles redirection based on authentication status.
 * It protects routes and redirects users to the appropriate page.
 */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { session, isLoading, error } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait until session status is determined
    if (error) {
        console.error("AuthRedirect Error:", error);
        // Potentially handle auth errors, maybe redirect to an error page
        return;
    }

    const isAuthPage = pathname === '/';
    const isClientPage = pathname.startsWith('/client');
    const isRestoPage = pathname.startsWith('/restaurant');

    if (session) {
      // User is logged in
      if (session.role === 'client' && !isClientPage) {
        router.replace('/client');
      } else if (session.role === 'resto' && !isRestoPage) {
        router.replace('/restaurant');
      }
    } else {
      // User is not logged in
      if (!isAuthPage) {
        router.replace('/');
      }
    }
  }, [session, isLoading, pathname, router, error]);

  // While loading session, show a full-screen loader to prevent content flash
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent rendering children if a redirect is likely to occur, avoids flashing pages
  const isAuthPage = pathname === '/';
  if (!session && !isAuthPage) return null; // Not logged in and not on auth page
  if (session?.role === 'client' && !pathname.startsWith('/client')) return null;
  if (session?.role === 'resto' && !pathname.startsWith('/restaurant')) return null;


  return <>{children}</>;
}
