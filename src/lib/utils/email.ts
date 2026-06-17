import nodemailer from "nodemailer";

interface Subscriber {
  email: string;
}

export async function sendNewPostNotificationEmail(
  postTitle: string,
  postUrl: string,
  subscribers: Subscriber[]
) {
  if (subscribers.length === 0) return;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  // If no SMTP config is provided, just log it (useful for local development)
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`\n[EMAIL MOCK] Would send new post notification to ${subscribers.length} subscribers.`);
    console.log(`[EMAIL MOCK] Post Title: ${postTitle}`);
    console.log(`[EMAIL MOCK] Post URL: ${postUrl}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587"),
    secure: SMTP_PORT === "465",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const fromEmail = SMTP_FROM || '"PIXO Blog" <noreply@pixoblog.com>';

  const emailPromises = subscribers.map((sub) => {
    return transporter.sendMail({
      from: fromEmail,
      to: sub.email,
      subject: `New Post: ${postTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">A new post was just published!</h1>
          <p style="font-size: 16px; color: #555;">
            Read the latest article: <strong>${postTitle}</strong>
          </p>
          <a href="${postUrl}" style="display: inline-block; padding: 12px 24px; background-color: #e8a023; color: #000; text-decoration: none; font-weight: bold; border-radius: 8px; margin-top: 20px;">
            Read Now
          </a>
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #eaeaea;" />
          <p style="font-size: 12px; color: #999;">
            You are receiving this email because you subscribed to our newsletter.
          </p>
        </div>
      `,
    }).catch(err => {
      console.error(`Failed to send email to ${sub.email}:`, err);
    });
  });

  await Promise.all(emailPromises);
}
