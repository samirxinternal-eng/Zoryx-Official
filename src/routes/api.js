const express = require('express');
const router = express.Router();

const {
  requireTelegramAuth,
  getMe,
  setLanguage,
  dailyCheckIn,
  getLeaderboard,
  getStats,
  getAchievements,
  claimAchievement,
  watchAd,
  getWithdrawInfo,
  createWithdrawRequest,
  listMyWithdrawals,
  getTaskPaymentInfo,
} = require('../controllers/userController');

const {
  listTasks,
  createTask,
  deleteTask,
  submitUserTask,
  listPendingUserTasks,
  approveUserTask,
  rejectUserTask,
  startTask,
  checkTask,
} = require('../controllers/taskController');

const { MONETAG_ZONE_ID } = require('../config');

router.use(requireTelegramAuth);

// user
router.get('/me', getMe);
router.post('/language', setLanguage);
router.post('/checkin', dailyCheckIn);
router.get('/leaderboard', getLeaderboard);
router.get('/stats', getStats);
router.get('/achievements', getAchievements);
router.post('/achievements/claim', claimAchievement);
router.post('/ads/watch', watchAd);
router.get('/config', (req, res) => res.json({ monetagZoneId: MONETAG_ZONE_ID }));

// withdraw
router.get('/withdraw/info', getWithdrawInfo);
router.post('/withdraw', createWithdrawRequest);
router.get('/withdraw/history', listMyWithdrawals);

// tasks
router.get('/tasks', listTasks);
router.post('/tasks', createTask);
router.delete('/tasks/:id', deleteTask);
router.post('/tasks/go', startTask);
router.post('/tasks/check', checkTask);

// paid user-submitted tasks
router.get('/tasks/payment-info', getTaskPaymentInfo);
router.post('/tasks/submit', submitUserTask);
router.get('/tasks/pending', listPendingUserTasks);
router.post('/tasks/pending/:id/approve', approveUserTask);
router.post('/tasks/pending/:id/reject', rejectUserTask);

module.exports = router;
