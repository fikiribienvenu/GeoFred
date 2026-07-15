'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, Globe, GlobeLock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';

interface Property {
  _id: string;
  title: string;
  type: string;
  category: string;
  price: number;
  district: string;
  sector: string;
  images: string[];
  status: string;
  published: boolean;
  createdAt: string;
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (typeFilter) params.set('type', typeFilter);
      // Use admin endpoint to get ALL properties (published + unpublished)
      const { data } = await api.get(`/api/admin/properties?${params}`);
      setProperties(data.properties || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, [typeFilter]);

  const handlePublishToggle = async (id: string, published: boolean) => {
    try {
      await api.patch(`/api/properties/${id}`, { published: !published });
      setProperties((prev) => prev.map((p) => p._id === id ? { ...p, published: !p.published } : p));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    try {
      await api.delete(`/api/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch { /* ignore */ }
  };

  const filtered = properties.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Properties</h1>
          <p className="text-muted-foreground text-sm">Manage property listings</p>
        </div>
        <Link href="/admin/properties/new">
          <Button variant="terra" className="gap-2"><Plus className="h-4 w-4" /> Add Property</Button>
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search properties..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Types</option>
          <option value="land">Land</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Building2Icon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            No properties found
          </div>
        ) : filtered.map((property) => (
          <motion.div key={property._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden">
              <div className="relative h-40">
                <Image
                  src={property.images[0] || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80'}
                  alt={property.title} fill className="object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <Badge variant={property.category === 'sale' ? 'success' : 'info'} className="text-xs">{property.category}</Badge>
                  <Badge variant={property.published ? 'success' : 'secondary'} className="text-xs">{property.published ? 'Live' : 'Draft'}</Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-bold text-sm line-clamp-1 mb-1">{property.title}</h3>
                <div className="text-primary font-bold text-sm mb-2">{formatCurrency(property.price)}</div>
                <div className="text-xs text-muted-foreground mb-3">{property.sector}, {property.district}</div>
                <div className="flex gap-1.5">
                  <Link href={`/properties/${property._id}`}>
                    <Button size="sm" variant="outline" className="h-7 px-2"><Eye className="h-3 w-3" /></Button>
                  </Link>
                  <Link href={`/admin/properties/${property._id}/edit`}>
                    <Button size="sm" variant="outline" className="h-7 px-2"><Edit className="h-3 w-3" /></Button>
                  </Link>
                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => handlePublishToggle(property._id, property.published)}>
                    {property.published ? <GlobeLock className="h-3 w-3 text-orange-500" /> : <Globe className="h-3 w-3 text-green-500" />}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-red-500 hover:text-red-600" onClick={() => handleDelete(property._id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Building2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
