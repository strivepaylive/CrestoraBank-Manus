import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Lock, User } from 'lucide-react';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Admin login successful');
        // Store admin session in localStorage
        localStorage.setItem('admin_session', JSON.stringify({
          authenticated: true,
          username: username,
          timestamp: Date.now()
        }));
        // Redirect to admin dashboard
        setLocation('/admin-dashboard');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><BrandLogo size="lg" /></div>
            <p className="text-slate-600 mt-2 font-semibold">Admin Portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <Label htmlFor="username" className="text-slate-700 font-semibold">
                <div className="flex items-center gap-2 mb-2">
                  <User size={18} className="text-blue-600" />
                  Admin Username
                </div>
              </Label>
              <Input
                id="username"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-slate-300 focus:border-blue-600"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-slate-700 font-semibold">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={18} className="text-blue-600" />
                  Password
                </div>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-slate-300 focus:border-blue-600"
                disabled={isLoading}
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {isLoading ? 'Logging in...' : 'Login to Admin Panel'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-600">
              Back to <a href="/" className="text-blue-600 hover:underline font-semibold">home</a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
