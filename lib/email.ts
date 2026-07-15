import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  await transporter.sendMail({
    from: `"GeoFredE-Terra State" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

export function agentApprovalEmail(agentName: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#e55c1a,#d44610);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">GeoFredE-Terra State</h1>
      </div>
      <div style="padding:30px">
        <h2 style="color:#333">Congratulations, ${agentName}!</h2>
        <p style="color:#666;line-height:1.6">Your agent account has been <strong style="color:#22c55e">approved</strong>. You can now log in and start managing property listings and service requests in your sector.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="display:inline-block;background:#e55c1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;font-weight:bold">Login to Dashboard</a>
      </div>
      <div style="background:#f5f5f5;padding:20px;text-align:center;color:#999;font-size:12px">
        <p>© 2024 GeoFredE-Terra State | <a href="https://geofred.com" style="color:#e55c1a">geofred.com</a></p>
      </div>
    </div>
  `;
}

export function agentRejectionEmail(agentName: string, reason?: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#e55c1a,#d44610);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">GeoFredE-Terra State</h1>
      </div>
      <div style="padding:30px">
        <h2>Dear ${agentName},</h2>
        <p>We regret to inform you that your agent application has not been approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please contact us at <a href="mailto:info@geofred.com">info@geofred.com</a> for more information.</p>
      </div>
    </div>
  `;
}

export function welcomeEmail(name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#e55c1a,#d44610);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Welcome to GeoFredE-Terra State</h1>
      </div>
      <div style="padding:30px">
        <h2>Hello ${name}!</h2>
        <p>Thank you for joining GeoFredE-Terra State — Rwanda's premier real estate and survey management platform.</p>
        <p>You can now browse properties, request services, and connect with our expert agents across Rwanda.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#e55c1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;font-weight:bold">Go to Dashboard</a>
      </div>
    </div>
  `;
}

export function passwordResetEmail(name: string, resetToken: string): string {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#e55c1a,#d44610);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Password Reset</h1>
      </div>
      <div style="padding:30px">
        <h2>Hello ${name},</h2>
        <p>You requested a password reset. Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#e55c1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;font-weight:bold">Reset Password</a>
        <p style="color:#999;margin-top:20px;font-size:13px">If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `;
}
