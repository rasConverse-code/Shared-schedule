const mock = require('./mock');
const timeUtil = require('./time');

let state = null;

function init() {
  state = mock.loadState();
  const app = getApp();
  if (app) {
    app.globalData.currentGroupId = state.currentGroupId;
    app.globalData.userInfo = state.users[state.currentUserId];
  }
  return state;
}

function getState() {
  if (!state) state = mock.loadState();
  return state;
}

function persist() {
  mock.saveState(state);
}

function getSettings() {
  const s = getState();
  if (!s.settings) {
    s.settings = {
      slots: timeUtil.DEFAULT_SLOTS.map((x) => ({ ...x })),
      semesterStart: s.semesterStart || timeUtil.defaultSemesterStart(),
      totalWeeks: 16,
      leftMode: 'time_only',
      periodPlan: timeUtil.planFromSlots(timeUtil.DEFAULT_SLOTS),
      dayStart: '',
      dayEnd: ''
    };
  }
  if (!s.settings.leftMode) s.settings.leftMode = 'time_only';
  if (!s.settings.periodPlan) {
    s.settings.periodPlan = timeUtil.planFromSlots(s.settings.slots);
  }
  return s.settings;
}

function getSlots() {
  return timeUtil.normalizeSlots(getSettings().slots);
}

function getPeriodPlan() {
  const settings = getSettings();
  return settings.periodPlan || timeUtil.planFromSlots(settings.slots);
}

/** 课表用时段（左栏仅时间轴） */
function getDisplaySlots() {
  const settings = getSettings();
  return timeUtil.decorateSlots(settings.slots, settings.leftMode || 'time_only');
}

function getSemesterInfo() {
  const settings = getSettings();
  const semesterStart = settings.semesterStart || timeUtil.defaultSemesterStart();
  const totalWeeks = Math.max(1, Number(settings.totalWeeks) || 16);
  return {
    semesterStart,
    totalWeeks,
    leftMode: settings.leftMode || 'time_only',
    periodPlan: settings.periodPlan
  };
}

function updateSettings(patch) {
  const s = getState();
  const current = getSettings();
  const next = { ...current, ...patch };

  if (patch.periodPlan) {
    const plan = { ...current.periodPlan, ...patch.periodPlan };
    if (patch.periodPlan.periods) plan.periods = patch.periodPlan.periods;
    if (!plan.periods || !plan.periods.length) {
      plan.periods = timeUtil.buildPeriodsFromPlan(plan, null);
    }
    next.periodPlan = plan;
    next.slots = timeUtil.planToSlots(plan);
  }

  if (patch.slots) {
    next.slots = timeUtil.normalizeSlots(patch.slots);
  }
  if (patch.totalWeeks != null) {
    next.totalWeeks = Math.max(1, Math.min(30, Number(patch.totalWeeks) || 16));
  }
  if (patch.semesterStart) {
    next.semesterStart = patch.semesterStart;
  }
  if (patch.leftMode) {
    next.leftMode = patch.leftMode;
  }
  if (patch.dayStart !== undefined) next.dayStart = patch.dayStart;
  if (patch.dayEnd !== undefined) next.dayEnd = patch.dayEnd;

  s.settings = next;
  s.semesterStart = next.semesterStart;
  s.totalWeeks = next.totalWeeks;

  const maxSlot = next.slots.length;
  s.courses = s.courses.map((c) => {
    let startSlot = c.startSlot;
    let endSlot = c.endSlot;
    if (startSlot > maxSlot) startSlot = maxSlot;
    if (endSlot > maxSlot) endSlot = maxSlot;
    if (endSlot < startSlot) endSlot = startSlot;
    return { ...c, startSlot, endSlot };
  });

  s.courses = s.courses.map((c) => {
    if (c.type !== 'course' || !c.weeks || !c.weeks.length) return c;
    return { ...c, weeks: c.weeks.filter((w) => w >= 1 && w <= next.totalWeeks) };
  });

  persist();
  return next;
}

function getCurrentUser() {
  return getState().users[getState().currentUserId];
}

function getCurrentGroup() {
  const s = getState();
  return s.groups.find((g) => g.groupId === s.currentGroupId) || s.groups[0] || null;
}

function getGroups() {
  return getState().groups;
}

function setCurrentGroup(groupId) {
  const s = getState();
  s.currentGroupId = groupId;
  persist();
  const app = getApp();
  if (app) app.globalData.currentGroupId = groupId;
}

function getGroupMembers(groupId) {
  const s = getState();
  const g = s.groups.find((x) => x.groupId === groupId);
  if (!g) return [];
  return g.memberIds
    .map((id) => s.users[id])
    .filter(Boolean)
    .map((u, idx) => ({
      ...u,
      color: timeUtil.MEMBER_COLORS[u.colorIndex != null ? u.colorIndex % 8 : idx % 8],
      initial: (u.nickName || '?').slice(0, 1)
    }));
}

function getCourses(groupId) {
  const s = getState();
  return s.courses.filter((c) => c.groupId === groupId);
}

function getMyCourses(groupId, userId) {
  const s = getState();
  return s.courses.filter((c) => c.groupId === groupId && c.userId === userId);
}

function courseActiveThisWeek(course, weekNum) {
  if (course.type === 'event') return true;
  if (!course.weeks || !course.weeks.length) return true;
  return course.weeks.indexOf(weekNum) !== -1;
}

/**
 * 构建周视图网格
 * cells[dayOfWeek-1][slotIndex] = [{ user, course, color }]
 */
function buildWeekGrid(groupId, weekNum) {
  const slots = getSlots();
  const members = getGroupMembers(groupId);
  const courses = getCourses(groupId).filter((c) => courseActiveThisWeek(c, weekNum));
  const userMap = {};
  members.forEach((m) => {
    userMap[m.userId] = m;
  });

  const cells = [];
  for (let d = 0; d < 7; d++) {
    cells[d] = [];
    for (let s = 0; s < slots.length; s++) {
      cells[d][s] = [];
    }
  }

  courses.forEach((c) => {
    if (c.dayOfWeek < 1 || c.dayOfWeek > 7) return;
    const user = userMap[c.userId];
    if (!user) return;
    const item = {
      course: c,
      user,
      color: user.color
    };
    for (let slot = c.startSlot; slot <= c.endSlot; slot++) {
      if (slot >= 1 && slot <= slots.length) {
        cells[c.dayOfWeek - 1][slot - 1].push(item);
      }
    }
  });

  return { members, courses, cells, slots };
}

/**
 * iOS 日历式一周数据：按真实起止时间定位的彩色块
 */
function buildWeekCalendar(groupId, weekNum) {
  const slots = getSlots();
  const settings = getSettings();
  const range = timeUtil.getCalendarRange(slots, settings);
  const hours = timeUtil.buildHourLines(range);
  const members = getGroupMembers(groupId);
  const me = getCurrentUser();
  const courses = getCourses(groupId).filter((c) => courseActiveThisWeek(c, weekNum));
  const userMap = {};
  members.forEach((m) => {
    userMap[m.userId] = m;
  });

  const dayBlocks = [[], [], [], [], [], [], []];

  courses.forEach((c) => {
    if (c.dayOfWeek < 1 || c.dayOfWeek > 7) return;
    const user = userMap[c.userId];
    if (!user) return;
    const sSlot = slots[c.startSlot - 1];
    const eSlot = slots[c.endSlot - 1] || sSlot;
    if (!sSlot) return;
    const startMin = timeUtil.timeToMin(sSlot.start);
    const endMin = timeUtil.timeToMin(eSlot.end);
    if (endMin <= startMin) return;

    dayBlocks[c.dayOfWeek - 1].push({
      courseId: c._id,
      userId: c.userId,
      nickName: user.nickName,
      initial: user.initial || (user.nickName || '?').slice(0, 1),
      color: user.color,
      isMe: me && c.userId === me.userId,
      type: c.type,
      typeLabel: c.type === 'event' ? '事件' : '课程',
      title: c.title,
      location: c.location || '',
      teacher: c.teacher || '',
      note: c.note || '',
      startMin,
      endMin,
      startLabel: timeUtil.minToTime(startMin),
      endLabel: timeUtil.minToTime(endMin),
      rangeLabel: timeUtil.slotRange(c.startSlot, c.endSlot, slots),
      bg: timeUtil.hexToRgba(user.color, 0.22),
      border: user.color
    });
  });

  const blocks = dayBlocks.map((list) => timeUtil.layoutCalendarEvents(list, range));

  // 按日聚合占用，供空点查询
  const dayOccupancy = blocks.map((list) => {
    const byUser = {};
    list.forEach((b) => {
      byUser[b.userId] = true;
    });
    const busyIds = Object.keys(byUser);
    const free = members.filter((m) => busyIds.indexOf(m.userId) === -1);
    return {
      items: list.map((b) => ({
        userId: b.userId,
        nickName: b.nickName,
        color: b.color,
        initial: b.initial,
        isMe: b.isMe,
        type: b.type,
        typeLabel: b.typeLabel,
        title: b.title,
        location: b.location,
        teacher: b.teacher,
        note: b.note,
        courseId: b.courseId,
        rangeLabel: `${b.startLabel}-${b.endLabel}`
      })),
      free: free.map((m) => ({
        nickName: m.nickName,
        color: m.color,
        initial: m.initial,
        isMe: me && m.userId === me.userId
      })),
      freeRaw: free,
      itemsRaw: list
    };
  });

  return {
    members,
    courses,
    slots,
    range,
    hours,
    hourHeightRpx: 120,
    bodyHeightRpx: Math.max(480, Math.round((range.totalMin / 60) * 120)),
    blocks,
    dayOccupancy
  };
}

function getSlotOccupancy(groupId, dayOfWeek, slotId, weekNum) {
  const { cells, members, slots } = buildWeekGrid(groupId, weekNum);
  const items = (cells[dayOfWeek - 1] && cells[dayOfWeek - 1][slotId - 1]) || [];
  const busyIds = {};
  items.forEach((it) => {
    busyIds[it.user.userId] = true;
  });
  const free = members.filter((m) => !busyIds[m.userId]);
  return { items, free, members, slots };
}

function addCourse(course) {
  const s = getState();
  const id = 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const item = { ...course, _id: id, groupId: s.currentGroupId };
  s.courses.push(item);
  persist();
  return item;
}

function updateCourse(id, patch) {
  const s = getState();
  const idx = s.courses.findIndex((c) => c._id === id);
  if (idx === -1) return null;
  s.courses[idx] = { ...s.courses[idx], ...patch };
  persist();
  return s.courses[idx];
}

function removeCourse(id) {
  const s = getState();
  s.courses = s.courses.filter((c) => c._id !== id);
  persist();
}

function createGroup(name) {
  const s = getState();
  const id = 'g_' + Date.now().toString(36);
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const group = {
    groupId: id,
    name: name || '新群组',
    inviteCode: code,
    ownerId: s.currentUserId,
    memberIds: [s.currentUserId]
  };
  s.groups.push(group);
  const me = s.users[s.currentUserId];
  if (me.colorIndex == null) me.colorIndex = 0;
  persist();
  return group;
}

function joinGroupByCode(code, user) {
  const s = getState();
  const g = s.groups.find((x) => x.inviteCode === String(code || '').trim().toUpperCase());
  if (!g) return { ok: false, msg: '邀请码无效' };
  const uid = user && user.userId ? user.userId : s.currentUserId;
  if (!s.users[uid]) {
    s.users[uid] = user;
  }
  if (g.memberIds.indexOf(uid) === -1) {
    const used = {};
    g.memberIds.forEach((id) => {
      const u = s.users[id];
      if (u) used[u.colorIndex] = true;
    });
    let ci = 0;
    while (used[ci] && ci < 8) ci++;
    s.users[uid].colorIndex = ci;
    g.memberIds.push(uid);
  }
  persist();
  return { ok: true, group: g };
}

function leaveGroup(groupId) {
  const s = getState();
  const g = s.groups.find((x) => x.groupId === groupId);
  if (!g) return;
  g.memberIds = g.memberIds.filter((id) => id !== s.currentUserId);
  if (g.memberIds.length === 0) {
    s.groups = s.groups.filter((x) => x.groupId !== groupId);
    s.courses = s.courses.filter((c) => c.groupId !== groupId);
  }
  if (s.currentGroupId === groupId) {
    s.currentGroupId = s.groups[0] ? s.groups[0].groupId : '';
  }
  persist();
}

function updateProfile(patch) {
  const s = getState();
  s.users[s.currentUserId] = { ...s.users[s.currentUserId], ...patch };
  persist();
  return s.users[s.currentUserId];
}

function resetDemo() {
  state = mock.resetDemo();
  return state;
}

function isCloudReady() {
  const app = getApp();
  return !!(app && app.globalData.cloudReady);
}

function currentWeekNum() {
  const { semesterStart } = getSemesterInfo();
  return timeUtil.getSemesterWeek(null, semesterStart);
}

module.exports = {
  init,
  getState,
  getSettings,
  getSlots,
  getDisplaySlots,
  getPeriodPlan,
  getSemesterInfo,
  updateSettings,
  getCurrentUser,
  getCurrentGroup,
  getGroups,
  setCurrentGroup,
  getGroupMembers,
  getCourses,
  getMyCourses,
  courseActiveThisWeek,
  buildWeekGrid,
  buildWeekCalendar,
  getSlotOccupancy,
  addCourse,
  updateCourse,
  removeCourse,
  createGroup,
  joinGroupByCode,
  leaveGroup,
  updateProfile,
  resetDemo,
  isCloudReady,
  currentWeekNum
};
