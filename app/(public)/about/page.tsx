'use client';

import { motion } from 'framer-motion';
import { Target, Eye, Users, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=60')" }} />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black mb-4">
            About GeoFredE-Terra State
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-white/80 text-lg max-w-2xl mx-auto">
            Rwanda&apos;s premier real estate and land survey management company, connecting clients with expert agents across the nation.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Mission / Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full border-0 shadow-md bg-primary/5 dark:bg-primary/10">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-black mb-3">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To simplify and digitize Rwanda&apos;s real estate and land survey ecosystem, providing transparent, efficient, and trustworthy services to every Rwandan — from urban Kigali to rural sectors across all five provinces.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-black mb-3">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be the most trusted real estate platform in East Africa, powered by certified agents in every sector and driven by technology that makes property transactions transparent, fast, and accessible to all.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
          <h2 className="text-2xl font-black text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: 'Integrity', desc: 'Honest and transparent in every transaction and interaction.', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: Award, title: 'Excellence', desc: 'Delivering the highest professional standards in all our services.', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Users, title: 'Community', desc: 'Building stronger communities through responsible property management.', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Target, title: 'Innovation', desc: 'Using technology to make real estate accessible to everyone.', color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((v) => (
              <Card key={v.title} className="text-center card-hover">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mx-auto mb-3`}>
                    <v.icon className={`h-6 w-6 ${v.color}`} />
                  </div>
                  <h3 className="font-bold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="terra-gradient rounded-2xl p-8 text-white text-center mb-16">
          <h2 className="text-2xl font-black mb-8">Our Impact in Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '5', label: 'Provinces Covered' },
              { value: '30+', label: 'Districts Served' },
              { value: '150+', label: 'Certified Agents' },
              { value: '1,200+', label: 'Happy Clients' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-black mb-1">{value}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-black mb-3">Ready to Work with Us?</h2>
          <p className="text-muted-foreground mb-6">Join our platform and experience Rwanda&apos;s best real estate services.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/register"><Button variant="terra" size="lg">Get Started</Button></Link>
            <Link href="/contact"><Button variant="outline" size="lg">Contact Us</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
