import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * MongoDB Atlas Connection
 * এটি সার্ভার চালু হওয়ার সময় ডাটাবেসের সাথে কানেকশন তৈরি করবে।
 */
export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables.");
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        // ডাটাবেস কানেক্ট না হলে প্রজেক্ট বন্ধ করে দেওয়া হবে
        process.exit(1); 
    }
};

/**
 * User Schema Definition
 * আপনার দেওয়া নির্দিষ্ট ফিল্ডগুলো এখানে ডিফাইন করা হয়েছে।
 * { timestamps: true } স্বয়ংক্রিয়ভাবে createdAt এবং updatedAt তৈরি করবে।
 */
const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    username: { type: String, default: '' },
    photo: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    energy: { type: Number, default: 1000 },
    maxEnergy: { type: Number, default: 1000 },
    totalTap: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    referrals: { type: [String], default: [] },
    referredBy: { type: String, default: null },
    lastDailyReward: { type: Date, default: null }
}, { 
    timestamps: true, 
    strict: false // Task বা Spin-এর মতো ডায়নামিক ডেটা হ্যান্ডেল করার জন্য
});

export const User = mongoose.model('User', userSchema);
