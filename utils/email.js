const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to,subject, htmlContent) => {
    // Create the transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Email_User,
            pass: process.env.Email_Password
        }
    });


    // Email content
    const mailOptions = {
    from: process.env.Email_User,
    to:to,
    subject:subject,
    html:htmlContent
};

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
