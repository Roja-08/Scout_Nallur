const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
    pass: process.env.EMAIL_PASS || 'ario soql eeqq ydgj',
  },
});

async function sendEmail({ to, subject, text, html, attachments }) {
  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || 'Scout'} <${process.env.SMTP_FROM_EMAIL || 'keerthiganthevarasa@gmail.com'}>`,
    to,
    subject,
    text,
    html,
    attachments,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail; 