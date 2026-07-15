'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProvinces, getDistricts, getSectors } from '@/lib/rwanda';
import type { Province } from '@/lib/rwanda';
import axios from 'axios'
import api from '@/lib/axios';

export default function AgentRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    nationalId: '', province: '', district: '', sector: '', bio: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const provinces = getProvinces();
  const districts = form.province ? getDistricts(form.province as Province) : [];
  const sectors = form.province && form.district ? getSectors(form.province as Province, form.district) : [];

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/agent-register', {
        name: form.name, email: form.email, phone: form.phone, password: form.password,
        nationalId: form.nationalId, province: form.province, district: form.district,
        sector: form.sector, bio: form.bio,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white dark:bg-gray-800 rounded-2xl p-10 max-w-md shadow-sm border">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black mb-3">Application Submitted!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your agent application is under review. You&apos;ll receive an email notification once an admin approves your account. This typically takes 1-2 business days.
          </p>
          <Link href="/auth/login">
            <Button variant="terra" className="w-full">Go to Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 py-16">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl terra-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserCheck className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black">Agent Registration</h1>
          <p className="text-muted-foreground text-sm mt-1">Join GeoFredE-Terra State as a certified agent</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full transition-all ${step >= s ? 'terra-gradient' : 'bg-gray-200 dark:bg-gray-700'}`} />
              <div className="text-xs text-center mt-1 text-muted-foreground">Step {s}: {s === 1 ? 'Personal Info' : 'Location'}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input placeholder="Jean Pierre Habimana" value={form.name} onChange={update('name')} required />
                </div>
                <div className="space-y-1.5">
                  <Label>National ID Number</Label>
                  <Input placeholder="1 XXXX X XXXXXXX X XX" value={form.nationalId} onChange={update('nationalId')} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input type="tel" placeholder="+250 7XX XXX XXX" value={form.phone} onChange={update('phone')} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={update('password')} required />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm Password</Label>
                  <Input type="password" placeholder="Re-enter password" value={form.confirm} onChange={update('confirm')} required />
                </div>
                <Button type="button" variant="terra" className="w-full" size="lg"
                  onClick={() => { if (!form.name || !form.email || !form.phone || !form.password || !form.nationalId) { setError('Please fill all fields'); return; } setError(''); setStep(2); }}>
                  Continue to Location
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Province</Label>
                  <select value={form.province} onChange={(e) => setForm((p) => ({ ...p, province: e.target.value, district: '', sector: '' }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                    <option value="">Select Province</option>
                    {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>District</Label>
                  <select value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value, sector: '' }))}
                    disabled={!form.province}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" required>
                    <option value="">Select District</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Sector</Label>
                  <select value={form.sector} onChange={update('sector')}
                    disabled={!form.district}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" required>
                    <option value="">Select Sector</option>
                    {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Brief Bio <span className="text-muted-foreground">(optional)</span></Label>
                  <textarea value={form.bio} onChange={update('bio')} rows={3} placeholder="Tell us about your experience..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" variant="terra" className="flex-1" size="lg" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
