const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log("📧 Sending email via Resend to:", to);
    
    const data = await resend.emails.send({
      from: 'AlgoSprint <AlgoSprint@resend.dev>', // Use their domain initially
      to: [to],
      subject,
      html,
    });

    console.log("✅ Email sent successfully via Resend:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Resend error:", error);
    throw new Error(error.message || "Email sending failed");
  }
};

module.exports = sendEmail;
