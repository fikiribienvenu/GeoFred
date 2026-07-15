'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Heart, Eye, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import axios from 'axios';
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

// Placeholder data for when API isn't connected
const placeholderProperties: Property[] = [
  { _id: '1', title: 'Modern 3-Bedroom House in Kigali', type: 'house', category: 'sale', price: 45000000, district: 'Gasabo', sector: 'Remera', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'], bedrooms: 3, bathrooms: 2, status: 'available' },
  { _id: '2', title: 'Prime Land Plot - Huye District', type: 'land', category: 'sale', price: 8000000, district: 'Huye', sector: 'Ngoma', images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80'], plotSize: 1200, status: 'available' },
  { _id: '3', title: 'Luxury Apartment for Rent - Kimironko', type: 'apartment', category: 'rent', price: 450000, district: 'Gasabo', sector: 'Kimironko', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'], bedrooms: 2, bathrooms: 1, status: 'available' },
  { _id: '4', title: 'Commercial Space - Nyarugenge', type: 'commercial', category: 'rent', price: 1200000, district: 'Nyarugenge', sector: 'Kigali', images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80'], status: 'available' },
  { _id: '5', title: '5-Bedroom Villa with Garden', type: 'house', category: 'sale', price: 120000000, district: 'Kicukiro', sector: 'Gatenga', images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'], bedrooms: 5, bathrooms: 4, status: 'available' },
  { _id: '6', title: 'Fertile Agricultural Land', type: 'land', category: 'sale', price: 3500000, district: 'Muhanga', sector: 'Rongi', images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80'], plotSize: 5000, status: 'available' },
];

function PropertyCard({ property }: { property: Property }) {
  const [liked, setLiked] = useState(false);
  const isRent = property.category === 'rent';
  const isLand = property.type === 'land';

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow group">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={property.images[0] || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80'}
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
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-sm leading-tight line-clamp-2 flex-1 mr-2">{property.title}</h3>
          </div>
          <div className="text-primary font-black text-lg mb-3">
            {formatCurrency(property.price)}{isRent ? '/mo' : ''}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span>{property.sector}, {property.district}</span>
          </div>
          {!isLand && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-3">
              {property.bedrooms && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
              {property.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
            </div>
          )}
          {isLand && property.plotSize && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-3">
              <Square className="h-3 w-3" />{property.plotSize.toLocaleString()} sqm
            </div>
          )}
          <Link href={`/properties/${property._id}`}>
            <Button variant="outline" size="sm" className="w-full mt-3 gap-1.5 group-hover:border-primary group-hover:text-primary">
              <Eye className="h-3.5 w-3.5" /> View Details
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
  const [properties, setProperties] = useState<Property[]>(placeholderProperties);
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent'>('all');

  useEffect(() => {
    axios.get('/api/properties?limit=6')
      .then(({ data }) => { if (data.properties?.length > 0) setProperties(data.properties); })
      .catch(() => {});
  }, []);

  const filtered = activeTab === 'all' ? properties : properties.filter((p) => p.category === activeTab);

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-primary font-semibold text-sm tracking-wider uppercase">Latest Listings</span>
            <h2 className="text-3xl md:text-4xl font-black mt-1">Featured Properties</h2>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {(['all', 'sale', 'rent'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-muted-foreground'}`}>
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((property, i) => (
            <motion.div key={property._id} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
          className="text-center mt-10">
          <Link href="/properties">
            <Button variant="terra" size="lg" className="gap-2">
              View All Properties <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
