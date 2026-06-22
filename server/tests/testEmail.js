require('dotenv').config();
const sendMail = require('../src/config/mailer');

async function test() {
  console.log("Attempting to send a test email...");
  console.log("Email user:", process.env.EMAIL_USER);
  try {
    const targetEmail = process.env.EMAIL_USER || 'test@example.com';
    const result = await sendMail(
      targetEmail,
      'Test Email from PaperTrail',
      '<p>This is a test email sent from the test script.</p>'
    );
    console.log("Email sent successfully!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Email sending failed!");
    console.error(error);
  }
}

test();
