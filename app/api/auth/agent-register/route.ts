export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';

import Agent from '@/models/Agent';
import { z } from 'zod';

const agentRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(6),
  nationalId: z.string().min(5),
  province: z.string().min(1),
  district: z.string().min(1),
  sector: z.string().min(1),
  bio: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = agentRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, phone, password, nationalId, province, district, sector, bio } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const existingAgent = await Agent.findOne({ nationalId });
    if (existingAgent) {
      return NextResponse.json({ error: 'National ID already registered' }, { status: 409 });
    }

    const user = await User.create({ name, email, phone, password, role: 'agent', status: 'pending' });
    await Agent.create({ userId: user._id, nationalId, province, district, sector, bio, approvalStatus: 'pending' });

    return NextResponse.json({
      success: true,
      message: 'Agent registration submitted. Awaiting admin approval.',
    }, { status: 201 });
  } catch (error) {
    console.error('Agent register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
