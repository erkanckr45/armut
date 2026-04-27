import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMessageNotification(to: string, senderName: string, jobTitle: string, message: string, jobId: string) {
  if (!to || !process.env.EMAIL_USER) return;

  try {
    await transporter.sendMail({
      from: `"Armut Clone" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `📩 Yeni mesajınız var - ${jobTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📩 Yeni Mesaj</h2>
          <p><strong>${senderName}</strong> size bir mesaj gönderdi:</p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 10px; margin: 15px 0;">
            "${message}"
          </div>
          <p>İş: <strong>${jobTitle}</strong></p>
          <p><a href="${process.env.NEXTAUTH_URL}/mesajlar/${jobId}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Mesajları Gör</a></p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Mail gönderme hatası:', error);
  }
}