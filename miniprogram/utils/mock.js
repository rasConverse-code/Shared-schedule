/**
 * 本地演示数据。未配置云开发环境时使用。
 * startSlot/endSlot 为时段索引 1-6（对应 time.SLOTS）。
 */

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const MOCK_USERS = {
  u_me: {
    userId: 'u_me',
    nickName: '我',
    avatarUrl: '',
    colorIndex: 0,
    isMe: true
  },
  u_lin: {
    userId: 'u_lin',
    nickName: '林晓',
    avatarUrl: '',
    colorIndex: 1,
    isMe: false
  },
  u_zhou: {
    userId: 'u_zhou',
    nickName: '周予',
    avatarUrl: '',
    colorIndex: 2,
    isMe: false
  },
  u_chen: {
    userId: 'u_chen',
    nickName: '陈可',
    avatarUrl: '',
    colorIndex: 3,
    isMe: false
  },
  u_ye: {
    userId: 'u_ye',
    nickName: '叶南',
    avatarUrl: '',
    colorIndex: 4,
    isMe: false
  }
};

const MOCK_GROUPS = [
  {
    groupId: 'g_demo',
    name: '宿舍 302',
    inviteCode: 'K302XX',
    ownerId: 'u_me',
    memberIds: ['u_me', 'u_lin', 'u_zhou', 'u_chen', 'u_ye']
  }
];

// 时段索引: 1=1-2节 2=3-4节 3=5-6节 4=7-8节 5=9-10节 6=11-12节
const MOCK_COURSES = [
  // 我
  {
    _id: 'c1',
    groupId: 'g_demo',
    userId: 'u_me',
    type: 'course',
    title: '高等数学',
    location: '教三 301',
    teacher: '王老师',
    dayOfWeek: 1,
    startSlot: 1,
    endSlot: 1,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c2',
    groupId: 'g_demo',
    userId: 'u_me',
    type: 'course',
    title: '大学英语',
    location: '外语楼 205',
    teacher: 'Lily',
    dayOfWeek: 3,
    startSlot: 2,
    endSlot: 2,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c3',
    groupId: 'g_demo',
    userId: 'u_me',
    type: 'course',
    title: '数据结构',
    location: '实验楼 B201',
    teacher: '李老师',
    dayOfWeek: 2,
    startSlot: 2,
    endSlot: 2,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c4',
    groupId: 'g_demo',
    userId: 'u_me',
    type: 'event',
    title: '社团例会',
    location: '活动中心',
    dayOfWeek: 5,
    startSlot: 5,
    endSlot: 5,
    weeks: [],
    note: '带策划案'
  },
  // 林晓
  {
    _id: 'c5',
    groupId: 'g_demo',
    userId: 'u_lin',
    type: 'course',
    title: '线性代数',
    location: '教二 108',
    teacher: '赵老师',
    dayOfWeek: 1,
    startSlot: 1,
    endSlot: 1,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c6',
    groupId: 'g_demo',
    userId: 'u_lin',
    type: 'course',
    title: '概率论',
    location: '教三 202',
    teacher: '钱老师',
    dayOfWeek: 3,
    startSlot: 1,
    endSlot: 1,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c7',
    groupId: 'g_demo',
    userId: 'u_lin',
    type: 'course',
    title: '程序设计',
    location: '机房 A3',
    teacher: '孙老师',
    dayOfWeek: 4,
    startSlot: 2,
    endSlot: 2,
    weeks: WEEKS,
    note: ''
  },
  // 周予
  {
    _id: 'c8',
    groupId: 'g_demo',
    userId: 'u_zhou',
    type: 'course',
    title: '大学物理',
    location: '理学楼 110',
    teacher: '周老师',
    dayOfWeek: 1,
    startSlot: 1,
    endSlot: 1,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c9',
    groupId: 'g_demo',
    userId: 'u_zhou',
    type: 'course',
    title: '电路原理',
    location: '电气楼 401',
    teacher: '吴老师',
    dayOfWeek: 2,
    startSlot: 2,
    endSlot: 2,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c10',
    groupId: 'g_demo',
    userId: 'u_zhou',
    type: 'event',
    title: '兼职家教',
    location: '校外',
    dayOfWeek: 6,
    startSlot: 2,
    endSlot: 2,
    weeks: [],
    note: ''
  },
  // 陈可
  {
    _id: 'c11',
    groupId: 'g_demo',
    userId: 'u_chen',
    type: 'course',
    title: '有机化学',
    location: '化学楼 203',
    teacher: '郑老师',
    dayOfWeek: 2,
    startSlot: 2,
    endSlot: 2,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c12',
    groupId: 'g_demo',
    userId: 'u_chen',
    type: 'course',
    title: '实验课',
    location: '化学楼 实验室',
    teacher: '郑老师',
    dayOfWeek: 3,
    startSlot: 2,
    endSlot: 2,
    weeks: WEEKS,
    note: '穿白大褂'
  },
  {
    _id: 'c13',
    groupId: 'g_demo',
    userId: 'u_chen',
    type: 'course',
    title: '思政课',
    location: '教一 501',
    teacher: '冯老师',
    dayOfWeek: 5,
    startSlot: 1,
    endSlot: 1,
    weeks: WEEKS,
    note: ''
  },
  // 叶南
  {
    _id: 'c14',
    groupId: 'g_demo',
    userId: 'u_ye',
    type: 'course',
    title: '体育·篮球',
    location: '体育馆',
    dayOfWeek: 4,
    startSlot: 5,
    endSlot: 5,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c15',
    groupId: 'g_demo',
    userId: 'u_ye',
    type: 'course',
    title: '高等数学',
    location: '教三 301',
    teacher: '王老师',
    dayOfWeek: 1,
    startSlot: 1,
    endSlot: 1,
    weeks: WEEKS,
    note: ''
  },
  {
    _id: 'c16',
    groupId: 'g_demo',
    userId: 'u_ye',
    type: 'event',
    title: '约球',
    location: '东操场',
    dayOfWeek: 5,
    startSlot: 5,
    endSlot: 5,
    weeks: [],
    note: ''
  }
];

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function ensureSettings(state) {
  if (!state.settings) {
    state.settings = {
      slots: [
        { id: 1, label: '1-2', start: '08:00', end: '09:40', period: '上午', leftText: '' },
        { id: 2, label: '3-4', start: '10:00', end: '11:40', period: '上午', leftText: '' },
        { id: 3, label: '5-6', start: '14:00', end: '15:40', period: '下午', leftText: '' },
        { id: 4, label: '7-8', start: '16:00', end: '17:40', period: '下午', leftText: '' },
        { id: 5, label: '9-10', start: '19:00', end: '20:40', period: '晚上', leftText: '' },
        { id: 6, label: '11-12', start: '21:00', end: '22:00', period: '晚上', leftText: '' }
      ],
      semesterStart: state.semesterStart || '',
      totalWeeks: state.totalWeeks || 16,
      leftMode: 'label_range'
    };
  }
  if (!state.settings.slots || !state.settings.slots.length) {
    state.settings.slots = [
      { id: 1, label: '1-2', start: '08:00', end: '09:40', period: '上午', leftText: '' },
      { id: 2, label: '3-4', start: '10:00', end: '11:40', period: '上午', leftText: '' },
      { id: 3, label: '5-6', start: '14:00', end: '15:40', period: '下午', leftText: '' },
      { id: 4, label: '7-8', start: '16:00', end: '17:40', period: '下午', leftText: '' },
      { id: 5, label: '9-10', start: '19:00', end: '20:40', period: '晚上', leftText: '' },
      { id: 6, label: '11-12', start: '21:00', end: '22:00', period: '晚上', leftText: '' }
    ];
  }
  if (!state.settings.leftMode) state.settings.leftMode = 'label_range';
  state.settings.slots = state.settings.slots.map((s) => ({ ...s, leftText: s.leftText || '' }));
  return state;
}

function loadState() {
  try {
    const raw = wx.getStorageSync('ketabazi_state');
    if (raw && raw.users) return ensureSettings(raw);
  } catch (e) {
    // ignore
  }
  const state = {
    users: clone(MOCK_USERS),
    groups: clone(MOCK_GROUPS),
    courses: clone(MOCK_COURSES),
    currentGroupId: 'g_demo',
    currentUserId: 'u_me',
    semesterStart: '2025-09-01',
    totalWeeks: 16,
    settings: {
      slots: [
        { id: 1, label: '上午第1节', start: '08:00', end: '09:40', period: '上午', leftText: '' },
        { id: 2, label: '上午第2节', start: '10:00', end: '11:40', period: '上午', leftText: '' },
        { id: 3, label: '下午第1节', start: '14:00', end: '15:40', period: '下午', leftText: '' },
        { id: 4, label: '下午第2节', start: '16:00', end: '17:40', period: '下午', leftText: '' },
        { id: 5, label: '晚上第1节', start: '19:00', end: '20:40', period: '晚上', leftText: '' },
        { id: 6, label: '晚上第2节', start: '21:00', end: '22:00', period: '晚上', leftText: '' }
      ],
      semesterStart: '2025-09-01',
      totalWeeks: 16,
      leftMode: 'time_only',
      periodPlan: {
        morningCount: 2,
        afternoonCount: 2,
        eveningCount: 2,
        morningStart: '08:00',
        afternoonStart: '14:00',
        eveningStart: '19:00',
        breakMin: 20,
        periods: [
          { id: 1, index: 1, session: 'morning', sessionName: '上午', indexInSession: 1, label: '上午第1节', start: '08:00', durationMin: 100, end: '09:40', leftText: '' },
          { id: 2, index: 2, session: 'morning', sessionName: '上午', indexInSession: 2, label: '上午第2节', start: '10:00', durationMin: 100, end: '11:40', leftText: '' },
          { id: 3, index: 3, session: 'afternoon', sessionName: '下午', indexInSession: 1, label: '下午第1节', start: '14:00', durationMin: 100, end: '15:40', leftText: '' },
          { id: 4, index: 4, session: 'afternoon', sessionName: '下午', indexInSession: 2, label: '下午第2节', start: '16:00', durationMin: 100, end: '17:40', leftText: '' },
          { id: 5, index: 5, session: 'evening', sessionName: '晚上', indexInSession: 1, label: '晚上第1节', start: '19:00', durationMin: 100, end: '20:40', leftText: '' },
          { id: 6, index: 6, session: 'evening', sessionName: '晚上', indexInSession: 2, label: '晚上第2节', start: '21:00', durationMin: 100, end: '22:00', leftText: '' }
        ]
      },
      dayStart: '',
      dayEnd: ''
    }
  };
  wx.setStorageSync('ketabazi_state', state);
  return state;
}

function saveState(state) {
  wx.setStorageSync('ketabazi_state', state);
}

function resetDemo() {
  wx.removeStorageSync('ketabazi_state');
  return loadState();
}

module.exports = {
  MOCK_USERS,
  MOCK_GROUPS,
  MOCK_COURSES,
  loadState,
  saveState,
  resetDemo
};
