/**
 * Telegram WebApp SDK Initialization and User Profile Handler
 */

export function initTelegramWebApp() {
    const tg = window.Telegram?.WebApp;

    if (tg) {
        // Telegram WebApp এক্সপ্যান্ড করে ফুল স্ক্রিন করা
        tg.ready();
        tg.expand();
        
        // হেডার কালার টেলিগ্রাম থিমের সাথে ম্যাচ করা
        if (tg.setHeaderColor) {
            tg.setHeaderColor('#090d16');
        }
    }

    return tg;
}

/**
 * Telegram থেকে ইউজারের ইনফো এবং প্রোফাইল পিকচার/ইনিশিয়াল রেন্ডার করা
 */
export function getTelegramUserData() {
    const tg = window.Telegram?.WebApp;
    const initDataUnsafe = tg?.initDataUnsafe;

    // যদি টেলিগ্রাম এনভায়রনমেন্ট না থাকে (যেমন ব্রাউজারে লোকাল টেস্টের সময়), 
    // তবে একটি ডিফল্ট টেস্ট ইউজার অবজেক্ট রিটার্ন করা হবে।
    if (!initDataUnsafe || !initDataUnsafe.user) {
        console.warn("⚠️ Running outside Telegram environment. Using fallback test user.");
        return {
            id: "123456789",
            first_name: "Adnan",
            last_name: "Developer",
            username: "adnan_dev",
            photo_url: ""
        };
    }

    return initDataUnsafe.user;
}

/**
 * ইউজার অবতার এবং নাম UI-তে রেন্ডার করার ফাংশন
 * নিয়ম অনুযায়ী: ছবি না থাকলে নামের প্রথম অক্ষর (Initial) দিয়ে ডায়নামিক অবতার তৈরি হবে।
 */
export function renderUserProfile(user) {
    const nameElement = document.getElementById('user-name');
    const avatarContainer = document.getElementById('user-avatar-container');

    if (!nameElement || !avatarContainer) return;

    // ইউজার নাম সেট করা
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Zoryx Player';
    nameElement.textContent = fullName;

    // অবতার কন্টেইনার ক্লিয়ার করা
    avatarContainer.innerHTML = '';

    if (user.photo_url) {
        // টেলিগ্রাম প্রোফাইল পিকচার থাকলে তা রেন্ডার করা
        const img = document.createElement('img');
        img.src = user.photo_url;
        img.alt = fullName;
        avatarContainer.appendChild(img);
    } else {
        // ছবি না থাকলে নামের প্রথম অক্ষর (Initial) দিয়ে হ্যান্ডেল করা
        const initial = fullName.charAt(0).toUpperCase();
        avatarContainer.textContent = initial;
    }
}
