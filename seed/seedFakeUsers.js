// Run with: npm run seed:fake
// Populates the leaderboard (Tasks / Invites / Weekly tabs) with realistic
// looking fake accounts so the Rank page never looks empty for a new bot.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { MONGODB_URI } = require('../src/config');
const { getWeekKey } = require('../src/utils/economy');

const FAKE_NAMES = [
  'Arif Hasan', 'Nusrat Jahan', 'Rakibul Islam', 'Sadia Afrin', 'Tanvir Ahmed',
  'Farhana Akter', 'Mahmudul Hasan', 'Sumaiya Islam', 'Rafiul Karim', 'Jannatul Ferdous',
  'Aditya Sharma', 'Priya Verma', 'Rahul Khan', 'Ayesha Siddiqui', 'Omar Farooq',
  'Fatima Zahra', 'John Smith', 'Emily Clark', 'David Lee', 'Sophia Turner',
  'Mizanur Rahman', 'Taslima Begum', 'Shakib Al Hasan', 'Nabila Noor', 'Imran Chowdhury',
  'Ritu Paul', 'Kamal Uddin', 'Shirin Akhter', 'Mahin Rahman', 'Anika Tabassum',
  'Yusuf Ali', 'Zainab Khatun', 'Habibur Rahman', 'Marium Akter', 'Rezaul Karim',
  'Nadia Islam', 'Saiful Islam', 'Tania Sultana', 'Faisal Ahmed', 'Lubna Yasmin',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB, seeding fake leaderboard users...');

  const currentWeekKey = getWeekKey();

  for (let i = 0; i < FAKE_NAMES.length; i++) {
    const name = FAKE_NAMES[i];
    const telegramId = `fake_${1000 + i}`;
    const coins = randomInt(500, 95000);       // Tasks tab (total ZX earned)
    const referralCount = randomInt(5, 900);    // Invites tab
    const weeklyCoins = randomInt(50, 3000);    // Weekly tab (resets every Monday)

    await User.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        firstName: name,
        username: name.toLowerCase().replace(/\s+/g, '_'),
        coins,
        referralCount,
        weeklyCoins,
        weeklyWeekKey: currentWeekKey,
        isFake: true,
        language: 'en',
      },
      { upsert: true }
    );
  }

  console.log(`✅ Seeded ${FAKE_NAMES.length} fake leaderboard users (Tasks / Invites / Weekly).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
