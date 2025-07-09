const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmailVerification = async (email, verificationToken) => {
    // Create the transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Email_User,
            pass: process.env.Email_Password
        }
    });

    const verificationLink = `https://auth-app-szvj.onrender.com/user/verifyEmail/${verificationToken}`;

    // Email content
    const mailOptions = {
    from: process.env.Email_User,
    to: email,
    subject: 'Verify Your Email',
    html: `<a href="${verificationLink}" style="padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 4px;">Click here to verify</a>`
};

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmailVerification;
