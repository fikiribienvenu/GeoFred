import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail, agentApprovalEmail, agentRejectionEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { action, reason } = await req.json();
    const agent = await Agent.findById(params.id).populate('userId');

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const agentUser = await User.findById(agent.userId);
    if (!agentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'approve':
        agent.approvalStatus = 'approved';
        agentUser.status = 'active';
        await Promise.all([agent.save(), agentUser.save()]);
        sendEmail({ to: agentUser.email, subject: 'Agent Application Approved', html: agentApprovalEmail(agentUser.name) }).catch(console.error);
        break;
      case 'reject':
        agent.approvalStatus = 'rejected';
        agent.rejectionReason = reason;
        await agent.save();
        sendEmail({ to: agentUser.email, subject: 'Agent Application Update', html: agentRejectionEmail(agentUser.name, reason) }).catch(console.error);
        break;
      case 'suspend':
        agent.approvalStatus = 'suspended';
        agentUser.status = 'suspended';
        await Promise.all([agent.save(), agentUser.save()]);
        break;
      case 'delete':
        await User.findByIdAndDelete(agent.userId);
        await Agent.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Agent deleted' });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Agent ${action}d successfully` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
