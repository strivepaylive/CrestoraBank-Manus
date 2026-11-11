import nodemailer from 'nodemailer';

// Using Gmail's SMTP (free, no setup needed)
// For production, use environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'crestora.bank.noreply@gmail.com',
    pass: 'your-app-password-here', // Will be set via env
  },
});

export async function sendOTPEmailNodemailer(to: string, otp: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: 'Crestora Bank <crestora.bank.noreply@gmail.com>',
      to,
      subject: 'Your Crestora Bank Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Crestora Bank</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Your verification code for Crestora Bank is:</p>
            <div style="background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0; letter-spacing: 5px;">${otp}</p>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">This code will expire in 10 minutes.</p>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">© 1994 Crestora Bank. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email] OTP sent successfully to ${to}:`, result.messageId);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send OTP to ${to}:`, error);
    return false;
  }
}
