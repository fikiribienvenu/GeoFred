import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServiceRequest from '@/models/ServiceRequest';
import Agent from '@/models/Agent';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Smart agent matching algorithm
async function findBestAgent(province: string, district: string, sector: string) {
  // 1. Try exact sector match
  let agent = await Agent.findOne({ province, district, sector, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });

  if (agent) return agent;

  // 2. Try same district
  agent = await Agent.findOne({ province, district, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });

  if (agent) return agent;

  // 3. Try same province
  agent = await Agent.findOne({ province, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });

  return agent;
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { serviceType, province, district, sector, description, priority } = body;

    if (!serviceType || !province || !district || !sector || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find best agent
    const assignedAgent = await findBestAgent(province, district, sector);

    const request = await ServiceRequest.create({
      clientId: user.userId,
      serviceType,
      province,
      district,
      sector,
      description,
      priority: priority || 'medium',
      assignedAgent: assignedAgent?._id,
      status: assignedAgent ? 'assigned' : 'pending',
    });

    return NextResponse.json({
      success: true,
      request,
      agentAssigned: !!assignedAgent,
      message: assignedAgent
        ? 'Request submitted and agent assigned successfully'
        : 'Request submitted. Admin will assign an agent shortly.',
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (user.role === 'client') query.clientId = user.userId;
    if (user.role === 'agent') {
      const agent = await Agent.findOne({ userId: user.userId });
      if (agent) query.assignedAgent = agent._id;
    }

    const [requests, total] = await Promise.all([
      ServiceRequest.find(query)
        .populate('clientId', 'name email phone')
        .populate({ path: 'assignedAgent', populate: { path: 'userId', select: 'name email phone' } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ServiceRequest.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, requests, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
