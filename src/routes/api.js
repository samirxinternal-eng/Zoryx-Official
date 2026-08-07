const express = require('express');
const router = express.Router();

const {
  requireTelegramAuth,
  getMe,
  setLanguage,
  getLeaderboard,
  watchAd,
} = require('../controllers/userController');

const {
  listTasks,
  createTask,
  deleteTask,
  startTask,
  checkTask,
} = require('../controllers/taskController');

const { MONETAG_ZONE_ID } = require('../config');

router.use(requireTelegramAuth);

// user
router.get('/me', getMe);
router.post('/language', setLanguage);
router.get('/leaderboard', getLeaderboard);
router.post('/ads/watch', watchAd);
router.get('/config', (req, res) => res.json({ monetagZoneId: MONETAG_ZONE_ID }));

// tasks
router.get('/tasks', listTasks);
router.post('/tasks', createTask);
router.delete('/tasks/:id', deleteTask);
router.post('/tasks/go', startTask);
router.post('/tasks/check', checkTask);

module.exports = router;
