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

// Different DiceBear illustrated/styled avatar sets — gives visual variety
const DICEBEAR_STYLES = [
  'avataaars', 'bottts', 'pixel-art', 'personas', 'micah',
  'notionists', 'adventurer', 'big-smile', 'fun-emoji', 'lorelei',
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

// Fetch real human face photos from randomuser.me
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

// Randomly pick either a real face OR a styled/illustrated avatar
function pickRandomAvatar(telegramId, realFacePool) {
  const useRealFace = Math.random() < 0.5 && realFacePool.length > 0;
  if (useRealFace) {
    const idx = randomInt(0, realFacePool.length - 1);
    return realFacePool.splice(idx, 1)[0].picture.large;
  }
  const style = DICEBEAR_STYLES[randomInt(0, DICEBEAR_STYLES.length - 1)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(telegramId)}`;
}

const FAKE_NAMES = buildFakeNames(100);

async function run() {
  // If this script is required from inside the already-running app (e.g. via a temp
  // admin route), mongoose is already connected — reuse that connection and don't
  // disconnect it afterwards, or we'd kill the live app's database connection.
  const alreadyConnected = mongoose.connection.readyState === 1;
  if (!alreadyConnected) {
    await mongoose.connect(MONGODB_URI);
  }
  console.log('Connected to MongoDB, fetching a pool of real profile photos...');

  const realFacePool = await fetchRandomUsers(FAKE_NAMES.length);
  console.log('Photos fetched, seeding fake leaderboard users with mixed avatar styles...');

  const currentWeekKey = getWeekKey();

  for (let i = 0; i < FAKE_NAMES.length; i++) {
    const name = FAKE_NAMES[i];
    const telegramId = `fake_${1000 + i}`;
    const balanceUSDT = randomFloat(5, 950, 2);      // Tasks tab (total USDT earned)
    const referralCount = randomInt(5, 900);          // Invites tab
    const weeklyUSDT = randomFloat(1, 60, 2);         // Weekly tab (resets every Monday)
    const photoUrl = pickRandomAvatar(telegramId, realFacePool);

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

  console.log(`✅ Seeded ${FAKE_NAMES.length} fake leaderboard users with mixed avatar styles (Tasks / Invites / Weekly).`);

  // Only disconnect if we opened the connection ourselves (i.e. running standalone via `npm run seed:fake`)
  if (!alreadyConnected) {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error('Seed failed:', err);
});
