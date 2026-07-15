import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get('with');

    if (!withUserId) return NextResponse.json({ error: 'Missing with parameter' }, { status: 400 });

    const messages = await Message.find({
      $or: [
        { senderId: user.userId, receiverId: withUserId },
        { senderId: withUserId, receiverId: user.userId },
      ],
    }).sort({ createdAt: 1 }).limit(100);

    // Mark messages as read
    await Message.updateMany(
      { senderId: withUserId, receiverId: user.userId, read: false },
      { read: true }
    );

    return NextResponse.json({ success: true, messages });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { receiverId, content, serviceRequestId } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = await Message.create({
      senderId: user.userId,
      receiverId,
      content: content.trim(),
      serviceRequestId,
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
