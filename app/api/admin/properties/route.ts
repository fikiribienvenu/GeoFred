export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';

import { getUserFromRequest } from '@/lib/auth';

// Admin: get ALL properties (published or not)
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, string> = {};
    if (type) query.type = type;

    const [properties, total] = await Promise.all([
      Property.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Property.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, properties, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
