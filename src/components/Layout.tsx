
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserButton, useAuth } from '@clerk/clerk-react';
import { copy } from '@/lib/copy';
import { Home, Compass, Plus, Settings, Crown } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  const location = useLocation();
  const { isSignedIn } = useAuth();

  const navItems = [
    { icon: Home, label: copy.nav.dashboard, path: '/dashboard' },
    { icon: Compass, label: copy.nav.explore, path: '/explore' },
    { icon: Plus, label: copy.nav.create, path: '/create' },
    { icon: Settings, label: copy.nav.settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {showNav && (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link to={isSignedIn ? "/dashboard" : "/"} className="font-bold text-xl">
              Challenge Hub
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              {isSignedIn && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <Button asChild size="sm">
                    <Link to="/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Challenge
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/pro">
                      <Crown className="h-4 w-4 mr-2" />
                      {copy.nav.pro}
                    </Link>
                  </Button>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8"
                      }
                    }}
                  />
                </div>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/signin">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              {isSignedIn ? (
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
              ) : (
                <Button asChild size="sm">
                  <Link to="/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {showNav && isSignedIn && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
          <div className="grid grid-cols-5 h-16">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
            <Link
              to="/pro"
              className="flex flex-col items-center justify-center space-y-1 text-muted-foreground"
            >
              <Crown className="h-4 w-4" />
              <span className="text-xs">Pro</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
