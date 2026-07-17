import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Get top 3 approved agents sorted by rating and completed requests
    const agents = await Agent.find({ approvalStatus: 'approved' })
      .populate('userId', 'name')
      .sort({ rating: -1, completedRequests: -1 })
      .limit(3);

    const agentList = agents.map((a) => ({
      _id: a._id,
      name: (a.userId as { name?: string })?.name || 'Agent',
      district: a.district,
      sector: a.sector,
      province: a.province,
      rating: a.rating || 0,
      completedRequests: a.completedRequests || 0,
    }));

    // Stats
    const total = await Agent.countDocuments({ approvalStatus: 'approved' });
    const distinctDistricts = await Agent.distinct('district', { approvalStatus: 'approved' });
    
    // Calculate avg rating
    const ratingAgg = await Agent.aggregate([
      { $match: { approvalStatus: 'approved', rating: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const avgRating = ratingAgg[0]?.avg?.toFixed(1) || '4.8';

    return NextResponse.json({
      success: true,
      agents: agentList,
      stats: {
        total,
        districts: distinctDistricts.length,
        rating: avgRating,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      agents: [],
      stats: { total: 0, districts: 0, rating: '4.8' },
    });
  }
}
