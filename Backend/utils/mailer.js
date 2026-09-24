const { MailtrapClient } = require("mailtrap");

const client = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Salon OS",
};

async function sendResetEmail(toEmail, resetToken) {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

  await client.send({
    from: sender,
    to: [{ email: toEmail }],
    subject: "Reset your Salon OS password",
    html: `<p>Click the link below to reset your password. This link expires in 15 minutes.</p>
           <p><a href="${resetLink}">${resetLink}</a></p>`,
    category: "Password Reset",
  });
}

module.exports = sendResetEmail;
