'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Heart, Eye, ArrowRight, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
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
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  plotSize?: number;
  status: string;
}

function PropertyCard({ property }: { property: Property }) {
  const [liked, setLiked] = useState(false);
  const isRent = property.category === 'rent';
  const isLand = property.type === 'land';

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow group">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={isRent ? 'info' : 'success'}>{isRent ? 'For Rent' : 'For Sale'}</Badge>
            <Badge variant="secondary" className="capitalize">{property.type}</Badge>
          </div>
          <button onClick={() => setLiked(!liked)}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        <CardContent className="p-4">
          <h3 className="font-bold text-sm line-clamp-2 mb-1.5">{property.title}</h3>
          <div className="text-primary font-black text-base mb-2">
            {formatCurrency(property.price)}{isRent ? '/mo' : ''}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" />{property.sector}, {property.district}
          </div>
          {!isLand && (property.bedrooms || property.bathrooms) && (
            <div className="flex gap-3 text-xs text-muted-foreground border-t pt-2.5 mb-3">
              {property.bedrooms && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
              {property.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
            </div>
          )}
          {isLand && property.plotSize && (
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
  );
}

export default function FeaturedProperties() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent'>('all');

  useEffect(() => {
    const fetchWithRetry = async (retries = 3) => {
      try {
        const res = await fetch('/api/properties?limit=6', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setProperties(data.properties || []);
      } catch {
        if (retries > 1) setTimeout(() => fetchWithRetry(retries - 1), 1500);
        else setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWithRetry();
  }, []);

  const filtered = activeTab === 'all'
    ? properties
    : properties.filter(p => p.category === activeTab);

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-primary font-semibold text-sm tracking-wider uppercase">Latest Listings</span>
            <h2 className="text-3xl md:text-4xl font-black mt-1">Featured Properties</h2>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {(['all', 'sale', 'rent'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-muted-foreground'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state — no placeholder data */
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-black mb-2">No Properties Listed Yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Be the first to list a property on GeoFredE-Terra State.
              Agents can submit properties directly from their dashboard.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/auth/agent-register">
                <Button variant="terra" size="sm">Register as Agent</Button>
              </Link>
              <Link href="/properties">
                <Button variant="outline" size="sm">Browse All</Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 6).map((property, i) => (
              <motion.div key={property._id}
                initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }} className="text-center mt-10">
            <Link href="/properties">
              <Button variant="terra" size="lg" className="gap-2">
                View All Properties <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
