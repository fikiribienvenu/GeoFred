export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';

import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
