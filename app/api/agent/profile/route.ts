export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';

import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const agent = await Agent.findOne({ userId: authUser.userId })
      .populate('userId', 'name email phone');

    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    return NextResponse.json({ success: true, agent });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch agent profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { bio, name, phone, profileImage } = await req.json();

    // Update agent fields
    const agentUpdate: Record<string, unknown> = {};
    if (bio !== undefined) agentUpdate.bio = bio;
    if (profileImage !== undefined) agentUpdate.profileImage = profileImage;

    if (Object.keys(agentUpdate).length > 0) {
      await Agent.findOneAndUpdate({ userId: authUser.userId }, agentUpdate);
    }

    // Update user fields
    const userUpdate: Record<string, string> = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    if (profileImage) userUpdate.avatar = profileImage; // sync to user too

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(authUser.userId, userUpdate);
    }

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
