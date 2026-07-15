'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import api from '@/lib/axios';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const { data } = await api.patch('/api/user/profile', { name: form.name, phone: form.phone });
      if (user) setUser({ ...user, name: data.name });
      localStorage.setItem('geofred_user', JSON.stringify({ ...user, name: data.name }));
      setMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await api.patch('/api/user/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setMsg({ type: 'success', text: 'Password changed successfully' });
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to change password';
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">My Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your account information</p>
      </div>

      {msg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-lg p-3 mb-5 text-sm ${
            msg.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
          {msg.type === 'success'
            ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
            : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
          {msg.text}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full terra-gradient flex items-center justify-center text-white text-3xl font-black shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-gray-800 border border-border rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
                  <Camera className="h-3.5 w-3.5 text-primary" />
                </button>
              </div>
              <div>
                <div className="font-bold text-lg">{user?.name}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
                <div className="text-xs mt-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block capitalize">{user?.role}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={update('name')} placeholder="Your full name" />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={user?.email || ''} disabled className="pl-9 opacity-60" />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={form.phone} onChange={update('phone')} placeholder="+250 7XX XXX XXX" className="pl-9" />
                </div>
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

        {/* Password */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <Input type="password" value={form.currentPassword} onChange={update('currentPassword')} placeholder="Enter current password" required />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" value={form.newPassword} onChange={update('newPassword')} placeholder="Min. 6 characters" required />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Re-enter new password" required />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="outline" className="gap-2" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
