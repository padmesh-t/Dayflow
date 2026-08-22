export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email, otpCode) {
  console.log(`\n==================================================`);
  console.log(`[SIMULATED MAIL ENGINE] OTP Sent To: ${email}`);
  console.log(`[SECURITY OTP CODE]: ${otpCode}`);
  console.log(`[EXPIRATION]: 10 minutes`);
  console.log(`==================================================\n`);
  return { success: true, email, otpCode };
}

export async function sendWelcomeCredentialsEmail(email, name, loginId, tempPassword) {
  console.log(`\n==================================================`);
  console.log(`[SIMULATED MAIL ENGINE] Welcome Email Sent To: ${email}`);
  console.log(`[EMPLOYEE NAME]: ${name}`);
  console.log(`[AUTO GENERATED LOGIN ID]: ${loginId}`);
  console.log(`[TEMPORARY PASSWORD]: ${tempPassword}`);
  console.log(`==================================================\n`);
  return { success: true, email, loginId };
}
