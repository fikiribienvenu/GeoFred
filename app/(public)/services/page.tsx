'use client';

import { motion } from 'framer-motion';
import { MapPin, BarChart3, FileCheck, Home, TrendingUp, Building2, Hammer, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const services = [
  {
    icon: MapPin, title: 'Land Survey', slug: 'land-survey',
    description: 'Our certified surveyors provide precise boundary measurements and legal land demarcation for any parcel in Rwanda.',
    features: ['GPS-accurate boundary mapping', 'Official survey certificates', 'RDB compliance', 'Dispute resolution support'],
    price: 'From RWF 150,000', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950', duration: '3–7 days',
  },
  {
    icon: BarChart3, title: 'Topographic Survey', slug: 'topographic-survey',
    description: 'Detailed 3D terrain mapping using modern equipment for construction planning, drainage design, and civil engineering projects.',
    features: ['High-resolution terrain models', 'Elevation contour maps', 'CAD-compatible outputs', 'Construction-ready reports'],
    price: 'From RWF 300,000', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', duration: '5–14 days',
  },
  {
    icon: FileCheck, title: 'Construction Permit', slug: 'construction-permit',
    description: 'Expert guidance through Rwanda\'s building permit process, ensuring compliance with local regulations and accelerating approvals.',
    features: ['Document preparation', 'Submission to RHA/RURA', 'Follow-up & updates', 'Appeals assistance'],
    price: 'From RWF 80,000', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', duration: '2–4 weeks',
  },
  {
    icon: Home, title: 'Parcel Rental', slug: 'parcel-rental',
    description: 'Flexible land and parcel rental services connecting landowners with tenants across all districts of Rwanda.',
    features: ['Market rate assessment', 'Contract drafting', 'Tenant screening', 'Ongoing management'],
    price: 'Commission-based', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950', duration: 'Ongoing',
  },
  {
    icon: TrendingUp, title: 'Buy & Sell Land', slug: 'land-sale',
    description: 'Complete land transaction services including due diligence, title verification, negotiation, and legal transfer.',
    features: ['Title & encumbrance check', 'Fair market valuation', 'Transfer facilitation', 'Notary coordination'],
    price: '2–3% commission', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', duration: 'Varies',
  },
  {
    icon: Building2, title: 'Buy & Sell Buildings', slug: 'building-sale',
    description: 'Full building sales service from listing to closing. We handle marketing, viewings, negotiations and paperwork.',
    features: ['Professional photography', 'Market listing', 'Buyer screening', 'Title transfer support'],
    price: '2–3% commission', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950', duration: '1–3 months',
  },
  {
    icon: Hammer, title: 'Building Construction', slug: 'building-construction',
    description: 'Managed construction services using qualified engineers and contractors, from foundation to finishing.',
    features: ['Design consultation', 'Qualified contractors', 'Project management', 'Quality inspections'],
    price: 'Quote-based', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950', duration: 'Project-based',
  },
  {
    icon: Star, title: 'Property Valuation', slug: 'property-valuation',
    description: 'Accurate certified valuations for any type of property for sale, mortgage, insurance, or tax purposes.',
    features: ['Certified valuers', 'Bank-accepted reports', 'Market comparison analysis', 'Official certificate'],
    price: 'From RWF 100,000', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950', duration: '2–5 days',
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="terra-gradient py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black mb-4">
            Our Services
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-white/80 text-lg max-w-2xl mx-auto">
            Comprehensive real estate and survey services delivered by certified professionals across Rwanda.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, i) => (
            <motion.div key={service.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="h-full card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center flex-shrink-0`}>
                      <service.icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-lg mb-1">{service.title}</h3>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{service.price}</span>
                        <span>·</span>
                        <span>{service.duration}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                  <ul className="space-y-1.5 mb-5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/dashboard/requests/new?service=${service.slug}`}>
                    <Button variant="terra" size="sm" className="gap-1.5">
                      Request Service <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-10">
          <h2 className="text-2xl font-black mb-3">Not Sure Which Service You Need?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Contact us and our team will help you identify the right service for your needs.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/contact">
              <Button variant="terra" size="lg">Contact Us</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Create Account</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
