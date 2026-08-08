// Static achievement definitions. Progress is computed live from the user's
// stored counters (referralCount / completedTasksCount) - nothing here is
// per-user data, so this file can be edited freely to add more achievements.

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
    icon: '👑',
    titleKey: 'ach_invite_master_title',
    descKey: 'ach_invite_master_desc',
    target: 200,
    metric: 'referralCount',
    rewardCoins: 80,
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
