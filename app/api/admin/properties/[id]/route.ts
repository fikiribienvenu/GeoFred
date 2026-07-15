import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const property = await Property.findById(params.id);
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, property });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
