'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, Clock, Users, Star, MapPin } from 'lucide-react';
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
  clientId: { name: string; email: string; phone: string };
  priority: string;
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/service-requests?limit=10')
      .then(({ data }) => setRequests(data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    assigned: requests.filter((r) => r.status === 'assigned').length,
    inProgress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    total: requests.length,
  };

  const statusBadge = (status: string) => {
    const map: Record<string, 'warning' | 'info' | 'success' | 'destructive'> = {
      assigned: 'warning', in_progress: 'info', completed: 'success', cancelled: 'destructive'
    };
    return <Badge variant={map[status] || 'secondary'} className="capitalize">{status.replace('_', ' ')}</Badge>;
  };

  const priorityColor = (p: string) => p === 'high' ? 'text-red-600' : p === 'medium' ? 'text-orange-500' : 'text-green-600';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Welcome, Agent {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-sm">Here&apos;s an overview of your assigned service requests.</p>
      </div>

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

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Assigned Service Requests</CardTitle>
          <Link href="/agent/requests"><Button variant="ghost" size="sm">View all</Button></Link>
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
              {requests.map((req) => (
                <div key={req._id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm capitalize">{req.serviceType.replace(/_/g, ' ')}</span>
                      <span className={`text-xs font-medium ${priorityColor(req.priority)}`}>{req.priority} priority</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />{req.clientId?.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />{req.sector}, {req.district}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatDate(req.createdAt)}</div>
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
