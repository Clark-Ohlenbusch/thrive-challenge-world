
import { useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DemoPage() {
  const { signIn } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
      return;
    }

    const attemptDemoLogin = async () => {
      try {
        await signIn?.create({
          identifier: "demo@demo.dev",
          password: "demo123"
        });
      } catch (error) {
        console.error('Demo login failed:', error);
        // If demo user doesn't exist, redirect to signup
        navigate('/signup?demo=true');
      }
    };

    attemptDemoLogin();
  }, [signIn, isSignedIn, navigate]);

  return (
    <Layout showNav={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Logging you in...</h2>
            <p className="text-muted-foreground">
              Setting up your demo account
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
