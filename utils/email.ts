import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ravatkar@gmail.com',
        pass: 'Venkat@123'
    }
});

export const sendEmail = (to: string, subject: string, text: string) => {
    return transporter.sendMail({
        from: 'ravatkar@gmail.com',
        to,
        subject,
        text
    });
};
