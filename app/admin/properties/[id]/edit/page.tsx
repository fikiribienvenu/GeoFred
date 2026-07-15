'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { getProvinces, getDistricts, getSectors } from '@/lib/rwanda';
import type { Province } from '@/lib/rwanda';
import Link from 'next/link';
import axios from 'axios';

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', type: 'land', category: 'sale', price: '',
    province: '', district: '', sector: '',
    description: '', bedrooms: '', bathrooms: '', parkingSpaces: '',
    plotSize: '', plotSizeUnit: 'sqm', floorArea: '',
    contactName: '', contactPhone: '', contactEmail: '',
    images: [] as string[], published: false, status: 'available',
  });

  const provinces = getProvinces();
  const districts = form.province ? getDistricts(form.province as Province) : [];
  const sectors = form.province && form.district ? getSectors(form.province as Province, form.district) : [];

  useEffect(() => {
    axios.get(`/api/properties/${id}`)
      .then(({ data }) => {
        const p = data.property;
        setForm({
          title: p.title || '',
          type: p.type || 'land',
          category: p.category || 'sale',
          price: String(p.price || ''),
          province: p.province || '',
          district: p.district || '',
          sector: p.sector || '',
          description: p.description || '',
          bedrooms: String(p.bedrooms || ''),
          bathrooms: String(p.bathrooms || ''),
          parkingSpaces: String(p.parkingSpaces || ''),
          plotSize: String(p.plotSize || ''),
          plotSizeUnit: p.plotSizeUnit || 'sqm',
          floorArea: String(p.floorArea || ''),
          contactName: p.contactInfo?.name || '',
          contactPhone: p.contactInfo?.phone || '',
          contactEmail: p.contactInfo?.email || '',
          images: p.images || [],
          published: p.published || false,
          status: p.status || 'available',
        });
      })
      .catch(() => setError('Failed to load property'))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setForm(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.patch(`/api/properties/${id}`, {
        ...form,
        price: parseInt(form.price),
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        parkingSpaces: form.parkingSpaces ? parseInt(form.parkingSpaces) : undefined,
        plotSize: form.plotSize ? parseFloat(form.plotSize) : undefined,
        floorArea: form.floorArea ? parseFloat(form.floorArea) : undefined,
        contactInfo: { name: form.contactName, phone: form.contactPhone, email: form.contactEmail },
      });
      router.push('/admin/properties');
    } catch {
      setError('Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/properties">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black">Edit Property</h1>
          <p className="text-muted-foreground text-sm">Update property listing details</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold">Basic Information</h2>
            <div className="space-y-1.5">
              <Label>Property Title *</Label>
              <Input value={form.title} onChange={update('title')} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select value={form.type} onChange={update('type')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {['land','house','apartment','commercial'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select value={form.category} onChange={update('category')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select value={form.status} onChange={update('status')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {['available','sold','rented','pending'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Price (RWF) *</Label>
              <Input type="number" value={form.price} onChange={update('price')} required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea value={form.description} onChange={update('description')} rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold">Location</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Province</Label>
                <select value={form.province}
                  onChange={e => setForm(p => ({ ...p, province: e.target.value, district: '', sector: '' }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>District</Label>
                <select value={form.district}
                  onChange={e => setForm(p => ({ ...p, district: e.target.value, sector: '' }))}
                  disabled={!form.province}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="">Select</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Sector</Label>
                <select value={form.sector} onChange={update('sector')} disabled={!form.district}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="">Select</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {(form.type === 'house' || form.type === 'apartment') && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5"><Label>Bedrooms</Label><Input type="number" min="0" value={form.bedrooms} onChange={update('bedrooms')} /></div>
                <div className="space-y-1.5"><Label>Bathrooms</Label><Input type="number" min="0" value={form.bathrooms} onChange={update('bathrooms')} /></div>
                <div className="space-y-1.5"><Label>Parking</Label><Input type="number" min="0" value={form.parkingSpaces} onChange={update('parkingSpaces')} /></div>
                <div className="space-y-1.5"><Label>Floor Area (sqm)</Label><Input type="number" min="0" value={form.floorArea} onChange={update('floorArea')} /></div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold">Contact Information</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>Name</Label><Input value={form.contactName} onChange={update('contactName')} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.contactPhone} onChange={update('contactPhone')} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.contactEmail} onChange={update('contactEmail')} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-bold mb-4">Images</h2>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add more images</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
            {form.images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published}
              onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="rounded" />
            <span className="text-sm">Published (visible to public)</span>
          </label>
          <div className="flex-1" />
          <Link href="/admin/properties"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" variant="terra" className="gap-2" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Update Property'}
          </Button>
        </div>
      </form>
    </div>
  );
}
