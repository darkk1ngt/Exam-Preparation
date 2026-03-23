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

/* Normalize UK phone into +44XXXXXXXXXX format */
export function normalizeUkPhone(phone) {
    const compact = String(phone || '').trim().replace(/[^\d+]/g, '');
    if (!compact) return '';

    if (compact.startsWith('+44')) {
        const rest = compact.slice(3).replace(/\D/g, '');
        return rest.length === 10 ? `+44${rest}` : '';
    }

    const digits = compact.replace(/\D/g, '');
    if (digits.startsWith('44') && digits.length === 12) {
        return `+44${digits.slice(2)}`;
    }

    if (digits.startsWith('0') && digits.length === 11) {
        return `+44${digits.slice(1)}`;
    }

    if (digits.length === 10 && digits.startsWith('7')) {
        return `+44${digits}`;
    }

    return '';
}

/* Validate UK phone in local or +44 format */
export function isValidUkPhone(phone) {
    return !!normalizeUkPhone(phone);
}

/* Normalize UK postcode to uppercase with inward space, e.g. GL11AA -> GL1 1AA */
export function normalizeUkPostcode(postcode) {
    const compact = String(postcode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (compact.length < 5 || compact.length > 7) return '';

    const formatted = `${compact.slice(0, -3)} ${compact.slice(-3)}`;
    const postcodeRegex = /^(GIR 0AA|[A-PR-UWYZ][A-HK-Y]?\d[\dA-HJKSTUW]? \d[ABD-HJLNP-UW-Z]{2})$/;
    return postcodeRegex.test(formatted) ? formatted : '';
}

/* Validate UK postcode in common user-entered forms */
export function isValidUkPostcode(postcode) {
    return !!normalizeUkPostcode(postcode);
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
            const linkMatch = html.match(/href="([^"]+)"/);
            if (linkMatch) console.log(`[Dev reset link] ${linkMatch[1]}`);
            return true;
        }
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}
