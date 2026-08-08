require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { MONGODB_URI } = require('../src/config');
const { getWeekKey } = require('../src/utils/economy');

const FIRST_NAMES = [
  'Arif', 'Nusrat', 'Rakibul', 'Sadia', 'Tanvir', 'Farhana', 'Mahmudul', 'Sumaiya',
  'Rafiul', 'Jannatul', 'Aditya', 'Priya', 'Rahul', 'Ayesha', 'Omar', 'Fatima',
  'John', 'Emily', 'David', 'Sophia', 'Mizanur', 'Taslima', 'Shakib', 'Nabila',
  'Imran', 'Ritu', 'Kamal', 'Shirin', 'Mahin', 'Anika', 'Yusuf', 'Zainab',
  'Habibur', 'Marium', 'Rezaul', 'Nadia', 'Saiful', 'Tania', 'Faisal', 'Lubna',
];

const LAST_NAMES = [
  'Hasan', 'Jahan', 'Islam', 'Afrin', 'Ahmed', 'Akter', 'Karim', 'Rahman',
  'Chowdhury', 'Khan', 'Siddiqui', 'Farooq', 'Zahra', 'Smith', 'Clark', 'Lee',
  'Turner', 'Begum', 'Al Hasan', 'Noor',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildFakeNames(count) {
  const names = new Set();
  while (names.size < count) {
    const f = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
    const l = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];
    names.add(`${f} ${l}`);
  }
  return Array.from(names);
}

const FAKE_NAMES = buildFakeNames(100);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB, seeding fake leaderboard users...');

  const currentWeekKey = getWeekKey();

  for (let i = 0; i < FAKE_NAMES.length; i++) {
    const name = FAKE_NAMES[i];
    const telegramId = `fake_${1000 + i}`;
    const coins = randomInt(500, 95000);
    const referralCount = randomInt(5, 900);
    const weeklyCoins = randomInt(50, 3000);
    const photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(telegramId)}`;

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
        photoUrl,
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
