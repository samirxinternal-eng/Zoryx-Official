// ==========================================
// Zoryx Telegram Mini App
// server/database.js
// ==========================================

"use strict";

import mongoose from "mongoose";

let connected = false;

// ==========================================
// Connect Database
// ==========================================

export async function connectDatabase() {

    if (connected) {

        return mongoose.connection;

    }

    try {

        const uri = process.env.MONGODB_URI;

        if (!uri) {

            throw new Error(
                "MONGODB_URI is missing in .env"
            );

        }

        await mongoose.connect(uri, {

            autoIndex: true,

            maxPoolSize: 10,

            serverSelectionTimeoutMS: 5000,

            socketTimeoutMS: 45000

        });

        connected = true;

        console.log("✅ MongoDB Connected");

        return mongoose.connection;

    }

    catch (error) {

        connected = false;

        console.error(
            "❌ MongoDB Connection Failed"
        );

        console.error(error);

        process.exit(1);

    }

}

// ==========================================
// User Schema
// ==========================================

const UserSchema = new mongoose.Schema({

    telegramId: {

        type: Number,

        required: true,

        unique: true,

        index: true

    },

    firstName: {

        type: String,

        default: ""

    },

    lastName: {

        type: String,

        default: ""

    },

    username: {

        type: String,

        default: ""

    },

    photo: {

        type: String,

        default: ""

    },

    balance: {

        type: Number,

        default: 0

    },

    energy: {

        type: Number,

        default: 1000

    },

    maxEnergy: {

        type: Number,

        default: 1000

    },

    totalTap: {

        type: Number,

        default: 0

    },

    level: {

        type: Number,

        default: 1

    },

    xp: {

        type: Number,

        default: 0

    },

    referrals: {

        type: Number,

        default: 0

    },

    referredBy: {

        type: Number,

        default: 0

    },

    lastDailyReward: {

        type: Date,

        default: null

    }

}, {

    timestamps: true

});

// ==========================================
// Models
// ==========================================

export const User =

    mongoose.models.User ||

    mongoose.model(

        "User",

        UserSchema

    );

// ==========================================
// Initialize
// ==========================================

export async function initializeDatabase() {

    await connectDatabase();

    console.log(

        "✅ Database Initialized"

    );

}

// ==========================================
// Export Default
// ==========================================

export default {

    connectDatabase,

    initializeDatabase,

    User

};
