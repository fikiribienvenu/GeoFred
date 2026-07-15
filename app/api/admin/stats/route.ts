import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Agent from '@/models/Agent';
import Property from '@/models/Property';
import ServiceRequest from '@/models/ServiceRequest';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const [
      totalAgents, totalProperties, pendingApprovals,
      totalClients, totalRequests, recentAgents, recentRequests
    ] = await Promise.all([
      Agent.countDocuments({ approvalStatus: 'approved' }),
      Property.countDocuments({ published: true }),
      Agent.countDocuments({ approvalStatus: 'pending' }),
      User.countDocuments({ role: 'client' }),
      ServiceRequest.countDocuments(),
      Agent.find().populate('userId', 'name email createdAt').sort({ createdAt: -1 }).limit(5),
      ServiceRequest.find().populate('clientId', 'name email').sort({ createdAt: -1 }).limit(5),
    ]);

    // Monthly requests for chart
    const now = new Date();
    const monthlyData = await ServiceRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return NextResponse.json({
      success: true,
      stats: { totalAgents, totalProperties, pendingApprovals, totalClients, totalRequests },
      recentAgents,
      recentRequests,
      monthlyData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
