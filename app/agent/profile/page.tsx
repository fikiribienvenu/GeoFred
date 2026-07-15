'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Save, CheckCircle, AlertCircle, Star, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { getProvinces, getDistricts, getSectors } from '@/lib/rwanda';
import type { Province } from '@/lib/rwanda';
import api from '@/lib/axios';

interface AgentProfile {
  province: string;
  district: string;
  sector: string;
  bio: string;
  rating: number;
  completedRequests: number;
  approvalStatus: string;
}

export default function AgentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AgentProfile>({
    province: '', district: '', sector: '',
    bio: '', rating: 0, completedRequests: 0, approvalStatus: 'approved',
  });
  const [form, setForm] = useState({ name: user?.name || '', phone: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const provinces = getProvinces();
  const districts = profile.province ? getDistricts(profile.province as Province) : [];
  const sectors = profile.province && profile.district
    ? getSectors(profile.province as Province, profile.district) : [];

  useEffect(() => {
    api.get('/api/agent/profile')
      .then(({ data }) => {
        setProfile(data.agent);
        setForm(p => ({ ...p, bio: data.agent.bio || '' }));
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.patch('/api/agent/profile', { bio: form.bio, phone: form.phone, name: form.name });
      setMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Agent Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your agent information</p>
      </div>

      {msg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-lg p-3 mb-5 text-sm ${
            msg.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
          {msg.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
          {msg.text}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Star, value: profile.rating.toFixed(1), label: 'Rating', color: 'text-yellow-500 bg-yellow-50' },
            { icon: ClipboardList, value: profile.completedRequests, label: 'Completed', color: 'text-green-600 bg-green-50' },
            { icon: MapPin, value: profile.approvalStatus, label: 'Status', color: 'text-primary bg-primary/10' },
          ].map(({ icon: Icon, value, label, color }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <div className={`w-9 h-9 rounded-xl ${color.split(' ')[1]} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`h-4 w-4 ${color.split(' ')[0]}`} />
                </div>
                <div className="font-black text-lg capitalize">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coverage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Service Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-xs text-muted-foreground mb-1">Province</div>
                <div className="font-bold text-sm">{profile.province || '—'}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-xs text-muted-foreground mb-1">District</div>
                <div className="font-bold text-sm">{profile.district || '—'}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-xs text-muted-foreground mb-1">Sector</div>
                <div className="font-bold text-sm">{profile.sector || '—'}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Contact admin to update your service area.</p>
          </CardContent>
        </Card>

        {/* Edit Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+250 7XX XXX XXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3} placeholder="Tell clients about your experience..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="terra" className="gap-2" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
