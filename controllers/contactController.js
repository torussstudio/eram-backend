import { sendMail } from "../services/mailService.js";

export const submitContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    await sendMail({
      to:
        process.env.CONTACT_MAIL_TO ||
        process.env.MAIL_TO ||
        process.env.SMTP_USER,

      subject: `New Contact Form Message — ${subject || "General Enquiry"}`,

      replyTo: email,

      text: `
New Contact Form Message

Name: ${name}
Email: ${email}
Phone: ${phone || "-"}

Subject:
${subject || "-"}

Message:
${message}
      `,
    });

    console.log("Contact notification email sent");

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully",
    });
  } catch (err) {
    console.error(
      "Contact notification email failed:",
      err.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to send your message. Please try again later.",
    });
  }
};
