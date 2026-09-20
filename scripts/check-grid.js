// 模拟 wx 环境，校验多人叠层网格
const timeUtil = require('../miniprogram/utils/time.js');
const { MOCK_USERS, MOCK_GROUPS, MOCK_COURSES } = require('../miniprogram/utils/mock.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exitCode = 1;
  } else {
    console.log('OK:', msg);
  }
}

function buildWeekGrid(groupId, members, courses, weekNum) {
  const userMap = {};
  members.forEach((m) => {
    userMap[m.userId] = {
      ...m,
      color: timeUtil.MEMBER_COLORS[m.colorIndex % 8],
      initial: m.nickName.slice(0, 1)
    };
  });

  const cells = [];
  for (let d = 0; d < 7; d++) {
    cells[d] = [];
    for (let s = 0; s < timeUtil.SLOTS.length; s++) cells[d][s] = [];
  }

  courses
    .filter((c) => c.groupId === groupId)
    .filter((c) => c.type === 'event' || !c.weeks || !c.weeks.length || c.weeks.indexOf(weekNum) !== -1)
    .forEach((c) => {
      const user = userMap[c.userId];
      if (!user) return;
      for (let slot = c.startSlot; slot <= c.endSlot; slot++) {
        if (slot >= 1 && slot <= timeUtil.SLOTS.length) {
          cells[c.dayOfWeek - 1][slot - 1].push({ course: c, user, color: user.color });
        }
      }
    });

  return cells;
}

const group = MOCK_GROUPS[0];
const members = Object.keys(MOCK_USERS).map((k) => MOCK_USERS[k]);
const cells = buildWeekGrid(group.groupId, members, MOCK_COURSES, 1);

// 周一 1-2 节：我、林晓、周予、叶南 都有课 → 4 人
const monMorning = cells[0][0];
assert(monMorning.length === 4, '周一 1-2 节 4 人占用，got ' + monMorning.length);

// 周二 3-4 节（slot 2）：我数据结构、周予电路、陈可有机化学 → 3 人
const tueNoon = cells[1][1];
assert(tueNoon.length === 3, '周二 3-4 节 3 人占用，got ' + tueNoon.length);

// 周五 9-10 节（slot 5）：我社团、叶南约球 → 2 人
const friNight = cells[4][4];
assert(friNight.length === 2, '周五 9-10 节 2 人占用，got ' + friNight.length);

// 周日上午应为空
const sun = cells[6].every((slot) => slot.length === 0);
assert(sun, '周日全天空闲');

// 有空计算
const busy = {};
monMorning.forEach((it) => {
  busy[it.user.userId] = true;
});
const free = members.filter((m) => !busy[m.userId]);
assert(free.length === 1 && free[0].userId === 'u_chen', '周一 1-2 仅陈可有空');

console.log('grid done');
