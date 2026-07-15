export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import crypto from 'crypto';
import connectDB from '@/lib/mongodb';

import User from '@/models/User';
import { sendEmail, passwordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({ success: true, message: 'If that email exists, a reset link was sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    sendEmail({
      to: email,
      subject: 'Password Reset - GeoFredE-Terra State',
      html: passwordResetEmail(user.name, token),
    }).catch(console.error);

    return NextResponse.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
