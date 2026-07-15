'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, MapPin, User, Calendar, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
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
  clientId: { name: string; email: string; phone: string };
  assignedAgent?: { userId: { name: string }; district: string; sector: string };
}

const statusBadge = (status: string) => {
  const map: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning', assigned: 'info', in_progress: 'info', completed: 'success', cancelled: 'destructive'
  };
  return <Badge variant={map[status] || 'secondary'} className="capitalize">{status.replace('_', ' ')}</Badge>;
};

const priorityColor = (p: string) =>
  p === 'high' ? 'text-red-600 bg-red-50' : p === 'medium' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/api/service-requests?${params}`);
      setRequests(data.requests || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/service-requests/${id}`, { status });
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
    } catch { /* ignore */ }
  };

  const filtered = requests.filter((r) =>
    !search ||
    r.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
    r.clientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Service Requests</h1>
        <p className="text-muted-foreground text-sm">Manage and track all service requests</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search requests..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button variant="outline" size="icon" onClick={fetchRequests}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No service requests found</div>
        ) : (
          filtered.map((req) => (
            <motion.div key={req._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start gap-4 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-bold text-sm capitalize">{req.serviceType?.replace(/_/g, ' ')}</span>
                        {statusBadge(req.status)}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityColor(req.priority)}`}>{req.priority}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{req.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.clientId?.name}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.sector}, {req.district}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(req.createdAt)}</span>
                        {req.assignedAgent && (
                          <span className="flex items-center gap-1 text-primary"><UserCheck className="h-3 w-3" />{req.assignedAgent.userId?.name}</span>
                        )}
                      </div>
                    </div>
                    {/* Status update actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {req.status === 'assigned' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(req._id, 'in_progress')}>
                          Start Progress
                        </Button>
                      )}
                      {req.status === 'in_progress' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200" onClick={() => updateStatus(req._id, 'completed')}>
                          Mark Complete
                        </Button>
                      )}
                      {req.status !== 'cancelled' && req.status !== 'completed' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200" onClick={() => updateStatus(req._id, 'cancelled')}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
