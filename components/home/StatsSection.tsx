'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Home, Users, MapPin, Award } from 'lucide-react';

const stats = [
  { icon: Home, value: '500+', label: 'Properties Listed', desc: 'Across all provinces' },
  { icon: Users, value: '150+', label: 'Expert Agents', desc: 'In all major districts' },
  { icon: MapPin, value: '30', label: 'Districts Covered', desc: 'Nationwide coverage' },
  { icon: Award, value: '1,200+', label: 'Satisfied Clients', desc: 'And growing daily' },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-16 terra-gradient">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center text-white">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
              <div className="font-semibold text-sm mb-0.5">{stat.label}</div>
              <div className="text-xs text-white/70">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
