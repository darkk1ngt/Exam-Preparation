import nodemailer from 'nodemailer';

/* Validate email format */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/* Validate password strength */
export function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(password);
}

/* Format date as YYYY-MM-DD */
export function formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

/* Shared email transporter — created once at module load */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

/* Send email helper — logs to console in dev when credentials are absent */
export async function sendEmail(to, subject, html) {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[Email would be sent to ${to}] ${subject}`);
            return true;
        }
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}
