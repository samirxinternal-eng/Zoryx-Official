require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const bot = require('./bot/bot');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

// Telegram sends updates here
app.use(bot.webhookCallback('/webhook'));

// Mini App talks to these
app.use('/api', apiRoutes);

// The Mini App itself
app.use(express.static(path.join(__dirname, 'public')));

// Ping target for UptimeRobot, keeps the free Render instance awake
app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);
    console.log('✅ Telegram webhook set');
  } catch (err) {
    console.error('❌ Could not set webhook:', err.message);
  }
});
