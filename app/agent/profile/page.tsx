'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Save, CheckCircle, AlertCircle, Star, ClipboardList, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import api from '@/lib/axios';
import Image from 'next/image';

interface AgentProfile {
  province: string;
  district: string;
  sector: string;
  bio: string;
  rating: number;
  completedRequests: number;
  approvalStatus: string;
  profileImage?: string;
}

export default function AgentProfilePage() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AgentProfile>({
    province: '', district: '', sector: '',
    bio: '', rating: 0, completedRequests: 0, approvalStatus: 'approved', profileImage: '',
  });
  const [form, setForm] = useState({ name: user?.name || '', phone: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api.get('/api/agent/profile')
      .then(({ data }) => {
        setProfile(data.agent);
        setForm(p => ({ ...p, bio: data.agent.bio || '' }));
        if (data.agent.profileImage) {
          setAvatarPreview(data.agent.profileImage);
        }
      })
      .catch(() => {});
  }, []);

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Image must be smaller than 5MB' });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary via API
    setUploading(true);
    setMsg(null);
    try {
      const base64 = await fileToBase64(file);
      const { data } = await api.post('/api/upload', {
        image: base64,
        folder: 'geofred-terra/agents',
      });

      // Save avatar URL to agent profile
      await api.patch('/api/agent/profile', { profileImage: data.url });
      setProfile(p => ({ ...p, profileImage: data.url }));
      setAvatarPreview(data.url);

      // Also update user avatar in auth context
      if (user) {
        const updatedUser = { ...user, avatar: data.url };
        setUser(updatedUser);
        localStorage.setItem('geofred_user', JSON.stringify(updatedUser));
      }

      setMsg({ type: 'success', text: 'Profile photo updated!' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to upload image. Try again.' });
      // Revert preview on failure
      setAvatarPreview(profile.profileImage || null);
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.patch('/api/agent/profile', {
        bio: form.bio,
        phone: form.phone,
        name: form.name,
      });
      // Update name in auth context
      if (user && form.name !== user.name) {
        const updatedUser = { ...user, name: form.name };
        setUser(updatedUser);
        localStorage.setItem('geofred_user', JSON.stringify(updatedUser));
      }
      setMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || 'A').charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Agent Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your profile and service area</p>
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

        {/* Avatar Upload Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile photo"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full terra-gradient flex items-center justify-center text-white text-3xl font-black">
                      {initials}
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                {/* Camera button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Camera className="h-4 w-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Info */}
              <div className="text-center sm:text-left">
                <h3 className="font-black text-xl">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-primary/10 rounded-full text-xs text-primary font-medium capitalize">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {profile.approvalStatus}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Click the camera icon to upload a new photo
                  <br /><span className="opacity-70">JPG, PNG or WebP · Max 5MB</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Star, value: Number(profile.rating).toFixed(1), label: 'Rating', colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50 dark:bg-yellow-950' },
            { icon: ClipboardList, value: profile.completedRequests, label: 'Completed', colorClass: 'text-green-600', bgClass: 'bg-green-50 dark:bg-green-950' },
            { icon: MapPin, value: profile.district || '—', label: 'District', colorClass: 'text-primary', bgClass: 'bg-primary/10' },
          ].map(({ icon: Icon, value, label, colorClass, bgClass }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <div className={`w-9 h-9 rounded-xl ${bgClass} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                </div>
                <div className="font-black text-base capitalize truncate">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Area */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Service Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Province', value: profile.province },
                { label: 'District', value: profile.district },
                { label: 'Sector', value: profile.sector },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className="font-bold text-sm">{value || '—'}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Contact admin to update your service area coverage.
            </p>
          </CardContent>
        </Card>

        {/* Personal Info Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+250 7XX XXX XXX"
                  type="tel"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  placeholder="Tell clients about your experience, specializations, and areas of expertise..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="terra" className="gap-2" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
