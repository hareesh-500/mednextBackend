const nodemailer = require("nodemailer");

var sendEmail = function (toEmail, subject, messageBody, attachmentData) {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: subject,
            html: messageBody,
            attachments: attachmentData,
        };

        let info = transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
};


module.exports.sendEmail = sendEmail;
