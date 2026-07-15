'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, Clock, AlertCircle, Plus, ArrowRight } from 'lucide-react';
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
  district: string;
  sector: string;
  status: string;
  createdAt: string;
  assignedAgent?: { userId: { name: string } };
}

const statusBadge = (status: string) => {
  const map: Record<string, 'warning' | 'info' | 'success' | 'destructive'> = {
    pending: 'warning', assigned: 'info', in_progress: 'info', completed: 'success', cancelled: 'destructive'
  };
  return <Badge variant={map[status] || 'secondary'} className="capitalize">{status.replace('_', ' ')}</Badge>;
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/service-requests?limit=5')
      .then(({ data }) => setRequests(data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    inProgress: requests.filter((r) => ['assigned', 'in_progress'].includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-sm">Manage your service requests and track progress.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: counts.total, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: counts.pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'In Progress', value: counts.inProgress, icon: AlertCircle, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Completed', value: counts.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
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

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="terra-gradient rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <h3 className="font-black text-xl mb-2">Need a Service?</h3>
        <p className="text-white/80 text-sm mb-4">Submit a request and we&apos;ll connect you with the nearest agent.</p>
        <Link href="/dashboard/requests/new">
          <Button size="sm" className="bg-white text-primary hover:bg-white/90 gap-2">
            <Plus className="h-4 w-4" /> Submit New Request
          </Button>
        </Link>
      </motion.div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Recent Requests</CardTitle>
          <Link href="/dashboard/requests">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowRight className="h-3 w-3" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground mb-4">No requests yet</p>
              <Link href="/dashboard/requests/new">
                <Button variant="terra" size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Submit Request</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-medium text-sm capitalize">{req.serviceType.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-muted-foreground">{req.sector}, {req.district} · {formatDate(req.createdAt)}</div>
                    {req.assignedAgent && (
                      <div className="text-xs text-primary mt-0.5">Agent: {req.assignedAgent.userId?.name}</div>
                    )}
                  </div>
                  {statusBadge(req.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
