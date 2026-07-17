import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServiceRequest from '@/models/ServiceRequest';
import Agent from '@/models/Agent';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Smart agent matching
async function findBestAgent(province: string, district: string, sector: string) {
  let agent = await Agent.findOne({ province, district, sector, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });
  if (agent) return agent;

  agent = await Agent.findOne({ province, district, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });
  if (agent) return agent;

  agent = await Agent.findOne({ province, approvalStatus: 'approved' })
    .sort({ completedRequests: -1 });
  return agent;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      serviceType, province, district, sector, description, priority,
      // Guest fields
      guestName, guestEmail, guestPhone,
    } = body;

    if (!serviceType || !province || !district || !sector || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if logged in
    const user = getUserFromRequest(req);
    const isGuest = !user;

    // Guest must provide contact info
    if (isGuest && (!guestName || !guestEmail || !guestPhone)) {
      return NextResponse.json({
        error: 'Please provide your name, email and phone to submit a request',
      }, { status: 400 });
    }

    // Find best agent
    const assignedAgent = await findBestAgent(province, district, sector);

    // Create the request
    const requestData: Record<string, unknown> = {
      serviceType,
      province,
      district,
      sector,
      description,
      priority: priority || 'medium',
      assignedAgent: assignedAgent?._id,
      status: assignedAgent ? 'assigned' : 'pending',
      isGuest,
    };

    if (user) {
      requestData.clientId = user.userId;
    } else {
      requestData.guestName = guestName;
      requestData.guestEmail = guestEmail;
      requestData.guestPhone = guestPhone;
    }

    const request = await ServiceRequest.create(requestData);

    // Send confirmation email to guest/client
    const toEmail = isGuest ? guestEmail : null;
    const toName = isGuest ? guestName : null;
    if (toEmail && toName) {
      // Get agent contact for the email
      const agentDoc = assignedAgent
        ? await Agent.findById(assignedAgent._id)
        : null;
      const agentUserId = agentDoc?.userId;
      let agentName = 'Our Team';
      let agentPhone = '';
      if (agentUserId) {
        const User = (await import('@/models/User')).default;
        const agentUser = await User.findById(agentUserId).select('name phone');
        agentName = agentUser?.name || 'Our Team';
        agentPhone = agentUser?.phone || '';
      }

      sendEmail({
        to: toEmail,
        subject: `Service Request Received — GeoFredE-Terra State`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#e55c1a,#d44610);padding:24px;border-radius:8px 8px 0 0">
              <h2 style="color:#fff;margin:0">Request Received!</h2>
            </div>
            <div style="padding:24px;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px">
              <p>Dear <strong>${toName}</strong>,</p>
              <p>Your <strong>${serviceType.replace(/_/g, ' ')}</strong> request has been received.</p>
              ${assignedAgent
                ? `<p>Agent <strong>${agentName}</strong> has been assigned to your request in <strong>${district}</strong>.</p>
                   ${agentPhone ? `<p>They will contact you at <strong>${guestPhone}</strong> shortly. You can also call: <strong>${agentPhone}</strong></p>` : ''}`
                : `<p>Our team will assign an agent shortly and contact you at <strong>${guestPhone}</strong>.</p>`
              }
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
              <table style="font-size:13px;width:100%">
                <tr><td style="color:#888;padding:4px 0;width:120px">Service</td><td style="color:#333">${serviceType.replace(/_/g, ' ')}</td></tr>
                <tr><td style="color:#888;padding:4px 0">Location</td><td style="color:#333">${sector}, ${district}</td></tr>
                <tr><td style="color:#888;padding:4px 0">Status</td><td style="color:#333">${assignedAgent ? 'Agent Assigned' : 'Pending Assignment'}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
              <p style="font-size:12px;color:#999">GeoFredE-Terra State · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#e55c1a">geofred.com</a></p>
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      request,
      agentAssigned: !!assignedAgent,
      isGuest,
      message: assignedAgent
        ? `Request submitted! Agent assigned for ${district}. ${isGuest ? 'Check your email for details.' : ''}`
        : `Request submitted. Admin will assign an agent shortly. ${isGuest ? 'Check your email for confirmation.' : ''}`,
    }, { status: 201 });

  } catch (error) {
    console.error('Service request error:', JSON.stringify(error, null, 2), error);
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

    if (user.role === 'admin') {
      // Admin sees all — including guest requests
    } else if (user.role === 'client') {
      query.clientId = user.userId;
    } else if (user.role === 'agent') {
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
