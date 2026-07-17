import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import Agent from '@/models/Agent';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    await connectDB();

    const { name, email, phone, message, createAccount, password } = await req.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: 'Name, email, phone and message are required' }, { status: 400 });
    }

    // Get the property with its assigned agent
    const property = await Property.findById(params.id)
      .populate({ path: 'assignedAgent', populate: { path: 'userId', select: 'name email phone' } });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Get agent contact info
    const agentData = property.assignedAgent as unknown as {
      userId?: { name?: string; email?: string; phone?: string };
      district?: string;
      sector?: string;
    } | null;

    const agentName = agentData?.userId?.name || 'Our Agent';
    const agentEmail = agentData?.userId?.email;
    const agentPhone = agentData?.userId?.phone;

    // Optionally create account for the client
    let accountCreated = false;
    if (createAccount && password && password.length >= 6) {
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({ name, email, phone, password, role: 'client' });
        accountCreated = true;
      }
    }

    // Send email to the agent about the inquiry
    if (agentEmail) {
      await sendEmail({
        to: agentEmail,
        subject: `New Property Inquiry — ${property.title}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#e55c1a,#d44610);padding:24px;border-radius:8px 8px 0 0">
              <h2 style="color:#fff;margin:0">New Property Inquiry</h2>
            </div>
            <div style="padding:24px;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px">
              <p style="color:#555">You have a new inquiry for:</p>
              <h3 style="color:#333">${property.title}</h3>
              <p style="color:#888;font-size:13px">${property.district}, ${property.sector} · RWF ${property.price.toLocaleString()}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
              <h4 style="color:#333;margin-bottom:8px">Client Details</h4>
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:6px 0;color:#888;width:100px">Name</td><td style="color:#333;font-weight:bold">${name}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Email</td><td style="color:#333">${email}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Phone</td><td style="color:#333">${phone}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
              <h4 style="color:#333;margin-bottom:8px">Message</h4>
              <p style="background:#f9f9f9;padding:12px;border-radius:6px;color:#555;font-size:14px">${message}</p>
              <p style="color:#888;font-size:12px;margin-top:16px">Please contact the client as soon as possible.</p>
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    // Send confirmation email to the client
    await sendEmail({
      to: email,
      subject: `Inquiry Received — ${property.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#e55c1a,#d44610);padding:24px;border-radius:8px 8px 0 0">
            <h2 style="color:#fff;margin:0">GeoFredE-Terra State</h2>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for your inquiry about <strong>${property.title}</strong>.</p>
            <p>Our agent <strong>${agentName}</strong> will contact you shortly at <strong>${phone}</strong>.</p>
            ${agentPhone ? `<p>You can also reach the agent directly at: <strong>${agentPhone}</strong></p>` : ''}
            ${accountCreated ? `<p style="background:#f0fdf4;padding:12px;border-radius:6px;color:#16a34a;border:1px solid #bbf7d0">✅ Your account has been created! You can now <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="color:#e55c1a">login</a> to track your inquiries.</p>` : ''}
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
            <p style="font-size:13px;color:#888">GeoFredE-Terra State · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#e55c1a">geofred.com</a></p>
          </div>
        </div>
      `,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Inquiry sent successfully. The agent will contact you shortly.',
      agentName,
      agentPhone: agentPhone || property.contactInfo?.phone,
      accountCreated,
    });
  } catch (error) {
    console.error('Inquiry error:', error);
    return NextResponse.json({ error: 'Failed to send inquiry' }, { status: 500 });
  }
}
