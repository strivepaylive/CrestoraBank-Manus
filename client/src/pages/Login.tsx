import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const authenticate = trpc.login.authenticate.useMutation();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const utils = trpc.useUtils();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (meQuery.data) {
      setLocation('/dashboard');
    }
  }, [meQuery.data, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await authenticate.mutateAsync({ username, password });
      if (result.success) {
        // Hard redirect so the new session cookie is picked up on a fresh page load
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      if (error.data?.code === 'FORBIDDEN') {
        toast.error('We have sent you a message on your email. Once account is approved, please retry to log in again.');
      } else {
        toast.error('Invalid username or password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <a href="/" className="inline-block mb-3">
              <div className="flex justify-center"><BrandLogo size="lg" /></div>
            </a>
            <p className="text-slate-600">Sign In to Your Account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={authenticate.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {authenticate.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 space-y-3 text-center text-sm text-slate-600">
            <div>
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create one
              </a>
            </div>
            <div>
              <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold">
                Forgot password?
              </a>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
              <p>Crestora Bank Headquarters</p>
              <p>120 Wall Street, New York, NY 10005, United States</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
