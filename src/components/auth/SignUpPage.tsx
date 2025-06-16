
import { SignUp } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join Challenge Hub</h1>
          <p className="text-muted-foreground">Create your account and start your journey</p>
        </div>
        <SignUp
          afterSignUpUrl={redirectUrl}
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
