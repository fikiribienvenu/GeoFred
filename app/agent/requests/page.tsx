'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, User, Calendar, CheckCircle, RefreshCw, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import api from '@/lib/axios';

interface Request {
  _id: string;
  serviceType: string;
  district: string;
  sector: string;
  province: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
  clientId?: { name: string; email: string; phone: string };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  isGuest?: boolean;
}

function getClientInfo(req: Request) {
  if (req.isGuest || !req.clientId) {
    return { name: req.guestName || 'Guest', email: req.guestEmail || '', phone: req.guestPhone || '', isGuest: true };
  }
  return { name: req.clientId.name, email: req.clientId.email, phone: req.clientId.phone, isGuest: false };
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' | 'secondary' }> = {
  pending:     { label: 'Pending',     variant: 'warning' },
  assigned:    { label: 'Assigned',    variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'info' },
  completed:   { label: 'Completed',   variant: 'success' },
  cancelled:   { label: 'Cancelled',   variant: 'destructive' },
};

export default function AgentRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/service-requests?limit=50');
      setRequests(data.requests || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/service-requests/${id}`, { status });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch { /* ignore */ }
  };

  const filtered = requests.filter(r => {
    const client = getClientInfo(r);
    const matchSearch = !search ||
      r.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      r.district.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-red-50 text-red-600' : p === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Assigned Requests</h1>
        <p className="text-muted-foreground text-sm">Service requests assigned to you</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search requests..." className="pl-9" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          {Object.entries(statusConfig).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <Button variant="outline" size="icon" onClick={fetchRequests}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => {
            const sc = statusConfig[req.status] || { label: req.status, variant: 'secondary' as const };
            const client = getClientInfo(req);
            const isExpanded = expanded === req._id;
            return (
              <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow overflow-hidden">
                  {/* Header — clickable to expand */}
                  <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : req._id)}>
                    <div className="flex flex-wrap items-start gap-4 justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-sm capitalize">
                            {req.serviceType.replace(/_/g, ' ')}
                          </span>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityColor(req.priority)}`}>
                            {req.priority}
                          </span>
                          {client.isGuest && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Guest</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{req.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />{client.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{req.sector}, {req.district}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{formatDate(req.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Full client info + actions */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border bg-muted/20 p-4 space-y-4">

                      {/* Client contact card */}
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                          Client Contact Information
                        </h4>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-semibold">{client.name}</span>
                            {client.isGuest && <span className="text-xs text-muted-foreground">(Guest)</span>}
                          </div>
                          {client.phone && (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                              <a href={`tel:${client.phone}`} className="text-primary hover:underline font-medium">
                                {client.phone}
                              </a>
                              <a href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${client.name}, I am your assigned agent for: ${req.serviceType.replace(/_/g, ' ')}`)}`}
                                target="_blank" rel="noreferrer"
                                className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" /> WhatsApp
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

                      {/* Location */}
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />{req.sector}, {req.district}, {req.province}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {req.status === 'assigned' && (
                          <Button size="sm" variant="terra" className="gap-1.5"
                            onClick={() => updateStatus(req._id, 'in_progress')}>
                            <Clock className="h-3.5 w-3.5" /> Start Work
                          </Button>
                        )}
                        {req.status === 'in_progress' && (
                          <Button size="sm" variant="outline" className="h-8 text-xs border-green-200 text-green-600 hover:bg-green-50"
                            onClick={() => updateStatus(req._id, 'completed')}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Complete
                          </Button>
                        )}
                        {!['completed', 'cancelled'].includes(req.status) && (
                          <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => updateStatus(req._id, 'cancelled')}>
                            Cancel
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
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
