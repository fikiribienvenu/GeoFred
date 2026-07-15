'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin, Bed, Bath, Square, Phone, Mail,
  Calendar, Eye, Heart, Share2, ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

interface Property {
  _id: string;
  title: string;
  type: string;
  category: string;
  price: number;
  province: string;
  district: string;
  sector: string;
  description: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  plotSize?: number;
  plotSizeUnit?: string;
  floorArea?: number;
  yearBuilt?: number;
  amenities?: string[];
  contactInfo: { name: string; phone: string; email?: string };
  status: string;
  views: number;
  createdAt: string;
}

const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    axios.get(`/api/properties/${id}`)
      .then(({ data }) => setProperty(data.property))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Property not found</h2>
        <Link href="/properties"><Button variant="terra">Browse Properties</Button></Link>
      </div>
    );
  }

  const images = property.images.length > 0 ? property.images : [FALLBACK];

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/properties"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Properties
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative h-80 md:h-[450px] rounded-2xl overflow-hidden mb-3">
              <Image src={images[activeImage]} alt={property.title} fill className="object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant={property.category === 'sale' ? 'success' : 'info'} className="capitalize">
                  {property.category === 'sale' ? 'For Sale' : 'For Rent'}
                </Badge>
                <Badge variant="secondary" className="capitalize">{property.type}</Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setLiked(!liked)}
                  className="w-9 h-9 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
                  <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                </button>
                <button onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}
                  className="w-9 h-9 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
                  <Share2 className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Price */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl md:text-3xl font-black mb-2">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <span className="text-2xl font-black text-primary">
                  {formatCurrency(property.price)}{property.category === 'rent' ? '/month' : ''}
                </span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.sector}, {property.district}, {property.province}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" /> {property.views} views
                </div>
              </div>

              {/* Quick specs */}
              {(property.bedrooms || property.bathrooms || property.plotSize || property.floorArea) && (
                <div className="flex flex-wrap gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-6">
                  {property.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-bold text-sm">{property.bedrooms}</div>
                        <div className="text-xs text-muted-foreground">Bedrooms</div>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-bold text-sm">{property.bathrooms}</div>
                        <div className="text-xs text-muted-foreground">Bathrooms</div>
                      </div>
                    </div>
                  )}
                  {property.parkingSpaces !== undefined && property.parkingSpaces > 0 && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-bold text-sm">{property.parkingSpaces}</div>
                        <div className="text-xs text-muted-foreground">Parking</div>
                      </div>
                    </div>
                  )}
                  {property.plotSize && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-bold text-sm">{property.plotSize.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{property.plotSizeUnit || 'sqm'}</div>
                      </div>
                    </div>
                  )}
                  {property.floorArea && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-bold text-sm">{property.floorArea}</div>
                        <div className="text-xs text-muted-foreground">Floor sqm</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-3">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-4">
                <Calendar className="h-3.5 w-3.5" /> Listed on {formatDate(property.createdAt)}
              </div>
            </motion.div>
          </div>

          {/* Right — Contact */}
          <div>
            <div className="sticky top-24 space-y-4">
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Contact Agent</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <div className="w-11 h-11 terra-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {property.contactInfo.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{property.contactInfo.name}</div>
                        <div className="text-xs text-muted-foreground">Property Agent</div>
                      </div>
                    </div>
                    <a href={`tel:${property.contactInfo.phone}`}>
                      <Button variant="terra" className="w-full gap-2 mb-2">
                        <Phone className="h-4 w-4" /> {property.contactInfo.phone}
                      </Button>
                    </a>
                    {property.contactInfo.email && (
                      <a href={`mailto:${property.contactInfo.email}`}>
                        <Button variant="outline" className="w-full gap-2">
                          <Mail className="h-4 w-4" /> Send Email
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed bg-primary/5">
                <CardContent className="p-5 text-center">
                  <div className="text-2xl mb-2">🏗</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Need a professional survey or valuation for this property?
                  </p>
                  <Link href="/dashboard/requests/new">
                    <Button variant="terra" size="sm" className="w-full">Request a Service</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h4 className="font-bold text-sm mb-3">Property Summary</h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Type', value: property.type },
                      { label: 'Category', value: property.category === 'sale' ? 'For Sale' : 'For Rent' },
                      { label: 'Status', value: property.status },
                      { label: 'Province', value: property.province },
                      { label: 'District', value: property.district },
                      { label: 'Sector', value: property.sector },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
