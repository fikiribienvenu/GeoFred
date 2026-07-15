'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 terra-gradient relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center text-white max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to Find Your Dream Property?</h2>
          <p className="text-white/80 text-lg mb-10">Join thousands of Rwandans who trust GeoFredE-Terra State for all their real estate and survey needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="xl" variant="outline" className="bg-white text-primary border-white hover:bg-white/90 hover:text-primary gap-2">
                <Search className="h-5 w-5" /> Browse Properties
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="xl" className="bg-white/20 hover:bg-white/30 border border-white/40 text-white gap-2">
                <UserPlus className="h-5 w-5" /> Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
