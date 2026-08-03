import crypto from 'crypto';

/**
 * Telegram WebApp initData ভ্যালিডেশন করার ফাংশন।
 * এটি Telegram Bot Token ব্যবহার করে ক্লায়েন্ট থেকে আসা ডেটার অথেনটিসিটি নিশ্চিত করে।
 * 
 * @param {string} initData - Telegram WebApp.initData স্ট্রিং
 * @param {string} botToken - আপনার Telegram Bot API Token
 * @returns {boolean} - ভ্যালিড হলে true, অন্যথায় false
 */
export const validateTelegramData = (initData, botToken) => {
    try {
        if (!initData || !botToken) return false;

        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        
        if (!hash) return false;
        
        urlParams.delete('hash');

        // প্যারামিটারগুলো আলফাবেটিক্যালি সর্ট করে ডেটাস্টিং তৈরি করা
        const dataCheckString = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Telegram WebApp রুল অনুযায়ী সিক্রেট কি জেনারেট করা
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        
        // হ্যাশ ক্যালকুলেট করে মেলানো
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        return calculatedHash === hash;
    } catch (error) {
        console.error("❌ Telegram Data Validation Error:", error.message);
        return false;
    }
};

/**
 * Express Middleware: সুরক্ষিত রুটগুলোর জন্য অথেন্টিকেশন চেক করার মিডলওয়্যার।
 * এটি হেডার থেকে initData অথবা টোকেন চেক করে রিকোয়েস্ট পাস বা ব্লক করবে।
 */
export const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const initData = authHeader.split(' ')[1];
        const botToken = process.env.BOT_TOKEN;

        // ডেভেলপমেন্ট বা লোকাল টেস্টের সুবিধার জন্য টোকেন না থাকলে বাইপাস করা যেতে পারে,
        // তবে প্রোডাকশনে অবশ্যই ভ্যালিডেশন চেক হবে।
        if (botToken && process.env.NODE_ENV === 'production') {
            const isValid = validateTelegramData(initData, botToken);
            if (!isValid) {
                return res.status(403).json({ success: false, message: 'Forbidden: Invalid Telegram signature' });
            }
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Auth Error: ' + error.message });
    }
};
