'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, UserCheck, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { getProvinces, getDistricts, getSectors } from '@/lib/rwanda';
import type { Province } from '@/lib/rwanda';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

const serviceTypes = [
  { value: 'land_survey', label: '🗺 Land Survey' },
  { value: 'topographic_survey', label: '📐 Topographic Survey' },
  { value: 'construction_permit', label: '🏗 Construction Permit Assistance' },
  { value: 'property_valuation', label: '📊 Property Valuation' },
  { value: 'building_construction', label: '🏢 Building Construction' },
  { value: 'parcel_rental', label: '🏡 Parcel Rental' },
  { value: 'land_sale', label: '🌱 Buy/Sell Land' },
  { value: 'building_sale', label: '🏠 Buy/Sell Building' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState({
    serviceType: '', province: '', district: '', sector: '',
    description: '', priority: 'medium',
    // Guest fields
    guestName: '', guestEmail: '', guestPhone: '',
    createAccount: false, password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    agentAssigned: boolean; message: string; isGuest?: boolean;
  } | null>(null);

  const provinces = getProvinces();
  const districts = form.province ? getDistricts(form.province as Province) : [];
  const sectors = form.province && form.district
    ? getSectors(form.province as Province, form.district) : [];

  const update = (key: string) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceType || !form.province || !form.district || !form.sector || !form.description) {
      setError('Please fill all required fields'); return;
    }
    // Guest validation
    if (!user && (!form.guestName || !form.guestEmail || !form.guestPhone)) {
      setError('Please provide your name, email and phone number'); return;
    }
    setError(''); setLoading(true);
    try {
      // If guest wants account, create it first
      if (!user && form.createAccount && form.password) {
        await axios.post('/api/auth/register', {
          name: form.guestName,
          email: form.guestEmail,
          phone: form.guestPhone,
          password: form.password,
        }).catch(() => {}); // ignore if email already exists
      }

      const payload: Record<string, unknown> = {
        serviceType: form.serviceType,
        province: form.province,
        district: form.district,
        sector: form.sector,
        description: form.description,
        priority: form.priority,
      };

      if (!user) {
        payload.guestName = form.guestName;
        payload.guestEmail = form.guestEmail;
        payload.guestPhone = form.guestPhone;
      }

      const { data } = await axios.post('/api/service-requests', payload);
      setResult({ agentAssigned: data.agentAssigned, message: data.message, isGuest: data.isGuest });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Failed to submit';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border shadow-sm">
          <div className={`w-20 h-20 ${result.agentAssigned ? 'bg-green-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {result.agentAssigned
              ? <UserCheck className="h-10 w-10 text-green-600" />
              : <CheckCircle2 className="h-10 w-10 text-orange-600" />}
          </div>
          <h2 className="text-xl font-black mb-3">Request Submitted!</h2>
          <p className="text-muted-foreground text-sm mb-6">{result.message}</p>
          {result.isGuest ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                📧 A confirmation email has been sent with agent contact details.
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/auth/register">
                  <Button variant="terra" size="sm" className="gap-1.5">
                    <UserPlus className="h-4 w-4" /> Create Account
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="sm">Back to Home</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/requests">
                <Button variant="terra">View My Requests</Button>
              </Link>
              <Button variant="outline" onClick={() => setResult(null)}>Submit Another</Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={user ? '/dashboard' : '/'}>
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black">Request a Service</h1>
          <p className="text-muted-foreground text-sm">
            {user
              ? "We'll match you with the nearest available agent."
              : "No account needed · Fill in your details and we'll connect you with an agent."}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Type */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold">Select Service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {serviceTypes.map(s => (
                <button key={s.value} type="button"
                  onClick={() => setForm(p => ({ ...p, serviceType: s.value }))}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    form.serviceType === s.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold">Property Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Province *</Label>
                <select value={form.province}
                  onChange={e => setForm(p => ({ ...p, province: e.target.value, district: '', sector: '' }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                  <option value="">Select Province</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>District *</Label>
                <select value={form.district}
                  onChange={e => setForm(p => ({ ...p, district: e.target.value, sector: '' }))}
                  disabled={!form.province}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" required>
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Sector *</Label>
                <select value={form.sector} onChange={update('sector')} disabled={!form.district}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" required>
                  <option value="">Select Sector</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold">Details</h2>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <textarea value={form.description} onChange={update('description')} rows={4} required
                placeholder="Describe your needs in detail..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <select value={form.priority} onChange={update('priority')}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High — Urgent</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Guest contact info — only shown when NOT logged in */}
        {!user && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold flex items-center gap-2">
                <span>Your Contact Information</span>
                <span className="text-xs font-normal text-muted-foreground bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border">No account needed</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input value={form.guestName} onChange={update('guestName')}
                    placeholder="Jean Pierre" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={form.guestEmail} onChange={update('guestEmail')}
                    placeholder="you@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone *</Label>
                  <Input type="tel" value={form.guestPhone} onChange={update('guestPhone')}
                    placeholder="+250 7XX XXX XXX" required />
                </div>
              </div>

              {/* Optional account creation */}
              <div className="border border-dashed border-border rounded-xl p-4 bg-white dark:bg-gray-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.createAccount}
                    onChange={e => setForm(p => ({ ...p, createAccount: e.target.checked }))}
                    className="mt-0.5 rounded" />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <UserPlus className="h-4 w-4 text-primary" />
                      Create a free account <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Track your requests, chat with agents, and save properties
                    </p>
                  </div>
                </label>
                {form.createAccount && (
                  <div className="mt-3 space-y-1.5">
                    <Label>Choose a Password</Label>
                    <Input type="password" placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={update('password')}
                      minLength={6} />
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">Login</Link>
              </p>
            </CardContent>
          </Card>
        )}

        <Button type="submit" variant="terra" size="lg" className="w-full gap-2" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  );
}
