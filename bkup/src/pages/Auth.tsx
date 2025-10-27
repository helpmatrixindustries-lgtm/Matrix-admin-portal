import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import matrixLogo from '@/assets/matrix-logo.jpeg';

const ACCESS_CODE = 'MAI@0320';

const Auth = () => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated with Supabase
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (accessCode === ACCESS_CODE) {
        // Sign in with a predefined admin account
        // Using email/password auth with Supabase
        const adminEmail = 'admin@matrixindustries.in';
        const adminPassword = 'MAI@0320_SECURE_ADMIN_2024';

        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        if (error) {
          // If sign in fails, try to sign up (first time setup)
          const { error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
              data: {
                role: 'admin'
              }
            }
          });

          if (signUpError) {
            throw signUpError;
          }

          // After signup, sign in
          const { error: retrySignInError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword,
          });

          if (retrySignInError) {
            throw retrySignInError;
          }
        }

        localStorage.setItem('matrix_admin_auth', 'true');
        toast({
          title: 'Success',
          description: 'Access granted! Welcome to Matrix Admin Portal.',
        });
        navigate('/');
      } else {
        toast({
          title: 'Access Denied',
          description: 'Invalid access code. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message || 'Failed to authenticate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={matrixLogo} alt="Matrix Industries" className="h-16 w-16 rounded-xl object-cover" />
          </div>
          <div>
            <CardTitle className="text-2xl">Matrix Industries</CardTitle>
            <CardDescription>Admin Portal Access</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Enter admin access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Portal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
