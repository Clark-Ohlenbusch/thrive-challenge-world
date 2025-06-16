
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { copy } from '@/lib/copy';
import { Link } from 'react-router-dom';
import { useAuth, useSignIn } from '@clerk/clerk-react';
import { Users, Target, Trophy } from 'lucide-react';

export default function Landing() {
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();

  const handleDemoLogin = async () => {
    try {
      await signIn?.create({
        identifier: "demo@demo.dev",
        password: "demo123"
      });
    } catch (error) {
      // If demo user doesn't exist, redirect to signup
      window.location.href = "/signup";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="font-bold text-xl">Challenge Hub</div>
        <div className="space-x-4">
          {isSignedIn ? (
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {copy.landing.hero.title}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {copy.landing.hero.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isSignedIn ? (
            <>
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/explore">{copy.landing.hero.ctaExplore}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/create">{copy.landing.hero.ctaCreate}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" onClick={handleDemoLogin}>
                Try Demo
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          {copy.landing.features.title}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {copy.landing.features.items.map((feature, index) => {
            const icons = [Users, Target, Trophy];
            const Icon = icons[index];
            
            return (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of people transforming their habits together.
        </p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link to={isSignedIn ? "/dashboard" : "/signup"}>
            {isSignedIn ? "Go to Dashboard" : "Get Started Today"}
          </Link>
        </Button>
      </section>
    </div>
  );
}
