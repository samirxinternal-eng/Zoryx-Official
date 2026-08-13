// Run with: npm run seed:fake
// Populates the leaderboard (Tasks / Invites / Weekly tabs) with realistic
// looking fake accounts so the Rank page never looks empty for a new bot.
require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
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

async function run() {
  await mongoose.connect(MONGODB_URI);
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
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
