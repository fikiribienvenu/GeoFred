'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, UserX, Trash2, RefreshCw, MapPin, Upload, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import api from '@/lib/axios';

interface Agent {
  _id: string;
  userId: { _id: string; name: string; email: string; phone: string; status: string; createdAt: string };
  nationalId: string;
  province: string;
  district: string;
  sector: string;
  coverageAreas: { province: string; district: string; sectors: string[] }[];
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  completedRequests: number;
  canUploadProperties: boolean;
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
      const { data } = await api.get(`/api/admin/agents?${params}`);
      setAgents(data.agents || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, [statusFilter]);

  const handleAction = async () => {
    if (!actionAgent) return;
    setProcessing(true);
    try {
      await api.patch(`/api/admin/agents/${actionAgent._id}`, { action: actionType, reason });
      setActionAgent(null);
      setReason('');
      fetchAgents();
    } catch { /* ignore */ }
    setProcessing(false);
  };

  const toggleUpload = async (agent: Agent) => {
    try {
      const { data } = await api.patch(`/api/admin/agents/${agent._id}`, {
        action: 'toggleUpload',
        canUploadProperties: !agent.canUploadProperties,
      });
      setAgents(prev => prev.map(a => a._id === agent._id
        ? { ...a, canUploadProperties: data.canUploadProperties }
        : a
      ));
    } catch { /* ignore */ }
  };

  const filtered = agents.filter(a =>
    !filter ||
    a.userId?.name?.toLowerCase().includes(filter.toLowerCase()) ||
    a.district?.toLowerCase().includes(filter.toLowerCase()) ||
    a.sector?.toLowerCase().includes(filter.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
      pending: 'warning', approved: 'success', rejected: 'destructive', suspended: 'secondary',
    };
    return <Badge variant={map[status] || 'secondary'} className="capitalize">{status}</Badge>;
  };

  // Get all districts for an agent (primary + coverage areas)
  const getDistricts = (agent: Agent) => {
    const areas = agent.coverageAreas?.length > 0 ? agent.coverageAreas : [];
    const primary = { province: agent.province, district: agent.district, sectors: [agent.sector] };
    const all = [primary, ...areas];
    const unique = Array.from(new Map(all.map(a => [a.district, a])).values());
    return unique;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Agent Management</h1>
        <p className="text-muted-foreground text-sm">Review and manage agent registrations and permissions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, district, or sector..." className="pl-9" value={filter}
            onChange={e => setFilter(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
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
                    <th className="text-left py-3 font-medium">Coverage</th>
                    <th className="text-left py-3 font-medium">Registered</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Upload</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(agent => (
                    <motion.tr key={agent._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">

                      {/* Agent info */}
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

                      {/* Coverage areas */}
                      <td className="py-3">
                        <div className="space-y-0.5">
                          {getDistricts(agent).slice(0, 2).map((area, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span>{area.district}</span>
                              {area.sectors?.length > 0 && (
                                <span className="text-xs opacity-60">({area.sectors.slice(0, 2).join(', ')}{area.sectors.length > 2 ? '...' : ''})</span>
                              )}
                            </div>
                          ))}
                          {getDistricts(agent).length > 2 && (
                            <div className="text-xs text-primary">+{getDistricts(agent).length - 2} more</div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 text-xs text-muted-foreground">{formatDate(agent.createdAt)}</td>

                      <td className="py-3">{statusBadge(agent.approvalStatus)}</td>

                      {/* Upload permission toggle */}
                      <td className="py-3">
                        <button
                          onClick={() => agent.approvalStatus === 'approved' && toggleUpload(agent)}
                          disabled={agent.approvalStatus !== 'approved'}
                          title={agent.approvalStatus !== 'approved' ? 'Approve agent first' : agent.canUploadProperties ? 'Revoke upload permission' : 'Grant upload permission'}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                            agent.canUploadProperties
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          } ${agent.approvalStatus !== 'approved' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <UploadCloud className="h-3 w-3" />
                          {agent.canUploadProperties ? 'Granted' : 'Revoked'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {agent.approvalStatus === 'pending' && (
                            <>
                              <Button size="sm" variant="outline"
                                className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => { setActionAgent(agent); setActionType('approve'); }}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline"
                                className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => { setActionAgent(agent); setActionType('reject'); }}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {agent.approvalStatus === 'approved' && (
                            <Button size="sm" variant="outline"
                              className="h-7 px-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                              onClick={() => { setActionAgent(agent); setActionType('suspend'); }}>
                              <UserX className="h-3.5 w-3.5 mr-1" /> Suspend
                            </Button>
                          )}
                          {agent.approvalStatus === 'suspended' && (
                            <Button size="sm" variant="outline"
                              className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => { setActionAgent(agent); setActionType('approve'); }}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Reinstate
                            </Button>
                          )}
                          <Button size="sm" variant="outline"
                            className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
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
      <Dialog open={!!actionAgent} onOpenChange={o => { if (!o) { setActionAgent(null); setReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType} Agent</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">
              {actionType === 'delete' ? 'This will permanently delete the agent account and all associated data.' :
               actionType === 'approve' ? `Approve ${actionAgent?.userId?.name} as a certified agent?` :
               actionType === 'reject' ? `Reject ${actionAgent?.userId?.name}'s application?` :
               actionType === 'suspend' ? `Suspend ${actionAgent?.userId?.name}?` :
               `Reinstate ${actionAgent?.userId?.name}?`}
            </p>
            {(actionType === 'reject' || actionType === 'suspend') && (
              <div className="space-y-1.5">
                <Label>Reason <span className="text-muted-foreground">(optional)</span></Label>
                <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter reason..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionAgent(null); setReason(''); }}>Cancel</Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={processing}>
              {processing ? 'Processing...' : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
