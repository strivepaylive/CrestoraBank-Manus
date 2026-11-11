// Simple OTP service - logs to console for testing
// In production, replace with real email service

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  try {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                  CRESTORA BANK - OTP CODE                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`To: ${to}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString()}`);
    console.log('════════════════════════════════════════════════════════════');
    console.log('');
    
    // In production, actually send email here
    // For now, just log it so you can see it in console
    return true;
  } catch (error) {
    console.error('[OTP] Failed to send code:', error);
    return false;
  }
}
