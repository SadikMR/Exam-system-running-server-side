const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false for TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must be an App Password
  },
});
const sendInvitationEmail = async (to, invitationLink, role = "admin") => {
  const mailOptions = {
    from: '"Exam Desk" <no-reply@examdesk.com>',
    to,
    subject: "Invitation to Join Exam Desk",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Exam Desk</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            You have been invited to join the <strong>Exam Desk</strong> as an <strong style="color: #667eea; text-transform: capitalize;">${role}</strong>.
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

const sendPasswordResetCode = async (to, code, username) => {
  const mailOptions = {
    from: `Exam Desk <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hello <strong>${username}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            We received a request to reset your password. Use the verification code below to proceed:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
              <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </p>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; margin-bottom: 10px;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            If you did not request a password reset, please ignore this email.<br>
            Your password will remain unchanged.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendEmailVerificationCode = async (to, code, username) => {
  const mailOptions = {
    from: `Exam Desk <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Exam Desk!</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hello <strong>${username}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Thank you for registering! Please verify your email address using the code below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
              <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </p>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; margin-bottom: 10px;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            If you did not create an account, please ignore this email.<br>
            Your email address will not be registered.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendExamReminderEmail = async (to, username, examTitle, startTime) => {
  const formattedTime = new Date(startTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const mailOptions = {
    from: `ExamDesk <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏰ Reminder: "${examTitle}" starts in 1 hour!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Exam Reminder</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">ExamDesk</p>
        </div>

        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hello <strong>${username}</strong>,
          </p>

          <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">
            Your upcoming exam starts in <strong style="color: #059669;">1 hour!</strong>
          </p>

          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px; padding: 20px; margin: 24px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #065f46; margin: 0 0 8px 0;">${examTitle}</p>
            <p style="font-size: 14px; color: #374151; margin: 0;">🗓️ <strong>Starts at:</strong> ${formattedTime}</p>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
            Make sure you are verified and registered before the exam begins!
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/exams"
               style="background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Go to Exams
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            You set this reminder from ExamDesk.<br>
            If you no longer want reminders, you can remove them from the exam list.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendInvitationEmail, sendPasswordResetCode, sendEmailVerificationCode, sendExamReminderEmail };
