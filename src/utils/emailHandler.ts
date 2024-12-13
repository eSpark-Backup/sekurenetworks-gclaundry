
import * as sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}


export const sendEmail = async (msg: EmailOptions) => {
    await sgMail.send({from:process.env.EMAIL_FROM,...msg});
}