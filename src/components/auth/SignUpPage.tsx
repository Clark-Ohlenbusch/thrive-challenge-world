
import { SignUp } from '@clerk/clerk-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join Challenge Hub</h1>
          <p className="text-muted-foreground">Create your account and start your journey</p>
        </div>
        <SignUp
          forceRedirectUrl={redirectUrl}
          signInUrl="/signin"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
        />
      </div>
    </div>
  );
}
