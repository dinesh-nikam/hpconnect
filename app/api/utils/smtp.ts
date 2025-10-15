import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailhostbox.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  requireTLS: true,
  logger: true,
  debug: true,
});

export async function testSMTPConnection() {
  try {
    await transporter.verify();
    console.log('SMTP connection successful');
  } catch (error) {
    console.error('SMTP connection failed:', error);
  }
}

export { transporter };