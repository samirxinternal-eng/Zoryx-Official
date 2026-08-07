# ⚡ ZORY X BOT

Telegram Earning Bot + Mini App — Tasks, Referrals, Leaderboard, Multi-language, Ads.
Stack: **Node.js (Telegraf + Express) + MongoDB + GitHub + Render**.

---

## ✨ Features

- **/start** — welcome message + language picker (Bangla / English / Hindi / Arabic) + "Open App" button. This is the ONLY command regular users ever get a reply from.
- **/help** — shows the full admin command list. Silently ignored for normal users (no reply at all), and any other unknown command/text from a normal user is also silently ignored, exactly as requested.
- **/announcement** — admin sends a message, bot forwards it to every user who has ever started the bot.
- **/addadmin `<telegram_id>`** / **/removeadmin `<telegram_id>`** — owner-only, grants a user permission to add tasks & send announcements from the Mini App / bot.
- **/stats** — owner-only quick stats (users / admins / tasks).
- **Mini App** with 4 bottom tabs:
  - **Home** — Telegram name + profile photo, coin/energy/invite stats, quick actions.
  - **Earn** — task list (Go → Check flow), "Watch Ad" banner, and an **Add Task** button that is visible **only to admins**. Adding a task opens a bottom-sheet with a platform switcher (Telegram / Bot / Discord / YouTube / TikTok / Facebook / Twitter / Instagram / Website — icon changes per platform), Title, URL and Submit.
  - **Friends** — referral link with Copy + Share buttons. Sharing via Telegram's native share sheet automatically shows your bot's profile photo + bio as a rich preview, so no extra image handling is needed.
  - **Leaderboard** — top users by coins. Comes pre-seeded with realistic "fake" users (see below) so the board never looks empty.
- **Anti-cheat**: Telegram channel-join tasks are verified for real via `getChatMember` (bot must be added as admin of that channel). Tasks that point to platforms Telegram has no public verification API for (other bots, Discord, YouTube, TikTok, etc.) require the user to tap **Go** first and enforce a short minimum wait before **Check** succeeds — this isn't perfect (no method is, for third-party platforms) but it stops one-tap cheating.
- **Ad system**: "Watch Ad" button rewards coins + energy. Hook in your Monetag (or any) rewarded-ad script — see `MONETAG_ZONE_ID` below.
- **Multi-language**: bot messages AND the Mini App UI both support Bangla, English, Hindi, Arabic. Users can switch anytime from the 🌐 button top-right of the Mini App.

---

## 📁 Project Structure

```
zory-x-bot/
├── src/
│   ├── index.js              # Express server + Telegram webhook + static hosting
│   ├── config.js             # env config
│   ├── db.js                 # MongoDB connection
│   ├── bot/
│   │   ├── bot.js            # Telegraf bot setup
│   │   ├── keyboards.js      # inline keyboards
│   │   ├── commands/         # /start /help /announcement /addadmin ...
│   │   └── middlewares/      # admin permission checks
│   ├── models/                # User, Admin, Task, TaskCompletion (Mongoose)
│   ├── controllers/           # user & task API logic
│   ├── routes/api.js          # Mini App REST API
│   ├── locales/                # bot chat messages (bn/en/hi/ar)
│   └── utils/                 # Telegram initData validation, channel URL parsing
├── webapp/                    # Mini App frontend (vanilla HTML/CSS/JS)
│   ├── index.html
│   ├── css/style.css          # premium dark-gradient UI
│   ├── js/app.js
│   ├── js/i18n.js
│   └── locales/                # UI strings (bn/en/hi/ar)
├── seed/seedFakeUsers.js      # seeds the leaderboard with fake users
├── render.yaml
├── package.json
└── .env.example
```

---

## 🚀 Setup

### 1. Create the bot
Talk to [@BotFather](https://t.me/BotFather):
- `/newbot` → name it **ZORY X BOT**, choose a username (e.g. `ZoryXBot`).
- `/setmenubutton` or just rely on the inline "Open App" button already built into `/start`.
- To actually get a Mini App button in the chat's attachment menu too, use `/newapp` and point it at your Render URL once deployed (optional — the inline button already works without this).

### 2. MongoDB
Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas), whitelist `0.0.0.0/0` (or Render's IPs), grab the connection string.

### 3. Environment variables
Copy `.env.example` → `.env` and fill in:

```
BOT_TOKEN=...              # from BotFather
BOT_USERNAME=ZoryXBot
MONGODB_URI=...
ADMIN_IDS=your_telegram_numeric_id
WEBAPP_URL=https://your-app.onrender.com
WEBHOOK_DOMAIN=https://your-app.onrender.com
MONETAG_ZONE_ID=your_zone_id
```

> Get your numeric Telegram ID from [@userinfobot](https://t.me/userinfobot).

### 4. Run locally (optional)
```bash
npm install
npm start
```
Without `WEBHOOK_DOMAIN` set, the bot falls back to long-polling for local testing.

### 5. Deploy to Render
1. Push this project to a GitHub repo.
2. On [Render](https://render.com) → New → Blueprint → connect the repo (it will read `render.yaml` automatically), or create a Web Service manually with:
   - Build command: `npm install`
   - Start command: `npm start`
3. Add the environment variables from `.env.example` in Render's dashboard.
4. Once deployed, set `WEBAPP_URL` and `WEBHOOK_DOMAIN` to your actual Render URL and redeploy — the app registers the Telegram webhook automatically on boot.

### 6. Seed the leaderboard with fake users
```bash
npm run seed:fake
```
Run this once after your first deploy (or locally pointing at the same `MONGODB_URI`). Re-run any time to refresh the fake numbers.

### 7. Make yourself an admin & add tasks
Your `ADMIN_IDS` in `.env` are the **owner(s)** — full control automatically. Open the Mini App → **Earn** tab → you'll see a floating **+ Add Task** button that regular users never see. Use `/addadmin <telegram_id>` to promote helpers (they'll be able to add tasks + send announcements, but not add other admins).

### 8. Hook up real ads (Monetag)
In `webapp/index.html`, add your Monetag zone script tag (they'll give you an exact `<script>` snippet after you register your Mini App with them), and expose a `window.showMonetagRewardedAd()` function that resolves once the ad finishes — `app.js` already calls it automatically when present, and falls back to a short delay if it isn't.

---

## 🌐 Language system
- First `/start` → user is asked to pick a language; it's stored per-user in MongoDB and reused everywhere (bot replies + Mini App).
- Users can change it anytime: in the bot via the "🌐 Change Language" button under `/start`, or in the Mini App via the 🌐 pill top-right.

## ⚠️ Honest limitations (please read)
- **Telegram channel-join tasks** are verified for real — but only works for **public** channels where **ZORY X BOT is an admin**. Private invite links (`t.me/+xxxx`) can't be checked this way.
- **"Start another bot" / YouTube / Discord / TikTok / Facebook / Twitter / Instagram tasks** cannot be cryptographically verified — Telegram (or those platforms) don't expose an API for a third-party bot to confirm "this user really did X" on their own. The Go→wait→Check flow reduces casual cheating but is not bulletproof. If you need airtight verification for a specific platform, it usually requires that platform's own OAuth login, which is a bigger integration.
- The **leaderboard's fake users** are just for visual presentation (`isFake: true`) — they never receive coins for real and don't affect real payouts.

---

Made for **ZORY X BOT** 🚀
