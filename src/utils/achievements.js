// Static achievement definitions. Progress is computed live from the user's
// stored counters (referralCount / completedTasksCount) - nothing here is
// per-user data, so this file can be edited freely to add more achievements.
//
// rewardCoins is set so that rewardCoins * COIN_TO_USDT_RATE (0.1) equals a
// clean USDT bonus, matching the FoxiGrow-style milestone table:
//   3 invites    -> +0.5 USDT / +5 ZX
//   50 invites   -> +2 USDT   / +20 ZX
//   200 invites  -> +10 USDT  / +100 ZX
//   1000 invites -> +50 USDT  / +500 ZX
//   5000 invites -> +200 USDT / +2000 ZX
//   20000 invites-> +1500 USDT/ +15000 ZX

const ACHIEVEMENTS = [
  {
    id: 'first_invitation',
    category: 'invite',
    icon: '👋',
    titleKey: 'ach_first_invitation_title',
    descKey: 'ach_first_invitation_desc',
    target: 3,
    metric: 'referralCount',
    rewardCoins: 5,
  },
  {
    id: 'social_butterfly',
    category: 'invite',
    icon: '🦋',
    titleKey: 'ach_social_butterfly_title',
    descKey: 'ach_social_butterfly_desc',
    target: 50,
    metric: 'referralCount',
    rewardCoins: 20,
  },
  {
    id: 'invite_master',
    category: 'invite',
    icon: '⭐',
    titleKey: 'ach_invite_master_title',
    descKey: 'ach_invite_master_desc',
    target: 200,
    metric: 'referralCount',
    rewardCoins: 100,
  },
  {
    id: 'invite_the_master',
    category: 'invite',
    icon: '🏆',
    titleKey: 'ach_invite_the_master_title',
    descKey: 'ach_invite_the_master_desc',
    target: 1000,
    metric: 'referralCount',
    rewardCoins: 500,
  },
  {
    id: 'invite_the_king',
    category: 'invite',
    icon: '👑',
    titleKey: 'ach_invite_the_king_title',
    descKey: 'ach_invite_the_king_desc',
    target: 5000,
    metric: 'referralCount',
    rewardCoins: 2000,
  },
  {
    id: 'invite_the_vip',
    category: 'invite',
    icon: '🎖️',
    titleKey: 'ach_invite_the_vip_title',
    descKey: 'ach_invite_the_vip_desc',
    target: 20000,
    metric: 'referralCount',
    rewardCoins: 15000,
  },
  {
    id: 'first_task',
    category: 'earning',
    icon: '✅',
    titleKey: 'ach_first_task_title',
    descKey: 'ach_first_task_desc',
    target: 1,
    metric: 'completedTasksCount',
    rewardCoins: 2,
  },
  {
    id: 'task_grinder',
    category: 'earning',
    icon: '💪',
    titleKey: 'ach_task_grinder_title',
    descKey: 'ach_task_grinder_desc',
    target: 25,
    metric: 'completedTasksCount',
    rewardCoins: 15,
  },
  {
    id: 'task_legend',
    category: 'earning',
    icon: '🏆',
    titleKey: 'ach_task_legend_title',
    descKey: 'ach_task_legend_desc',
    target: 100,
    metric: 'completedTasksCount',
    rewardCoins: 50,
  },
];

function getProgress(user, achievement) {
  return user[achievement.metric] || 0;
}

module.exports = { ACHIEVEMENTS, getProgress };
