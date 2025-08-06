const nodemailer = require('nodemailer');

// Email template for OTP
const getOTPEmailTemplate = (otpCode) => {
  return `
AttendAI OTP Code

Hey there,

Here is your one-time password (OTP) to reset your AttendAI account:

${otpCode}

This code is valid for the next 1 minute.

Never share this code with anyone—even if they claim to be from AttendAI.t is

If you didn't request this, you can safely ignore this message.

Stay smart. Stay secure.
– The AttendAI Team
  `;
};

// Create Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password, not regular password
    }
  });
};

// Send OTP email
const sendOTPEmail = async (toEmail, otpCode) => {
  try {
    // Check if Gmail credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Gmail credentials not configured. OTP would be sent to:', toEmail);
      console.log('OTP Code:', otpCode);
      return {
        success: true,
        message: 'Gmail credentials not configured. OTP logged to console.',
        otp: otpCode
      };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `AttendAI <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'AttendAI OTP Code',
      text: getOTPEmailTemplate(otpCode),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #9886fe; margin: 0;">AttendAI OTP Code</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Hey there,</p>
            <p style="margin: 0 0 20px 0; font-size: 16px;">Here is your one-time password (OTP) to reset your AttendAI account:</p>
            
            <div style="background-color: #9886fe; color: white; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <h2 style="margin: 0; font-size: 24px; letter-spacing: 3px;">${otpCode}</h2>
            </div>
            
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">This code is valid for the next 1 minute.</p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone—even if they claim to be from AttendAI.
            </p>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #0c5460;">
              If you didn't request this, you can safely ignore this message.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              Stay smart. Stay secure.<br>
              – The AttendAI Team
            </p>
          </div>
        </div>
      `,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      message: 'OTP email sent successfully',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error.message
    };
  }
};

module.exports = {
  sendOTPEmail,
  getOTPEmailTemplate
}; 