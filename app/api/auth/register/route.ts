export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';

import { signToken, setAuthCookie } from '@/lib/auth';
import { sendEmail, welcomeEmail } from '@/lib/email';

import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(6, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, phone, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const user = await User.create({ name, email, phone, password, role: 'client' });

    const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });
    setAuthCookie(token);

    // Send welcome email (non-blocking)
    sendEmail({ to: email, subject: 'Welcome to GeoFredE-Terra State', html: welcomeEmail(name) }).catch(console.error);

    return NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
