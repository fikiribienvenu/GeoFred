import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const property = await Property.findById(params.id).populate('createdBy', 'name email');
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    // Increment views
    await Property.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return NextResponse.json({ success: true, property });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const property = await Property.findByIdAndUpdate(params.id, body, { new: true });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    return NextResponse.json({ success: true, property });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    await Property.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Property deleted' });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
