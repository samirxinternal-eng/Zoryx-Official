// Run with: npm run seed:fake
// Populates the leaderboard (Tasks / Invites / Weekly tabs) with realistic
// looking fake accounts so the Rank page never looks empty for a new bot.
require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
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

function randomFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}
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

// randomuser.me থেকে real-looking human face photo সংগ্রহ করা হয়
function fetchRandomUsers(count) {
  return new Promise((resolve, reject) => {
    https.get(
      `https://randomuser.me/api/?results=${count}&inc=picture&noinfo`,
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.results);
          } catch (err) {
            reject(err);
          }
        });
      }
    ).on('error', reject);
  });
}

const FAKE_NAMES = buildFakeNames(100);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB, fetching real-looking profile photos...');

  const randomUsers = await fetchRandomUsers(FAKE_NAMES.length);
  console.log('Photos fetched, seeding fake leaderboard users...');

  const currentWeekKey = getWeekKey();

  for (let i = 0; i < FAKE_NAMES.length; i++) {
    const name = FAKE_NAMES[i];
    const telegramId = `fake_${1000 + i}`;
    const balanceUSDT = randomFloat(264.08, 3964.43, 2);   // Tasks tab
    const referralCount = randomInt(56, 20000);              // Invites tab — পূর্ণ সংখ্যা
    const weeklyUSDT = randomFloat(64.39, 17000, 2);         // Weekly tab (resets every Monday)
    const photoUrl = randomUsers[i]?.picture?.large || '';

    await User.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        firstName: name,
        username: name.toLowerCase().replace(/\s+/g, '_'),
        balanceUSDT,
        referralCount,
        weeklyUSDT,
        weeklyWeekKey: currentWeekKey,
        isFake: true,
        language: 'en',
        photoUrl,
      },
      { upsert: true }
    );
  }

  console.log(`✅ Seeded ${FAKE_NAMES.length} fake leaderboard users with real-looking photos (Tasks / Invites / Weekly).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
