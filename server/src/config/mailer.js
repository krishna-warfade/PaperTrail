const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `"PaperTrail" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  return await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
