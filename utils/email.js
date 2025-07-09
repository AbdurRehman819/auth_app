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

    // 🔥 Dynamically construct the verification link using token
    const verificationLink = `https://auth-app-szvj.onrender.com/user/verifyEmail/${verificationToken}`;

    // Email content
    const mailOptions = {
        from: process.env.Email_User,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click the link to verify your email:</p>
               <a href="${verificationLink}">${verificationLink}</a>`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmailVerification;
