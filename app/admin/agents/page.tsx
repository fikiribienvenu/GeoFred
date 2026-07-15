'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, UserX, Trash2, Filter, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import axios from '@/lib/axios';

interface Agent {
  _id: string;
  userId: { _id: string; name: string; email: string; phone: string; status: string; createdAt: string };
  nationalId: string;
  province: string;
  district: string;
  sector: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  completedRequests: number;
  createdAt: string;
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionAgent, setActionAgent] = useState<Agent | null>(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await axios.get(`/api/admin/agents?${params}`);
      setAgents(data.agents);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, [statusFilter]);

  const handleAction = async () => {
    if (!actionAgent) return;
    setProcessing(true);
    try {
      await axios.patch(`/api/admin/agents/${actionAgent._id}`, { action: actionType, reason });
      setActionAgent(null);
      setReason('');
      fetchAgents();
    } catch { /* ignore */ }
    setProcessing(false);
  };

  const filtered = agents.filter((a) =>
    !filter ||
    a.userId?.name?.toLowerCase().includes(filter.toLowerCase()) ||
    a.district?.toLowerCase().includes(filter.toLowerCase()) ||
    a.sector?.toLowerCase().includes(filter.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
      pending: 'warning', approved: 'success', rejected: 'destructive', suspended: 'secondary'
    };
    return <Badge variant={map[status] || 'secondary'} className="capitalize">{status}</Badge>;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Agent Management</h1>
        <p className="text-muted-foreground text-sm">Review and manage agent registrations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, district, or sector..." className="pl-9" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <Button variant="outline" size="icon" onClick={fetchAgents}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Agents ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading agents...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No agents found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 font-medium">Agent</th>
                    <th className="text-left py-3 font-medium">Location</th>
                    <th className="text-left py-3 font-medium">Registered</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((agent) => (
                    <motion.tr key={agent._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {agent.userId?.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{agent.userId?.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {agent.sector}, {agent.district}
                        </div>
                        <div className="text-xs text-muted-foreground">{agent.province}</div>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{formatDate(agent.createdAt)}</td>
                      <td className="py-3">{statusBadge(agent.approvalStatus)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {agent.approvalStatus === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => { setActionAgent(agent); setActionType('approve'); }}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => { setActionAgent(agent); setActionType('reject'); }}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {agent.approvalStatus === 'approved' && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                              onClick={() => { setActionAgent(agent); setActionType('suspend'); }}>
                              <UserX className="h-3.5 w-3.5 mr-1" /> Suspend
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => { setActionAgent(agent); setActionType('delete'); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <Dialog open={!!actionAgent} onOpenChange={(o) => { if (!o) { setActionAgent(null); setReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType} Agent</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">
              {actionType === 'delete' ? 'This will permanently delete the agent account.' :
               actionType === 'approve' ? `Approve ${actionAgent?.userId?.name} as an agent?` :
               actionType === 'reject' ? `Reject ${actionAgent?.userId?.name}'s application?` :
               `Suspend ${actionAgent?.userId?.name}?`}
            </p>
            {(actionType === 'reject' || actionType === 'suspend') && (
              <div className="space-y-1.5">
                <Label>Reason <span className="text-muted-foreground">(optional)</span></Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionAgent(null); setReason(''); }}>Cancel</Button>
            <Button variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction} disabled={processing}>
              {processing ? 'Processing...' : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
