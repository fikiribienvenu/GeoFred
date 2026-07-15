'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Clock, UserCheck, ClipboardList, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/axios';

interface Stats {
  totalAgents: number;
  totalProperties: number;
  pendingApprovals: number;
  totalClients: number;
  totalRequests: number;
}

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalAgents: 0, totalProperties: 0, pendingApprovals: 0, totalClients: 0, totalRequests: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(({ data }) => {
        setStats(data.stats);
        setRecentAgents(data.recentAgents || []);
        setRecentRequests(data.recentRequests || []);
        const cd = (data.monthlyData || []).map((item: { _id: { month: number; year: number }; count: number }) => ({
          name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
          requests: item.count,
        }));
        setChartData(cd.length ? cd : [
          { name: 'Feb', requests: 4 }, { name: 'Mar', requests: 8 }, { name: 'Apr', requests: 6 },
          { name: 'May', requests: 12 }, { name: 'Jun', requests: 9 }, { name: 'Jul', requests: 15 },
        ]);
      })
      .catch(() => {
        setChartData([
          { name: 'Feb', requests: 4 }, { name: 'Mar', requests: 8 }, { name: 'Apr', requests: 6 },
          { name: 'May', requests: 12 }, { name: 'Jun', requests: 9 }, { name: 'Jul', requests: 15 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Agents', value: stats.totalAgents, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', trend: '+12%' },
    { label: 'Total Properties', value: stats.totalProperties, icon: Building2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', trend: '+8%' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', alert: true },
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', trend: '+24%' },
    { label: 'Service Requests', value: stats.totalRequests, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10', trend: '+18%' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of GeoFredE-Terra State platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={card.alert && stats.pendingApprovals > 0 ? 'border-orange-300 dark:border-orange-700' : ''}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  {card.alert && stats.pendingApprovals > 0 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  {(card as { trend?: string }).trend && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />{(card as { trend?: string }).trend}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black mb-0.5">{loading ? '–' : card.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Service Requests Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e55c1a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e55c1a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="requests" stroke="#e55c1a" fill="url(#colorReq)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/agents?status=pending">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 relative">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Review Pending Agents
                  {stats.pendingApprovals > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{stats.pendingApprovals}</span>
                  )}
                </Button>
              </Link>
              <Link href="/admin/properties/new">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Building2 className="h-4 w-4 text-green-500" />
                  Add New Property
                </Button>
              </Link>
              <Link href="/admin/requests">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-500" />
                  View All Requests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Agent Applications</CardTitle>
              <Link href="/admin/agents"><Button variant="ghost" size="sm">View all</Button></Link>
            </CardHeader>
            <CardContent>
              {recentAgents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent applications</p>
              ) : (
                <div className="space-y-3">
                  {recentAgents.map((agent) => (
                    <div key={agent._id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{agent.userId?.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.district} · {formatDate(agent.createdAt)}</div>
                      </div>
                      <Badge variant={agent.approvalStatus === 'pending' ? 'warning' : agent.approvalStatus === 'approved' ? 'success' : 'destructive'}>
                        {agent.approvalStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Service Requests</CardTitle>
              <Link href="/admin/requests"><Button variant="ghost" size="sm">View all</Button></Link>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent requests</p>
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium capitalize">{req.serviceType?.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-muted-foreground">{req.clientId?.name} · {req.district}</div>
                      </div>
                      <Badge variant={req.status === 'pending' ? 'warning' : req.status === 'completed' ? 'success' : 'info'}>
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
