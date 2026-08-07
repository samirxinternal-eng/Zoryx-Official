# ZORY X Bot

Telegram Bot + Mini App. Tap to earn coins, complete tasks, watch ads for
bonus coins, invite friends, climb the leaderboard.

## Folder structure

```
zory-x-bot/
├── bot/
│   ├── bot.js              # registers every command
│   ├── middleware/isAdmin.js
│   └── commands/
│       ├── start.js        # public — welcome + Open Mini App button
│       ├── help.js         # admin only
│       ├── tasks.js        # admin only — addtask / removetask / alltasks
│       └── admin.js        # admin only — broadcast / stats
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   └── api.js               # everything the Mini App calls
├── utils/
│   └── verifyTelegram.js    # checks Mini App requests are really from Telegram
├── config/
│   └── db.js
├── public/                  # the Mini App itself
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js                 # entry point — bot webhook + API + Mini App, all one service
├── package.json
├── .env.example
└── .gitignore
```

19 files, 8 folders total.

## 1. Create the bot

1. Message **@BotFather** on Telegram → `/newbot` → follow the prompts.
2. Save the token it gives you — that's `BOT_TOKEN`.
3. Also save the bot's `@username` — that's `BOT_USERNAME` (no `@`).
4. Message **@userinfobot** to get your own numeric Telegram ID — that's `ADMIN_ID`.
   Only this ID will ever get a response from `/help` and the other admin commands.

## 2. MongoDB

Create a free cluster at MongoDB Atlas, add a database user, allow access from
anywhere (0.0.0.0/0) under Network Access, and copy the connection string into
`MONGO_URI`.

## 3. Monetag (Watch Ad button)

1. Sign up at Monetag and add your Mini App's domain.
2. Create a Rewarded ad zone and copy its Zone ID.
3. Put that ID in `MONETAG_ZONE_ID`. The Mini App loads Monetag's SDK using
   that ID automatically — nothing else to wire up.
4. Ad reward amount and cooldown are set as constants at the top of
   `routes/api.js` (`AD_REWARD`, `AD_COOLDOWN_SECONDS`) — change the numbers
   there if you want a different payout or wait time.

## 4. Local setup

```bash
npm install
cp .env.example .env
# fill in .env — you can leave WEBHOOK_URL for after step 5
```

## 5. Deploy to Render

1. Push this folder to a new GitHub repo.
2. On Render: **New → Web Service** → connect the repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all the variables from `.env` under Render's Environment tab.
5. Once it's deployed, copy the `https://your-app.onrender.com` URL Render gives
   you into `WEBHOOK_URL` (both in Render's dashboard and your local `.env`),
   then redeploy so the bot registers the webhook correctly.
6. Add that same URL to UptimeRobot, pinging `/health` every 5 minutes, so the
   free instance doesn't go to sleep.

## Admin commands (only work for `ADMIN_ID`)

| Command | What it does |
|---|---|
| `/help` | Lists all admin commands |
| `/addtask Title \| https://url.com \| 100 \| channel` | Adds a task. Type is `channel`, `link`, or `bot` — optional, defaults to `link` |
| `/removetask <taskId>` | Deletes a task |
| `/alltasks` | Lists every task with its ID and type |
| `/broadcast Your message` | Sends a message to every user |
| `/stats` | Total users + total coins distributed |

Everyone else gets **no response** from any of these — only `/start` replies
to a regular user.

### Task types

- `channel` — join your official channel/group
- `link` — visit any link (website, other page)
- `bot` — try/start another earning bot

Each shows a different icon in the Mini App so users know what they're
about to do before tapping "Go".

## What's already in

Tap-to-earn, referral rewards (500 coins per invite), a level ring based on
coins, an admin-managed task list with types, a "Watch Ad" button powered by
Monetag, and a live leaderboard.

## Good next additions

- Energy/stamina limit on tapping, refilling over time
- Daily login streak bonus
- League tiers (Bronze → Diamond) instead of a flat level number
- Server-side check that a task's channel was actually joined, using
  Telegram's `getChatMember`, instead of an honor-system claim
- A postback/server-to-server callback from Monetag instead of trusting the
  client's "ad finished" event, if your Monetag plan supports it
