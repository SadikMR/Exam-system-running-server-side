const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Ensure you use an App Password if needed
  },
});

const sendInvitationEmail = async (to, invitationLink, role = "admin") => {
  const mailOptions = {
    from: `Online Exam System <${process.env.EMAIL_USER}>`,
    to,
    subject: "Invitation to Join Online Exam System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Online Exam System</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            You have been invited to join the <strong>Online Exam System</strong> as an <strong style="color: #667eea; text-transform: capitalize;">${role}</strong>.
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
            Click the button below to complete your registration:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" 
               style="background-color: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
              Complete Registration
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; margin-bottom: 10px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="font-size: 14px; color: #667eea; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px;">
            ${invitationLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            This invitation link will expire in 24 hours.<br>
            If you did not expect this invitation, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendInvitationEmail };
