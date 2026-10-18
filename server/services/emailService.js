const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore in older environments
}
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const getResendClient = () => {
  if (process.env.EMAIL_PROVIDER === 'gmail') {
    return null; // Force Google SMTP
  }
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_')) {
    return new Resend(process.env.RESEND_API_KEY);
  }
  return null;
};

const createTransporter = () => {
  if (process.env.EMAIL_HOST === 'smtp.gmail.com' || process.env.EMAIL_USER?.endsWith('@gmail.com') || process.env.EMAIL_PROVIDER === 'gmail') {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''),
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  // 1. Prioritize Resend API (Fast, modern transactional email)
  const resend = getResendClient();
  if (resend) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'MediCare360 <onboarding@resend.dev>';
      const data = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject,
        html,
      });

      if (data.error) {
        // If Resend free tier restricts to owner's email address, deliver to the verified testing inbox
        const match = data.error.message?.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
        if (match && match[1] && match[1].toLowerCase() !== to.toLowerCase()) {
          const fallbackEmail = match[1];
          console.log(`ℹ️  [RESEND SANDBOX] Recipient ${to} not verified on Resend free tier. Forwarding to verified testing inbox: ${fallbackEmail}`);
          const fallbackHtml = `
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 8px; margin-bottom: 24px; font-family: sans-serif; font-size: 13px; color: #1e40af; line-height: 1.5;">
              ℹ️ <strong>Resend Free Tier Testing Notice:</strong><br/>
              This verification email was created for <strong>${to}</strong> and delivered to your verified Resend testing inbox (<strong>${fallbackEmail}</strong>).
            </div>
            ${html}
          `;
          const retryData = await resend.emails.send({
            from: fromEmail,
            to: [fallbackEmail],
            subject: `[Verify for ${to}] ${subject}`,
            html: fallbackHtml,
          });

          if (!retryData.error) {
            console.log(`✉️  [RESEND] Live verification email delivered to testing inbox ${fallbackEmail} for user ${to} (ID: ${retryData.data?.id})`);
            return { success: true, messageId: retryData.data?.id };
          }
        }

        console.error('Resend delivery error:', data.error);
        return { success: false, error: data.error.message };
      }

      console.log(`✉️  [RESEND] Live email sent to ${to} (ID: ${data.data?.id})`);
      return { success: true, messageId: data.data?.id };
    } catch (err) {
      console.error('Resend dispatch exception:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Fallback to standard SMTP
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_email')) {
    console.log(`ℹ️  [EMAIL SERVICE] Neither RESEND_API_KEY nor SMTP configured in .env. Skipping external email to: ${to}`);
    return { success: false, error: 'Email service credentials not configured.' };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'MediCare360 <noreply@medicare360.com>',
      to,
      subject,
      html,
      text,
    });
    console.log(`✉️  [SMTP] Email sent to ${to} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false, error: err.message };
  }
};

const emailTemplates = {
  verifyEmail: (name, link) => ({
    subject: 'Verify Your Email — MediCare360',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0066CC; margin: 0; font-size: 28px;">MediCare360</h1>
          <p style="color: #64748b; margin: 4px 0 0;">Your Healthcare, Connected.</p>
        </div>
        <div style="background: white; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin: 0 0 16px;">Hello, ${name}!</h2>
          <p style="color: #475569; line-height: 1.6;">Thank you for registering on MediCare360. Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: #0066CC; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Verify Email Address</a>
          </div>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.6; word-break: break-all;">
            If the button doesn't work, click or copy this direct link into your browser:<br/>
            <a href="${link}" style="color: #0066CC; text-decoration: underline;">${link}</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">This link expires in 24 hours. If you did not register, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (name, link) => ({
    subject: 'Reset Your Password — MediCare360',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0066CC; margin: 0; font-size: 28px;">MediCare360</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin: 0 0 16px;">Reset Your Password</h2>
          <p style="color: #475569;">Hello ${name}, click the button below to reset your password.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: #EF4444; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">This link expires in 1 hour. If you did not request a reset, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  appointmentConfirmed: (patientName, doctorName, date, time, type) => ({
    subject: 'Appointment Confirmed — MediCare360',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <h1 style="color: #0066CC; text-align: center;">MediCare360</h1>
        <div style="background: white; padding: 32px; border-radius: 8px;">
          <h2 style="color: #10B981; margin-bottom: 16px;">✓ Appointment Confirmed</h2>
          <p>Hello ${patientName},</p>
          <p>Your appointment has been confirmed.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Type:</strong> ${type}</p>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">Log in to MediCare360 to view details or join your consultation.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
