// ==========================================
// Zoryx Telegram WebApp
// server/server.js
// ==========================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDatabase from "./database.js";
import routes from "./routes.js";


// ==========================================
// Config
// ==========================================

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;


// ==========================================
// Path Setup
// ==========================================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const clientPath = path.join(__dirname, "../client");


// ==========================================
// Middleware
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(morgan("dev"));


// ==========================================
// Database
// ==========================================

connectDatabase();


// ==========================================
// API Routes
// ==========================================

app.use("/api", routes);


// ==========================================
// Static Client
// ==========================================

app.use(express.static(clientPath));


// ==========================================
// Frontend Route
// ==========================================

app.get("/*splat", (req, res) => {

    res.sendFile(
        path.join(clientPath, "index.html")
    );

});


// ==========================================
// Error Handler
// ==========================================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });

});


// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {

    console.log(`
========================================
🚀 Zoryx Server Running
🌐 Port : ${PORT}
========================================
`);

});
