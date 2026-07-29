import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDatabase from "./database.js";
import routes from "./routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===========================
// Middleware
// ===========================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// ===========================
// Database
// ===========================

connectDatabase();

// ===========================
// API
// ===========================

app.use("/api", routes);

// ===========================
// Static Client
// ===========================

const clientPath = path.join(__dirname, "../client");

app.use(express.static(clientPath));

// ===========================
// Home
// ===========================

app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
});

// ===========================
// Start Server
// ===========================

app.listen(PORT, () => {
    console.log(`
========================================
🚀 Zoryx Server Running
🌐 Port : ${PORT}
========================================
`);
});
