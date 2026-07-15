'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, BarChart3, FileCheck, Home, TrendingUp, Building2, Hammer, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const services = [
  { icon: MapPin, title: 'Land Survey', desc: 'Precise boundary surveys and land measurements by certified professionals.', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  { icon: BarChart3, title: 'Topographic Survey', desc: 'Detailed 3D terrain mapping for construction and development projects.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
  { icon: FileCheck, title: 'Construction Permit', desc: 'Expert assistance with building permits and regulatory compliance.', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
  { icon: Home, title: 'Parcel Rental', desc: 'Flexible land and parcel rental services across all districts.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
  { icon: TrendingUp, title: 'Buy & Sell Land', desc: 'Complete land transaction services with legal documentation support.', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' },
  { icon: Building2, title: 'Buy & Sell Buildings', desc: 'Full building sales service including valuation and paperwork.', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950' },
  { icon: Hammer, title: 'Building Construction', desc: 'Professional construction services managed by qualified engineers.', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  { icon: Star, title: 'Property Valuation', desc: 'Accurate market valuations for any type of property in Rwanda.', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-primary font-semibold text-sm tracking-wider uppercase">What We Offer</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 mb-4">Our Professional Services</h2>
          <p className="text-muted-foreground">Comprehensive real estate and survey services tailored for Rwanda's growing market.</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <motion.div key={service.title} variants={item}>
              <Link href="/services">
                <Card className="card-hover cursor-pointer group h-full border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <service.icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <h3 className="font-bold text-base mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}
          className="text-center mt-10">
          <Link href="/services">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 terra-gradient text-white px-8 py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow">
              View All Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
