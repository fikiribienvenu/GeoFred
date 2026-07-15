'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/axios';

interface Request {
  _id: string;
  serviceType: string;
  province: string;
  district: string;
  sector: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
  assignedAgent?: { userId: { name: string; phone: string } };
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'destructive' | 'secondary' }> = {
  pending:     { label: 'Pending',     variant: 'warning' },
  assigned:    { label: 'Assigned',    variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'info' },
  completed:   { label: 'Completed',   variant: 'success' },
  cancelled:   { label: 'Cancelled',   variant: 'destructive' },
};

const priorityColor = (p: string) =>
  p === 'high' ? 'text-red-600' : p === 'medium' ? 'text-orange-500' : 'text-green-600';

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/api/service-requests?limit=50')
      .then(({ data }) => setRequests(data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => {
    const matchesSearch = !search ||
      r.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      r.district.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">My Service Requests</h1>
          <p className="text-muted-foreground text-sm">Track all your submitted requests</p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button variant="terra" className="gap-2"><Plus className="h-4 w-4" /> New Request</Button>
        </Link>
      </div>

      {/* Filters */}
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
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-bold mb-2">No requests found</h3>
          <p className="text-muted-foreground text-sm mb-5">
            {search || statusFilter ? 'Try adjusting your filters' : "You haven't submitted any requests yet"}
          </p>
          {!search && !statusFilter && (
            <Link href="/dashboard/requests/new">
              <Button variant="terra" className="gap-2"><Plus className="h-4 w-4" /> Submit First Request</Button>
            </Link>
          )}
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
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-bold text-sm capitalize">
                            {req.serviceType.replace(/_/g, ' ')}
                          </span>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                          <span className={`text-xs font-medium capitalize ${priorityColor(req.priority)}`}>
                            {req.priority} priority
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{req.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{req.sector}, {req.district}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{formatDate(req.createdAt)}
                          </span>
                        </div>
                        {req.assignedAgent?.userId && (
                          <div className="mt-1.5 text-xs text-primary font-medium">
                            Agent: {req.assignedAgent.userId.name} · {req.assignedAgent.userId.phone}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
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
