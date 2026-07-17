'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { getProvinces, getDistricts, getSectors } from '@/lib/rwanda';
import type { Province } from '@/lib/rwanda';
import Link from 'next/link';
import api from '@/lib/axios';

export default function AgentNewPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', type: 'land', category: 'sale', price: '',
    province: '', district: '', sector: '',
    description: '', bedrooms: '', bathrooms: '',
    plotSize: '', plotSizeUnit: 'sqm', floorArea: '',
    contactName: '', contactPhone: '', contactEmail: '',
    images: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const provinces = getProvinces();
  const districts = form.province ? getDistricts(form.province as Province) : [];
  const sectors = form.province && form.district ? getSectors(form.province as Province, form.district) : [];

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.province || !form.district || !form.sector) {
      setError('Please fill all required fields'); return;
    }
    setLoading(true); setError('');
    try {
      await api.post('/api/properties', {
        ...form,
        price: parseInt(form.price),
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        plotSize: form.plotSize ? parseFloat(form.plotSize) : undefined,
        floorArea: form.floorArea ? parseFloat(form.floorArea) : undefined,
        contactInfo: { name: form.contactName, phone: form.contactPhone, email: form.contactEmail },
        published: true, // published immediately
      });
      setSuccess(true);
      setTimeout(() => router.push('/agent'), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Failed to submit property';
      setError(msg);
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Save className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-xl font-black mb-2">Property Published!</h2>
        <p className="text-muted-foreground text-sm">
          Your property is now live and visible to clients browsing the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/agent"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-black">Submit New Property</h1>
          <p className="text-muted-foreground text-sm">Property will be published immediately and visible to clients</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card><CardContent className="p-6 space-y-4">
          <h2 className="font-bold">Basic Information</h2>
          <div className="space-y-1.5">
            <Label>Property Title *</Label>
            <Input placeholder="e.g. Modern 3-Bedroom House in Kigali" value={form.title} onChange={update('title')} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <select value={form.type} onChange={update('type')} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="land">Land</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <select value={form.category} onChange={update('category')} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Price (RWF) *</Label>
              <Input type="number" placeholder="e.g. 50000000" value={form.price} onChange={update('price')} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <textarea value={form.description} onChange={update('description')} rows={4} required
              placeholder="Describe the property..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6 space-y-4">
          <h2 className="font-bold">Location</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Province *</Label>
              <select value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value, district: '', sector: '' }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
                <option value="">Select Province</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>District *</Label>
              <select value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value, sector: '' }))}
                disabled={!form.province} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" required>
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
        </CardContent></Card>

        {(form.type === 'house' || form.type === 'apartment') && (
          <Card><CardContent className="p-6 space-y-4">
            <h2 className="font-bold">Property Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5"><Label>Bedrooms</Label><Input type="number" min="0" value={form.bedrooms} onChange={update('bedrooms')} /></div>
              <div className="space-y-1.5"><Label>Bathrooms</Label><Input type="number" min="0" value={form.bathrooms} onChange={update('bathrooms')} /></div>
              <div className="space-y-1.5"><Label>Floor Area (sqm)</Label><Input type="number" min="0" value={form.floorArea} onChange={update('floorArea')} /></div>
            </div>
          </CardContent></Card>
        )}

        <Card><CardContent className="p-6 space-y-4">
          <h2 className="font-bold">Contact Information</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.contactName} onChange={update('contactName')} required /></div>
            <div className="space-y-1.5"><Label>Phone *</Label><Input type="tel" value={form.contactPhone} onChange={update('contactPhone')} required /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.contactEmail} onChange={update('contactEmail')} /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <h2 className="font-bold mb-4">Property Images</h2>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
            <Upload className="h-7 w-7 text-muted-foreground mb-1" />
            <span className="text-sm text-muted-foreground">Click to upload images</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
          {form.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>

        <div className="flex justify-end gap-3">
          <Link href="/agent"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" variant="terra" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Submitting...' : 'Submit Property'}
          </Button>
        </div>
      </form>
    </div>
  );
}
