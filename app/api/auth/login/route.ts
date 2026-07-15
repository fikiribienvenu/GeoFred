export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';

import Agent from '@/models/Agent';
import { signToken, setAuthCookie } from '@/lib/auth';

import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status === 'suspended') {
      return NextResponse.json({ error: 'Account suspended. Contact support.' }, { status: 403 });
    }

    // Check agent approval
    if (user.role === 'agent') {
      const agent = await Agent.findOne({ userId: user._id });
      if (agent && agent.approvalStatus !== 'approved') {
        return NextResponse.json({
          error: `Agent account is ${agent.approvalStatus}. Please wait for admin approval.`
        }, { status: 403 });
      }
    }

    const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });
    setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
