const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // ✅ DEVELOPMENT MODE: Route all emails to your verified email
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const verifiedEmail = 'greninjash4@gmail.com'; // Your verified Resend email
    
    const actualRecipient = isDevelopment ? verifiedEmail : to;
    
    if (isDevelopment && to !== verifiedEmail) {
      console.log(`📧 [DEV MODE] Redirecting email from ${to} to ${verifiedEmail}`);
    }
    
    console.log("📧 Sending email via Resend to:", actualRecipient);
    
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [actualRecipient],
      subject: isDevelopment ? `[FOR: ${to}] ${subject}` : subject, // Show original recipient
      html,
      text,
    });

    // ✅ Check for errors in response
    if (response.error) {
      console.error("❌ Resend error:", response.error);
      throw new Error(response.error.message || "Resend returned an error");
    }

    const emailId = response?.data?.id;
    
    console.log("✅ Email sent successfully! ID:", emailId);
    
    if (!emailId) {
      console.warn("⚠️ Warning: No email ID in response:", JSON.stringify(response));
    }
    
    return response;
    
  } catch (error) {
    console.error("❌ Resend error:", error.message);
    throw new Error(error.message || "Email sending failed");
  }
};

module.exports = sendEmail;