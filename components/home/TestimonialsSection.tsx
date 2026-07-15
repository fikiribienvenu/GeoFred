'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  { name: 'Claudette Mukamurenzi', role: 'Property Buyer', location: 'Kigali', rating: 5, text: 'GeoFredE-Terra State made buying my first home in Kigali incredibly smooth. The agent assigned to me was professional and knew the market perfectly.' },
  { name: 'Innocent Nshimiyimana', role: 'Land Owner', location: 'Huye', rating: 5, text: 'I needed a topographic survey for my land in Huye. The agent arrived within 2 days and the report was incredibly detailed. Excellent service!' },
  { name: 'Sandrine Uwayo', role: 'Business Owner', location: 'Musanze', rating: 5, text: 'The construction permit assistance saved me weeks of back-and-forth with authorities. Very knowledgeable team covering the Northern Province.' },
  { name: 'Pierre Habimana', role: 'Developer', location: 'Kigali', rating: 4, text: 'We use GeoFredE for all our property listings. The platform is fast, the team is responsive, and clients find us easily through their search.' },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-xl mx-auto mb-14">
          <span className="text-primary font-semibold text-sm tracking-wider uppercase">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">What Our Clients Say</h2>
          <p className="text-muted-foreground text-sm">Trusted by hundreds of property owners and buyers across Rwanda.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">{t.text}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role} · {t.location}</div>
                    </div>
                    <div className="flex">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
