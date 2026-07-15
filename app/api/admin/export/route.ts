export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';

import ServiceRequest from '@/models/ServiceRequest';
import Agent from '@/models/Agent';

import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'requests';

    let data: unknown[] = [];
    let filename = 'export.json';

    switch (type) {
      case 'requests': {
        const requests = await ServiceRequest.find({})
          .populate('clientId', 'name email phone')
          .populate({ path: 'assignedAgent', populate: { path: 'userId', select: 'name' } })
          .sort({ createdAt: -1 })
          .limit(1000);
        data = requests.map(r => ({
          id: r._id,
          serviceType: r.serviceType,
          client: (r.clientId as { name?: string })?.name,
          district: r.district,
          sector: r.sector,
          status: r.status,
          priority: r.priority,
          createdAt: r.createdAt,
        }));
        filename = 'service-requests.json';
        break;
      }
      case 'properties': {
        const properties = await Property.find({}).sort({ createdAt: -1 }).limit(1000);
        data = properties.map(p => ({
          id: p._id, title: p.title, type: p.type,
          category: p.category, price: p.price,
          district: p.district, status: p.status,
          published: p.published, createdAt: p.createdAt,
        }));
        filename = 'properties.json';
        break;
      }
      case 'agents': {
        const agents = await Agent.find({})
          .populate('userId', 'name email phone')
          .sort({ createdAt: -1 });
        data = agents.map(a => ({
          id: a._id,
          name: (a.userId as { name?: string })?.name,
          email: (a.userId as { email?: string })?.email,
          province: a.province,
          district: a.district,
          sector: a.sector,
          status: a.approvalStatus,
          completed: a.completedRequests,
        }));
        filename = 'agents.json';
        break;
      }
      case 'clients': {
        const clients = await User.find({ role: 'client' })
          .select('-password').sort({ createdAt: -1 }).limit(1000);
        data = clients.map(c => ({
          id: c._id, name: c.name, email: c.email,
          phone: c.phone, status: c.status, createdAt: c.createdAt,
        }));
        filename = 'clients.json';
        break;
      }
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
