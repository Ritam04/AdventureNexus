import { Resend } from 'resend';
import { config } from '../config/config';

let resend: Resend | null = null;

const getResendClient = () => {
    if (!resend) {
        const apiKey = config.RESEND_API_KEY || process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error("Missing Resend API Key. Please configure RESEND_API_KEY in your env file.");
        }
        resend = new Resend(apiKey);
    }
    return resend;
};

interface MailData {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        content: Buffer | string;
        filename: string;
        contentType?: string;
    }>;
}

/**
 * Modern promise-based email sender using Resend.
 */
export const sendEmail = async ({ to, subject, html, attachments }: MailData) => {
    try {
        const client = getResendClient();
        const response = await client.emails.send({
            from: `AdventureNexus <${config.EMAIL_FROM || process.env.EMAIL_FROM || 'noreply@samiransamanta.in'}>`,
            to,
            subject,
            html,
            attachments
        });
        return response;
    } catch (error) {
        console.error('Email Error:', error);
        throw error;
    }
};

/**
 * Backward-compatible callback-based email sender.
 */
const sendMail = async (
    data: MailData,
    callback: (error: Error | null, response: any | null) => void
) => {
    try {
        const response = await sendEmail(data);
        callback(null, response);
    } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)), null);
    }
};

export default sendMail;
