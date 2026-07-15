'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios'
import api from '@/lib/axios';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Reset failed. The link may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-2">Invalid Reset Link</h3>
        <p className="text-sm text-muted-foreground mb-4">This link is invalid or has expired.</p>
        <Link href="/auth/forgot-password"><Button variant="terra">Request New Link</Button></Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-2">Password Reset!</h3>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label>New Password</Label>
        <div className="relative">
          <Input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
            value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Confirm New Password</Label>
        <Input type="password" placeholder="Re-enter password"
          value={form.confirm} onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))} required />
      </div>
      <Button type="submit" variant="terra" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl terra-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyRound className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your new password below.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-8">
          <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
