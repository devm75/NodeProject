const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // steps for sending emails.

  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options

  const mailOptions = {
    from: 'Mohan Dev <bhardwaj1206409@gmail.com>',
    to: options.email,
    text: options.message,
    subject: options.subject,
    // html
  };

  // 3. Actually send the email

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
