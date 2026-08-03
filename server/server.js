import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './database.js';
import apiRoutes from './routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// API Routes
app.use('/api', apiRoutes);

// Client Folder Serve (Frontend)
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// Fallback Route for SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Zoryx Server is running on port ${PORT}`);
});
