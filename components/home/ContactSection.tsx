'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section ref={ref} id="contact" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-xl mx-auto mb-14">
          <span className="text-primary font-semibold text-sm tracking-wider uppercase">Get In Touch</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">Contact GeoFredE-Terra State</h2>
          <p className="text-muted-foreground text-sm">Our team is ready to help you with any questions or service requests.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Info */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} className="space-y-6">
            {[
              { icon: MapPin, title: 'Office Address', lines: ['KG 123 St, Gasabo District', 'Kigali, Rwanda'] },
              { icon: Phone, title: 'Phone Number', lines: ['+250 788 000 000', '+250 722 000 000'] },
              { icon: Mail, title: 'Email Address', lines: ['info@geofred.com', 'support@geofred.com'] },
              { icon: Clock, title: 'Working Hours', lines: ['Mon – Fri: 8:00 AM – 6:00 PM', 'Sat: 9:00 AM – 3:00 PM'] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1">{title}</div>
                  {lines.map((l) => <div key={l} className="text-sm text-muted-foreground">{l}</div>)}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                {sent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-7 w-7 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Message Sent!</h3>
                    <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="fname">First Name</Label>
                        <Input id="fname" placeholder="Jean" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lname">Last Name</Label>
                        <Input id="lname" placeholder="Pierre" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="+250 7XX XXX XXX" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message</Label>
                      <textarea id="message" required rows={4} placeholder="Tell us how we can help..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                    </div>
                    <Button type="submit" variant="terra" className="w-full gap-2" disabled={sending}>
                      {sending ? 'Sending...' : <><Send className="h-4 w-4" /> Send Message</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
