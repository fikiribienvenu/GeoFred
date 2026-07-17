import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import Agent from '@/models/Agent';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Find best agent for a given location
async function findAgentForLocation(province: string, district: string, sector: string) {
  // 1. Exact sector match
  let agent = await Agent.findOne({ province, district, sector, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });
  if (agent) return agent;

  // 2. Same district (any sector)
  agent = await Agent.findOne({ province, district, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });
  if (agent) return agent;

  // 3. Same province (any district)
  agent = await Agent.findOne({ province, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });
  return agent;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const sector = searchParams.get('sector');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const status = searchParams.get('status') || 'available';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { published: true, status };
    if (type) query.type = type;
    if (category) query.category = category;
    if (district) query.district = district;
    if (sector) query.sector = sector;
    if (bedrooms) query.bedrooms = parseInt(bedrooms);
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const properties = await Property.find(query)
      .populate('createdBy', 'name email')
      .populate({ path: 'assignedAgent', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Property.countDocuments(query);

    return NextResponse.json({ success: true, properties, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // If agent, verify they have upload permission
    if (user.role === 'agent') {
      const agent = await Agent.findOne({ userId: user.userId });
      if (!agent || agent.approvalStatus !== 'approved') {
        return NextResponse.json({ error: 'Only approved agents can upload properties' }, { status: 403 });
      }
      if (!agent.canUploadProperties) {
        return NextResponse.json({ error: 'You do not have permission to upload properties. Contact admin.' }, { status: 403 });
      }
    }

    const body = await req.json();
    const { province, district, sector } = body;

    // Auto-assign the best agent for this property's location
    let assignedAgent = null;
    if (province && district && sector) {
      // If uploader is an agent, assign to themselves
      if (user.role === 'agent') {
        assignedAgent = await Agent.findOne({ userId: user.userId, approvalStatus: 'approved' });
      } else {
        // Admin upload — find best matching agent
        assignedAgent = await findAgentForLocation(province, district, sector);
      }
    }

    const propertyData = {
      ...body,
      createdBy: user.userId,
      assignedAgent: assignedAgent?._id || null,
      // Agents submit as published directly; admins can unpublish if needed
      published: true,
    };

    const property = await Property.create(propertyData);

    // Populate agent info in response
    const populated = await Property.findById(property._id)
      .populate({ path: 'assignedAgent', populate: { path: 'userId', select: 'name email phone' } });

    return NextResponse.json({
      success: true,
      property: populated,
      agentAssigned: !!assignedAgent,
      message: assignedAgent
        ? `Property assigned to agent in ${district}`
        : 'Property created. No agent found for this location yet.',
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
