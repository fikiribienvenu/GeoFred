'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Home, Layers, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProvinces, getDistricts } from '@/lib/rwanda';

const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1580746738099-1de1abe9a4e0?w=1920&q=80',
    label: 'City of Kigali, Rwanda',
  },
  {
    url: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=1920&q=80',
    label: 'Land Plot Ready to Build',
  },
  {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
    label: 'Construction in Progress',
  },
  {
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80',
    label: 'Finished Modern Villa',
  },
  {
    url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&q=80',
    label: 'Kigali Convention Centre',
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'buy' | 'rent' | 'service'>('buy');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const provinces = getProvinces();
  const districts = province ? getDistricts(province as Parameters<typeof getDistricts>[0]) : [];

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (searchType === 'service') {
      router.push(`/services?province=${province}&district=${district}`);
    } else {
      router.push(`/properties?category=${searchType === 'buy' ? 'sale' : 'rent'}&province=${province}&district=${district}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${SLIDES[currentSlide].url}')` }}
          />
        </AnimatePresence>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className="group flex flex-col items-center gap-1"
          >
            <span className={`block h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-primary' : 'w-3 bg-white/40 hover:bg-white/70'}`} />
          </button>
        ))}
      </div>

      {/* Slide label */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentSlide}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-white/60 text-xs font-medium tracking-widest uppercase"
          >
            {SLIDES[currentSlide].label}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-1.5 h-1.5 bg-primary/50 rounded-full"
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -25, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 3 + i * 0.7, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}
      </div>

      <div className="relative z-20 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Rwanda&apos;s #1 Real Estate Platform
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Find Your Perfect{' '}
            <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundImage: 'linear-gradient(to right, #fb923c, #ef4444)' }}>
              Property
            </span>
            {' '}in Rwanda
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Buy, sell, rent properties and access professional survey services across all provinces of Rwanda with GeoFredE-Terra State.
          </motion.p>

          {/* Search Box */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-6 max-w-3xl mx-auto">

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {[
                { value: 'buy', label: 'Buy', icon: Home },
                { value: 'rent', label: 'Rent', icon: Home },
                { value: 'service', label: 'Request Service', icon: Layers },
              ].map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setSearchType(value as typeof searchType)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    searchType === value ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select value={province} onChange={(e) => { setProvince(e.target.value); setDistrict(''); }}
                  className="w-full pl-9 pr-4 h-11 rounded-lg border border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select Province</option>
                  {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select value={district} onChange={(e) => setDistrict(e.target.value)}
                  disabled={!province}
                  className="w-full pl-9 pr-4 h-11 rounded-lg border border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
                  <option value="">Select District</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <Button onClick={handleSearch} variant="terra" className="h-11 w-full gap-2">
                <Search className="h-4 w-4" />
                {searchType === 'service' ? 'Find Agent' : 'Search Properties'}
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-10 text-white">
            {[
              { value: '500+', label: 'Properties Listed' },
              { value: '150+', label: 'Expert Agents' },
              { value: '30', label: 'Districts Covered' },
              { value: '1,200+', label: 'Happy Clients' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-primary">{value}</div>
                <div className="text-xs text-white/70">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 cursor-pointer"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </div>
    </section>
  );
}
