'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, MapPin, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from 'axios';

interface AgentCard {
  _id: string;
  name: string;
  district: string;
  sector: string;
  rating: number;
  completedRequests: number;
  province: string;
}

export default function AgentNetworkSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [stats, setStats] = useState({ total: 0, districts: 0, rating: '4.8' });

  useEffect(() => {
    axios.get('/api/agents/featured')
      .then(({ data }) => {
        setAgents(data.agents || []);
        setStats(data.stats || { total: 0, districts: 0, rating: '4.8' });
      })
      .catch(() => {
        // No agents yet — show empty state
        setAgents([]);
      });
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="text-primary font-semibold text-sm tracking-wider uppercase">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-5">Rwanda-Wide Agent Network</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              GeoFredE-Terra State has a network of certified agents covering all major districts and sectors across Rwanda. Every agent is verified, trained, and assigned to serve specific geographic areas.
            </p>

            <div className="space-y-3 mb-8">
              {[
                'Agents cover all 5 provinces and 30 districts',
                'Smart matching assigns you the nearest agent automatically',
                'Every agent undergoes rigorous vetting and approval',
                'Real-time communication between clients and agents',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              {[
                { icon: Users, value: stats.total > 0 ? `${stats.total}+` : '0', label: 'Active Agents' },
                { icon: MapPin, value: stats.districts > 0 ? `${stats.districts}` : '0', label: 'Districts' },
                { icon: Star, value: stats.rating, label: 'Avg. Rating' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-black text-lg leading-none">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/auth/agent-register">
              <Button variant="terra" size="lg">Become an Agent</Button>
            </Link>
          </motion.div>

          {/* Right: Real agents from DB */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4">
            {agents.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
                <div className="text-4xl mb-3">👷</div>
                <h3 className="font-bold text-lg mb-2">Agents Coming Soon</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first certified agent in your district.
                </p>
                <Link href="/auth/agent-register">
                  <Button variant="terra" size="sm">Register as Agent</Button>
                </Link>
              </div>
            ) : (
              agents.map((agent, i) => (
                <motion.div
                  key={agent._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                  {/* Avatar with initials */}
                  <div className="w-14 h-14 rounded-full terra-gradient flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                    {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{agent.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {agent.sector}, {agent.district}
                    </div>
                    <div className="text-xs text-muted-foreground">{agent.province}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-yellow-500" />
                      {agent.rating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-muted-foreground">{agent.completedRequests || 0} done</div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
