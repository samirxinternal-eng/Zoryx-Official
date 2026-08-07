// Run with: npm run seed:fake
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { MONGODB_URI } = require('../src/config');

const FAKE_NAMES = [
  'Arif Hasan', 'Nusrat Jahan', 'Rakibul Islam', 'Sadia Afrin', 'Tanvir Ahmed',
  'Farhana Akter', 'Mahmudul Hasan', 'Sumaiya Islam', 'Rafiul Karim', 'Jannatul Ferdous',
  'Aditya Sharma', 'Priya Verma', 'Rahul Khan', 'Ayesha Siddiqui', 'Omar Farooq',
  'Fatima Zahra', 'John Smith', 'Emily Clark', 'David Lee', 'Sophia Turner',
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB, seeding fake leaderboard users...');

  for (let i = 0; i < FAKE_NAMES.length; i++) {
    const name = FAKE_NAMES[i];
    const telegramId = `fake_${1000 + i}`;
    const coins = Math.floor(Math.random() * 9000) + 500; // 500 - 9500

    await User.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        firstName: name,
        username: name.toLowerCase().replace(/\s+/g, '_'),
        coins,
        isFake: true,
        language: 'en',
      },
      { upsert: true }
    );
  }

  console.log(`✅ Seeded ${FAKE_NAMES.length} fake leaderboard users.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
