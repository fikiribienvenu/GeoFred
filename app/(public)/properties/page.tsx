'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Eye, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { getProvinces, getDistricts, getSectors } from '@/lib/rwanda';
import type { Province } from '@/lib/rwanda';
import Link from 'next/link';
import Image from 'next/image';

interface Property {
  _id: string;
  title: string;
  type: string;
  category: string;
  price: number;
  district: string;
  sector: string;
  province: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  plotSize?: number;
  status: string;
  description: string;
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    type: '', province: searchParams.get('province') || '',
    district: searchParams.get('district') || '',
    sector: '', minPrice: '', maxPrice: '', bedrooms: '', search: '',
  });

  const provinces = getProvinces();
  const districts = filters.province ? getDistricts(filters.province as Province) : [];
  const sectors = filters.province && filters.district ? getSectors(filters.province as Province, filters.district) : [];

  const fetchProperties = async (retries = 3) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/properties?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProperties(data.properties || []);
      setTotal(data.total || 0);
    } catch {
      if (retries > 1) {
        setTimeout(() => fetchProperties(retries - 1), 1500);
      } else {
        setProperties([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, [filters, page]);

  const updateFilter = (key: string, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', type: '', province: '', district: '', sector: '', minPrice: '', maxPrice: '', bedrooms: '', search: '' });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-gray-900 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-black text-white mb-2">Property Listings</h1>
          <p className="text-gray-400 text-sm">{total.toLocaleString()} properties available across Rwanda</p>
          {/* Search bar */}
          <div className="flex gap-3 mt-5 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-9 pr-4 h-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2"
              onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeFilterCount > 0 && <span className="w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Panel */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Filter Properties</h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-3.5 w-3.5 mr-1" />Clear all</Button>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Any</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Any</option>
                  <option value="land">Land</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Province</label>
                <select value={filters.province} onChange={(e) => { updateFilter('province', e.target.value); updateFilter('district', ''); updateFilter('sector', ''); }}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Any</option>
                  {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">District</label>
                <select value={filters.district} onChange={(e) => updateFilter('district', e.target.value)}
                  disabled={!filters.province}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
                  <option value="">Any</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Price (RWF)</label>
                <Input value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder="0" type="number" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Price (RWF)</label>
                <Input value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder="Any" type="number" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Bedrooms</label>
                <select value={filters.bedrooms} onChange={(e) => updateFilter('bedrooms', e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Any</option>
                  {[1,2,3,4,5].map((n) => <option key={n} value={String(n)}>{n}+</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground/30 text-8xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">No properties found</h3>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map((property, i) => (
              <motion.div key={property._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden group card-hover border-0 shadow-md">
                  <div className="relative h-48">
                    <Image src={property.images[0] || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&q=80'}
                      alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <Badge variant={property.category === 'sale' ? 'success' : 'info'} className="text-xs capitalize">{property.category}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{property.type}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm line-clamp-2 mb-1.5">{property.title}</h3>
                    <div className="text-primary font-black text-base mb-2">
                      {formatCurrency(property.price)}{property.category === 'rent' ? '/mo' : ''}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />{property.sector}, {property.district}
                    </div>
                    {property.bedrooms && (
                      <div className="flex gap-3 text-xs text-muted-foreground border-t pt-2.5 mb-3">
                        <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.bedrooms}</span>
                        {property.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
                      </div>
                    )}
                    {property.plotSize && (
                      <div className="flex gap-1 text-xs text-muted-foreground border-t pt-2.5 mb-3">
                        <Square className="h-3 w-3" />{property.plotSize.toLocaleString()} sqm
                      </div>
                    )}
                    <Link href={`/properties/${property._id}`}>
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs group-hover:border-primary group-hover:text-primary">
                        <Eye className="h-3 w-3" /> View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page}</span>
            <Button variant="outline" disabled={properties.length < 12} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>}>
      <PropertiesContent />
    </Suspense>
  );
}
