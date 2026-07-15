export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // Get distinct conversation partners
    const sent = await Message.distinct('receiverId', { senderId: user.userId });
    const received = await Message.distinct('senderId', { receiverId: user.userId });
    const combined = [...sent.map(String), ...received.map(String)];
    const partnerIds = combined.filter((id, idx) => combined.indexOf(id) === idx && id !== user.userId);

    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partner = await User.findById(partnerId, 'name email');
        if (!partner) return null;

        const lastMsg = await Message.findOne({
          $or: [
            { senderId: user.userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: user.userId },
          ],
        }).sort({ createdAt: -1 });

        const unread = await Message.countDocuments({
          senderId: partnerId,
          receiverId: user.userId,
          read: false,
        });

        return {
          userId: partnerId,
          name: partner.name,
          email: partner.email,
          lastMessage: lastMsg?.content || '',
          lastTime: lastMsg?.createdAt || '',
          unread,
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversations.filter(Boolean),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
