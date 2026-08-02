// ==========================================
// Zoryx Telegram Mini App
// server/server.js
// Production Version 2.0
// Part 1
// ==========================================

"use strict";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import router from "./routes.js";
import {
    connectDatabase,
    initializeDatabase
} from "./database.js";

// ==========================================
// Environment
// ==========================================

dotenv.config();

// ==========================================
// Paths
// ==========================================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const CLIENT_DIR = path.join(
    __dirname,
    "..",
    "client"
);

// ==========================================
// Express App
// ==========================================

const app = express();

// ==========================================
// Configuration
// ==========================================

const PORT = Number(
    process.env.PORT || 10000
);

const NODE_ENV =
    process.env.NODE_ENV ||
    "development";

// ==========================================
// Trust Proxy
// ==========================================

app.set(
    "trust proxy",
    true
);

// ==========================================
// Middlewares
// ==========================================

app.use(cors({

    origin: true,

    credentials: true

}));

app.use(express.json({

    limit: "10mb"

}));

app.use(express.urlencoded({

    extended: true,

    limit: "10mb"

}));

app.use(morgan("dev"));

// ==========================================
// Static Files
// ==========================================

app.use(

    express.static(CLIENT_DIR, {

        extensions: [

            "html"

        ],

        maxAge: "1d",

        etag: true

    })

);

// ==========================================
// Basic Health Check
// ==========================================

app.get("/health", (req, res) => {

    return res.json({

        success: true,

        status: "OK",

        environment: NODE_ENV,

        uptime: process.uptime(),

        timestamp: Date.now()

    });

});


// ==========================================
// Initialize Database
// ==========================================

await initializeDatabase();

await connectDatabase();


// ==========================================
// API Routes
// ==========================================

app.use(

    "/",

    router

);


// ==========================================
// SPA Fallback
// ==========================================

app.get("*", (req, res) => {

    res.sendFile(

        path.join(

            CLIENT_DIR,

            "index.html"

        )

    );

});


// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {

    return res.status(404).json({

        success: false,

        message: "Route Not Found"

    });

});


// ==========================================
// Global Error Handler
// ==========================================

app.use((err, req, res, next) => {

    console.error(

        "Server Error:",

        err

    );

    return res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });

});
