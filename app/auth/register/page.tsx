'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/AuthProvider';
import axios from 'axios'
import api from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', {
        name: form.name, email: form.email, phone: form.phone, password: form.password,
      });
      setUser(data.user);
      localStorage.setItem('geofred_user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('geofred_token', data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const pw = form.password;
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Too short', color: 'bg-red-400' };
    if (pw.length < 8 || !/\d/.test(pw)) return { label: 'Weak', color: 'bg-orange-400' };
    if (/[A-Z]/.test(pw) && /\d/.test(pw)) return { label: 'Strong', color: 'bg-green-400' };
    return { label: 'Good', color: 'bg-blue-400' };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl terra-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-black text-2xl">G</span>
          </div>
          <h1 className="text-2xl font-black">Create Your Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join GeoFredE-Terra State — Rwanda&apos;s top real estate platform</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 text-red-700 dark:text-red-400 rounded-lg p-3 mb-5 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="Jean Pierre Habimana" value={form.name} onChange={update('name')} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="+250 7XX XXX XXX" value={form.phone} onChange={update('phone')} required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={update('password')} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {strength && (
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-1.5 flex-1 rounded-full ${strength.color}`} />
                  <span className="text-xs text-muted-foreground">{strength.label}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input type="password" placeholder="Re-enter your password" value={form.confirm} onChange={update('confirm')} required />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <Button type="submit" variant="terra" className="w-full gap-2" size="lg" disabled={loading}>
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </p>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-primary">← Back to Homepage</Link>
        </p>
      </motion.div>
    </div>
  );
}
