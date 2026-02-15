const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const verifiedEmail = 'greninjash4@gmail.com'; 

    console.log(`📧 Redirecting email from ${to} to ${verifiedEmail}`);

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [verifiedEmail],   // ALWAYS send here
      subject: `[FOR: ${to}] ${subject}`, // show original recipient
      html,
      text,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email sent successfully! ID:", data?.id);
    return data;

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
