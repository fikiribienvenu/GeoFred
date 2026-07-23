'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bed, Bath, Square, Phone, Mail,
  Calendar, Eye, Heart, Share2, ArrowLeft,
  CheckCircle, MessageCircle, X, Send, UserPlus, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface AgentInfo {
  _id: string;
  userId: { name: string; email: string; phone: string };
  district: string;
  sector: string;
  rating: number;
  profileImage?: string | null;
  avatar?: string | null;
}

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
  amenities?: string[];
  contactInfo: { name: string; phone: string; email?: string };
  status: string;
  views: number;
  createdAt: string;
  assignedAgent?: AgentInfo | null;
}

const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

export default function PropertyDetailClient({ property }: { property: Property }) {
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '', email: '', phone: '', message: '',
    createAccount: false, password: '',
  });
  const [sending, setSending] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{
    success: boolean; message: string; agentPhone?: string; accountCreated?: boolean;
  } | null>(null);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`/api/properties/${property._id}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setInquiryResult({ success: true, message: data.message, agentPhone: data.agentPhone, accountCreated: data.accountCreated });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send inquiry';
      setInquiryResult({ success: false, message: msg });
    } finally {
      setSending(false);
    }
  };

  const images = property.images.length > 0 ? property.images : [FALLBACK];
  const agent = property.assignedAgent;
  const agentPhoto = agent?.profileImage || agent?.avatar || null;

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
          {/* Left — Images + Details */}
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
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}>
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
                  <MapPin className="h-4 w-4" />{property.sector}, {property.district}, {property.province}
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
                      <div><div className="font-bold text-sm">{property.bedrooms}</div><div className="text-xs text-muted-foreground">Bedrooms</div></div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <div><div className="font-bold text-sm">{property.bathrooms}</div><div className="text-xs text-muted-foreground">Bathrooms</div></div>
                    </div>
                  )}
                  {property.plotSize && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-primary" />
                      <div><div className="font-bold text-sm">{property.plotSize.toLocaleString()}</div><div className="text-xs text-muted-foreground">{property.plotSizeUnit || 'sqm'}</div></div>
                    </div>
                  )}
                  {property.floorArea && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-primary" />
                      <div><div className="font-bold text-sm">{property.floorArea}</div><div className="text-xs text-muted-foreground">Floor sqm</div></div>
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
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />{a}
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

          {/* Right — Agent + Contact */}
          <div>
            <div className="sticky top-24 space-y-4">

              {/* Assigned Agent Card */}
              {agent ? (
                <Card className="shadow-md border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 text-xs text-primary font-semibold mb-3 uppercase tracking-wide">
                      <User className="h-3.5 w-3.5" /> Assigned Agent
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        {agentPhoto ? (
                          <Image src={agentPhoto} alt={agent.userId?.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full terra-gradient flex items-center justify-center text-white font-black text-xl">
                            {agent.userId?.name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold">{agent.userId?.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{agent.sector}, {agent.district}
                        </div>
                        <div className="text-xs text-green-600 font-medium mt-0.5">● Available</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a href={`tel:${agent.userId?.phone}`}>
                        <Button variant="terra" className="w-full gap-2">
                          <Phone className="h-4 w-4" /> Call Agent
                        </Button>
                      </a>
                      {agent.userId?.email && (
                        <a href={`mailto:${agent.userId.email}?subject=Inquiry: ${property.title}`}>
                          <Button variant="outline" className="w-full gap-2">
                            <Mail className="h-4 w-4" /> Email Agent
                          </Button>
                        </a>
                      )}
                      {agent.userId?.phone && (
                        <button
                          onClick={() => {
                            const phone = agent.userId.phone.replace(/\D/g, '');
                            const text = encodeURIComponent(`Hi, I'm interested in: ${property.title} (${window.location.href})`);
                            window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                          }}
                          className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-green-200 text-green-600 hover:bg-green-50 text-sm font-medium transition-colors">
                          <MessageCircle className="h-4 w-4" /> WhatsApp Agent
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-3">Contact Agent</h3>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-3">
                      <div className="w-11 h-11 terra-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {property.contactInfo.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{property.contactInfo.name}</div>
                        <div className="text-xs text-muted-foreground">Property Agent</div>
                      </div>
                    </div>
                    <a href={`tel:${property.contactInfo.phone}`}>
                      <Button variant="terra" className="w-full gap-2">
                        <Phone className="h-4 w-4" /> {property.contactInfo.phone}
                      </Button>
                    </a>
                    {property.contactInfo.email && (
                      <a href={`mailto:${property.contactInfo.email}`}>
                        <Button variant="outline" className="w-full gap-2 mt-2">
                          <Mail className="h-4 w-4" /> Send Email
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Send Inquiry */}
              <Card className="border-dashed">
                <CardContent className="p-5">
                  <Button variant="terra" className="w-full gap-2" onClick={() => setShowInquiry(true)}>
                    <MessageCircle className="h-4 w-4" /> Send Inquiry
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    No account needed · Agent responds within 24h
                  </p>
                </CardContent>
              </Card>

              {/* Property Summary */}
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

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiry && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) { setShowInquiry(false); setInquiryResult(null); } }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-black text-lg">Send Inquiry</h3>
                    <p className="text-xs text-muted-foreground">No account needed</p>
                  </div>
                  <button onClick={() => { setShowInquiry(false); setInquiryResult(null); }}
                    className="p-2 rounded-full hover:bg-muted transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Property preview */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-5">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={images[0]} alt={property.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{property.title}</div>
                    <div className="text-xs text-primary font-bold">{formatCurrency(property.price)}</div>
                  </div>
                </div>

                {agent && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl mb-5 border border-primary/10">
                    <div className="w-8 h-8 terra-gradient rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {agent.userId?.name?.charAt(0)}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assigned agent: </span>
                      <span className="font-semibold">{agent.userId?.name}</span>
                    </div>
                  </div>
                )}

                {inquiryResult ? (
                  <div className="text-center py-6">
                    {inquiryResult.success ? (
                      <>
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="h-7 w-7 text-green-600" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Inquiry Sent!</h4>
                        <p className="text-sm text-muted-foreground mb-3">{inquiryResult.message}</p>
                        {inquiryResult.agentPhone && (
                          <a href={`tel:${inquiryResult.agentPhone}`}>
                            <Button variant="terra" size="sm" className="gap-2">
                              <Phone className="h-3.5 w-3.5" /> Call Agent Now
                            </Button>
                          </a>
                        )}
                        {inquiryResult.accountCreated && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                            ✅ Account created! <Link href="/auth/login" className="font-semibold underline">Login here</Link>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <X className="h-7 w-7 text-red-500" />
                        </div>
                        <h4 className="font-bold mb-2">Failed to Send</h4>
                        <p className="text-sm text-muted-foreground mb-4">{inquiryResult.message}</p>
                        <Button variant="outline" size="sm" onClick={() => setInquiryResult(null)}>Try Again</Button>
                      </>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleInquiry} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Full Name *</Label>
                        <Input placeholder="Your name" value={inquiryForm.name}
                          onChange={e => setInquiryForm(p => ({ ...p, name: e.target.value }))} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone *</Label>
                        <Input type="tel" placeholder="+250 7XX XXX XXX" value={inquiryForm.phone}
                          onChange={e => setInquiryForm(p => ({ ...p, phone: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input type="email" placeholder="you@example.com" value={inquiryForm.email}
                        onChange={e => setInquiryForm(p => ({ ...p, email: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Message *</Label>
                      <textarea value={inquiryForm.message}
                        onChange={e => setInquiryForm(p => ({ ...p, message: e.target.value }))}
                        rows={3} required placeholder="I'm interested in this property..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                    </div>

                    {/* Optional account creation */}
                    <div className="border border-dashed border-border rounded-xl p-4 bg-muted/30">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={inquiryForm.createAccount}
                          onChange={e => setInquiryForm(p => ({ ...p, createAccount: e.target.checked }))}
                          className="mt-0.5 rounded" />
                        <div>
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <UserPlus className="h-4 w-4 text-primary" />
                            Create a free account <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Track inquiries and chat with agents</p>
                        </div>
                      </label>
                      {inquiryForm.createAccount && (
                        <div className="mt-3 space-y-1.5">
                          <Label>Choose a Password</Label>
                          <Input type="password" placeholder="Min. 6 characters"
                            value={inquiryForm.password}
                            onChange={e => setInquiryForm(p => ({ ...p, password: e.target.value }))}
                            minLength={6} />
                        </div>
                      )}
                    </div>

                    <Button type="submit" variant="terra" className="w-full gap-2" disabled={sending}>
                      <Send className="h-4 w-4" />
                      {sending ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Already have an account?{' '}
                      <Link href="/auth/login" className="text-primary hover:underline">Login</Link>
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
