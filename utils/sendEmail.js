const nodemailer = require("nodemailer");

const sendMail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // send mail with defined transport object
    const message = {
        from: `${process.env.FROM_EMAIL} ${process.env.FROM_NAME}`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
};

module.exports = sendMail;