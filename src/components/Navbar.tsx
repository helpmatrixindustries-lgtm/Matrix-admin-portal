import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import matrixLogo from '@/assets/matrix-logo.png';
import { FileText, LogOut, LayoutDashboard, PlusCircle, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('matrix_admin_auth');
    navigate('/auth');
  };

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={matrixLogo} alt="Matrix Industries" className="h-10 w-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Matrix Industries</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/documents">
                <Button variant="ghost" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Documents
                </Button>
              </Link>
              <Link to="/create-document">
                <Button variant="default" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
