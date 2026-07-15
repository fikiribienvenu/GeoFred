import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServiceRequest from '@/models/ServiceRequest';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const update: Record<string, unknown> = {};

    if (body.status) update.status = body.status;
    if (body.assignedAgent) update.assignedAgent = body.assignedAgent;
    if (body.notes) update.notes = body.notes;
    if (body.status === 'completed') update.completedAt = new Date();

    const request = await ServiceRequest.findByIdAndUpdate(params.id, update, { new: true });
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    return NextResponse.json({ success: true, request });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
