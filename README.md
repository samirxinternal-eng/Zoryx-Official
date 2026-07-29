# Zoryx

Zoryx is a modern Telegram WebApp built with **Node.js**, **Express.js**, **MongoDB**, and **Telegram WebApp SDK**.

The project is designed to provide a fast, secure, and responsive experience inside Telegram.

---

## Features

- Telegram WebApp Login
- Secure Authentication
- MongoDB Database
- User Profile System
- Balance System
- Daily Reward
- Referral System
- Leaderboard
- REST API
- Responsive UI
- Render Deployment Ready

---

## Project Structure

```
zoryx/
│
├── client/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── api.js
│   ├── telegram.js
│   └── manifest.json
│
├── server/
│   ├── server.js
│   ├── routes.js
│   ├── database.js
│   ├── auth.js
│   └── .env
│
├── package.json
├── render.yaml
├── .gitignore
└── README.md
```

---

## Installation

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Or:

```bash
node server/server.js
```

---

## Environment Variables

Create a `.env` file inside the `server` folder.

Example:

```env
PORT=10000

MONGODB_URI=your_mongodb_connection_string

BOT_TOKEN=your_bot_token

BOT_USERNAME=your_bot_username

JWT_SECRET=your_secret_key
```

---

## Deployment

This project is ready for deployment on Render.

1. Push the project to GitHub.
2. Create a new Web Service on Render.
3. Connect your GitHub repository.
4. Add the required Environment Variables.
5. Deploy.

---

## Technology Stack

- Node.js
- Express.js
- MongoDB
- Telegram WebApp SDK
- HTML5
- CSS3
- JavaScript

---

## License

This project is provided for educational and development purposes.

---

## Author

**Samir**

Telegram: @zoryxbot
