'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, Clock, Star, MapPin, Phone, Mail, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatDate } from '@/lib/utils';
import api from '@/lib/axios';

interface Request {
  _id: string;
  serviceType: string;
  province: string;
  district: string;
  sector: string;
  status: string;
  createdAt: string;
  description: string;
  priority: string;
  // Registered client
  clientId?: { name: string; email: string; phone: string };
  // Guest client
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  isGuest?: boolean;
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/service-requests?limit=10')
      .then(({ data }) => setRequests(data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    assigned: requests.filter(r => r.status === 'assigned').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    total: requests.length,
  };

  const getClientInfo = (req: Request) => {
    if (req.isGuest || !req.clientId) {
      return {
        name: req.guestName || 'Guest',
        email: req.guestEmail || '',
        phone: req.guestPhone || '',
        isGuest: true,
      };
    }
    return {
      name: req.clientId.name,
      email: req.clientId.email,
      phone: req.clientId.phone,
      isGuest: false,
    };
  };

  const statusBadge = (status: string) => {
    const map: Record<string, 'warning' | 'info' | 'success' | 'destructive'> = {
      assigned: 'warning', in_progress: 'info', completed: 'success', cancelled: 'destructive',
    };
    return <Badge variant={map[status] || 'secondary'} className="capitalize">{status.replace('_', ' ')}</Badge>;
  };

  const priorityColor = (p: string) =>
    p === 'high' ? 'text-red-600 bg-red-50' : p === 'medium' ? 'text-orange-500 bg-orange-50' : 'text-green-600 bg-green-50';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Welcome, Agent {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-sm">Here&apos;s an overview of your assigned service requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Assigned', value: counts.assigned, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'In Progress', value: counts.inProgress, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: counts.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total', value: counts.total, icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className="text-2xl font-black">{card.value}</div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Requests with full client info */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Assigned Service Requests</CardTitle>
          <Link href="/agent/requests"><Button variant="ghost" size="sm" className="gap-1">View all <ArrowRight className="h-3 w-3" /></Button></Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-20" />
              No requests assigned yet
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => {
                const client = getClientInfo(req);
                const isExpanded = expanded === req._id;
                return (
                  <motion.div key={req._id} layout className="border border-border rounded-xl overflow-hidden">
                    {/* Request header */}
                    <div
                      className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpanded(isExpanded ? null : req._id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-bold text-sm capitalize">{req.serviceType.replace(/_/g, ' ')}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(req.priority)}`}>
                            {req.priority}
                          </span>
                          {client.isGuest && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Guest</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />{client.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{req.sector}, {req.district}
                          </span>
                          <span>{formatDate(req.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {statusBadge(req.status)}
                        <span className="text-xs text-muted-foreground">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expanded: Full client info + description */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border bg-muted/20 p-4 space-y-4">

                        {/* Client contact info */}
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                            Client Information
                          </h4>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="font-semibold">{client.name}</span>
                              {client.isGuest && <span className="text-xs text-muted-foreground">(Guest user)</span>}
                            </div>
                            {client.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                                <a href={`tel:${client.phone}`} className="text-primary hover:underline font-medium">
                                  {client.phone}
                                </a>
                                <a
                                  href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=Hello ${client.name}, I am your assigned agent for your ${req.serviceType.replace(/_/g, ' ')} request.`}
                                  target="_blank" rel="noreferrer"
                                  className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                                  WhatsApp
                                </a>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                                <a href={`mailto:${client.email}?subject=Your ${req.serviceType.replace(/_/g, ' ')} Request`}
                                  className="text-primary hover:underline">
                                  {client.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Request details */}
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                            Request Details
                          </h4>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-20 flex-shrink-0">Location</span>
                              <span>{req.sector}, {req.district}, {req.province}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-20 flex-shrink-0">Description</span>
                              <span className="text-gray-700 dark:text-gray-300">{req.description}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {req.status === 'assigned' && (
                            <Button size="sm" variant="terra" className="gap-1.5"
                              onClick={async () => {
                                await api.patch(`/api/service-requests/${req._id}`, { status: 'in_progress' });
                                setRequests(prev => prev.map(r => r._id === req._id ? { ...r, status: 'in_progress' } : r));
                              }}>
                              <Clock className="h-3.5 w-3.5" /> Start Service
                            </Button>
                          )}
                          {req.status === 'in_progress' && (
                            <Button size="sm" variant="outline" className="gap-1.5 border-green-200 text-green-600 hover:bg-green-50"
                              onClick={async () => {
                                await api.patch(`/api/service-requests/${req._id}`, { status: 'completed' });
                                setRequests(prev => prev.map(r => r._id === req._id ? { ...r, status: 'completed' } : r));
                              }}>
                              <CheckCircle className="h-3.5 w-3.5" /> Mark Complete
                            </Button>
                          )}
                          {client.phone && (
                            <a href={`tel:${client.phone}`}>
                              <Button size="sm" variant="outline" className="gap-1.5">
                                <Phone className="h-3.5 w-3.5" /> Call Client
                              </Button>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
