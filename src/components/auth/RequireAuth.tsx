
import { useAuth, useUser } from '@clerk/clerk-react';
import { ReactNode, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    const redirectUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`/signin?redirect_url=${encodeURIComponent(redirectUrl)}`} replace />;
  }

  return <>{children}</>;
}
