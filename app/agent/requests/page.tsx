'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, User, Calendar, CheckCircle, RefreshCw } from 'lucide-react';
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
  status: string;
  priority: string;
  description: string;
  createdAt: string;
  clientId: { name: string; email: string; phone: string };
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
    const matchSearch = !search ||
      r.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      r.clientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
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
            return (
              <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
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
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{req.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {req.clientId?.name} · {req.clientId?.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{req.sector}, {req.district}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{formatDate(req.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {req.status === 'assigned' && (
                          <Button size="sm" variant="outline" className="h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => updateStatus(req._id, 'in_progress')}>
                            Start Work
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
