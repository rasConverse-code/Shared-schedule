const DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'];

const DEFAULT_SLOTS = [
  { id: 1, label: '上午第1节', start: '08:00', end: '09:40', period: '上午' },
  { id: 2, label: '上午第2节', start: '10:00', end: '11:40', period: '上午' },
  { id: 3, label: '下午第1节', start: '14:00', end: '15:40', period: '下午' },
  { id: 4, label: '下午第2节', start: '16:00', end: '17:40', period: '下午' },
  { id: 5, label: '晚上第1节', start: '19:00', end: '20:40', period: '晚上' },
  { id: 6, label: '晚上第2节', start: '21:00', end: '22:00', period: '晚上' }
];

const DEFAULT_PERIOD_PLAN = {
  morningCount: 2,
  afternoonCount: 2,
  eveningCount: 2,
  morningStart: '08:00',
  afternoonStart: '14:00',
  eveningStart: '19:00',
  breakMin: 20,
  periods: null
};

const DURATION_OPTIONS = [40, 45, 50, 60, 90, 100, 120];

const SESSION_META = [
  { key: 'morning', name: '上午', countKey: 'morningCount', startKey: 'morningStart', defStart: '08:00' },
  { key: 'afternoon', name: '下午', countKey: 'afternoonCount', startKey: 'afternoonStart', defStart: '14:00' },
  { key: 'evening', name: '晚上', countKey: 'eveningCount', startKey: 'eveningStart', defStart: '19:00' }
];

const DEFAULT_SETTINGS = {
  slots: DEFAULT_SLOTS,
  semesterStart: '',
  totalWeeks: 16,
  leftMode: 'time_only',
  periodPlan: DEFAULT_PERIOD_PLAN,
  dayStart: '',
  dayEnd: ''
};

const MEMBER_COLORS = [
  '#4F6EF7',
  '#22C55E',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#8B5CF6',
  '#EF4444',
  '#14B8A6'
];

// 兼容旧引用
const SLOTS = DEFAULT_SLOTS;

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const LEFT_MODES = [
  { key: 'label_range', name: '名称 + 起止时间' },
  { key: 'label_start', name: '名称 + 开始时间' },
  { key: 'label_custom', name: '名称 + 自定义时间' },
  { key: 'label_only', name: '只显示名称' },
  { key: 'time_only', name: '只显示时间' }
];

function normalizeSlots(slots) {
  if (!slots || !slots.length) {
    return DEFAULT_SLOTS.map((s) => ({
      ...s,
      leftText: s.leftText || ''
    }));
  }
  return slots.map((s, i) => ({
    id: i + 1,
    label: s.label || String(i + 1),
    start: s.start || '00:00',
    end: s.end || '00:00',
    leftText: s.leftText || '',
    period: s.period || guessPeriod(s.start)
  }));
}

/** 课表左栏显示文本 */
function decorateSlotLeft(slot, leftMode) {
  const mode = leftMode || 'label_range';
  const label = slot.label || '';
  const range = `${slot.start}-${slot.end}`;
  const custom = (slot.leftText || '').trim() || range;

  if (mode === 'label_only') {
    return { leftMain: label, leftSub: '', leftRange: range };
  }
  if (mode === 'time_only') {
    return { leftMain: slot.start, leftSub: slot.end, leftRange: range };
  }
  if (mode === 'label_start') {
    return { leftMain: label, leftSub: slot.start, leftRange: range };
  }
  if (mode === 'label_custom') {
    return { leftMain: label, leftSub: custom, leftRange: range };
  }
  // label_range 默认
  return { leftMain: label, leftSub: range, leftRange: range };
}

function decorateSlots(slots, leftMode) {
  return normalizeSlots(slots).map((s) => ({
    ...s,
    ...decorateSlotLeft(s, leftMode)
  }));
}

function guessPeriod(start) {
  if (!start) return '';
  const h = parseInt(String(start).split(':')[0], 10);
  if (isNaN(h)) return '';
  if (h < 12) return '上午';
  if (h < 18) return '下午';
  return '晚上';
}

function getWeekDates(baseDate) {
  const d = baseDate ? new Date(baseDate) : new Date();
  return getWeekDatesFromMonday(mondayOf(d));
}

function mondayOf(d) {
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() + diffToMonday);
  return monday;
}

function getWeekDatesFromMonday(monday) {
  const dates = [];
  const todayStr = formatDate(new Date());
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    dates.push({
      date: formatDate(cur),
      dayOfWeek: i + 1,
      dayLabel: DAY_NAMES[i],
      dayNum: cur.getDate(),
      isToday: formatDate(cur) === todayStr
    });
  }
  return dates;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(str) {
  if (!str) return null;
  const parts = String(str).split('-');
  if (parts.length < 3) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekRangeLabel(dates) {
  const a = dates[0].date.split('-');
  const b = dates[6].date.split('-');
  return `${Number(a[1])}.${Number(a[2])} - ${Number(b[1])}.${Number(b[2])}`;
}

function defaultSemesterStart() {
  const now = new Date();
  const y = now.getFullYear();
  const month = now.getMonth();
  if (month >= 1 && month <= 6) {
    return formatDate(new Date(y, 1, 24));
  }
  return formatDate(new Date(y, 8, 1));
}

function getSemesterWeek(baseDate, semesterStart) {
  const start = parseDate(semesterStart) || parseDate(defaultSemesterStart());
  const d = baseDate ? new Date(baseDate) : new Date();
  d.setHours(0, 0, 0, 0);
  const diff = Math.floor((d - start) / 86400000);
  return Math.floor(diff / 7) + 1;
}

/** 某教学周对应的周一日期 */
function mondayOfWeek(semesterStart, weekNum) {
  const start = parseDate(semesterStart) || parseDate(defaultSemesterStart());
  const monday = new Date(start);
  // 开学日对齐到该周的周一
  const aligned = mondayOf(start);
  monday.setTime(aligned.getTime());
  monday.setDate(aligned.getDate() + (weekNum - 1) * 7);
  return monday;
}

/** 某教学周的 7 天日期 */
function getWeekDatesOfWeek(semesterStart, weekNum) {
  return getWeekDatesFromMonday(mondayOfWeek(semesterStart, weekNum));
}

function weekList(totalWeeks) {
  const n = Math.max(1, Math.min(30, Number(totalWeeks) || 16));
  const list = [];
  for (let i = 1; i <= n; i++) list.push(i);
  return list;
}

function slotRange(startSlot, endSlot, slots) {
  const list = normalizeSlots(slots || DEFAULT_SLOTS);
  const s = list[startSlot - 1];
  const e = list[endSlot - 1];
  if (!s || !e) return '';
  return `${s.start}-${e.end}`;
}

function slotsCovered(startSlot, endSlot) {
  const list = [];
  for (let i = startSlot; i <= endSlot; i++) list.push(i);
  return list;
}

function formatWeeksLabel(weeks, totalWeeks) {
  const n = totalWeeks || 16;
  if (!weeks || !weeks.length) return '每周';
  if (weeks.length === n) return `1-${n}周`;
  if (weeks.length === 1) return `第${weeks[0]}周`;
  const sorted = weeks.slice().sort((a, b) => a - b);
  const parts = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === prev + 1) {
      prev = sorted[i];
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = sorted[i];
    prev = sorted[i];
  }
  parts.push(start === prev ? `${start}` : `${start}-${prev}`);
  return parts.join(',') + '周';
}

/** "08:30" -> 510 */
function timeToMin(t) {
  if (!t) return 0;
  const parts = String(t).split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/** 510 -> "08:30" */
function minToTime(min) {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

/**
 * 日历可视时间范围（分钟）
 * settings.dayStart / dayEnd 可覆盖；默认由时段推导并上下留 30 分钟
 */
function getCalendarRange(slots, settings) {
  const list = normalizeSlots(slots || DEFAULT_SLOTS);
  const conf = settings || {};
  let startMin = conf.dayStart ? timeToMin(conf.dayStart) : null;
  let endMin = conf.dayEnd ? timeToMin(conf.dayEnd) : null;

  list.forEach((s) => {
    const a = timeToMin(s.start);
    const b = timeToMin(s.end);
    if (startMin === null || a < startMin) startMin = a;
    if (endMin === null || b > endMin) endMin = b;
  });

  if (startMin === null) startMin = 8 * 60;
  if (endMin === null) endMin = 22 * 60;
  if (endMin <= startMin) endMin = startMin + 60;

  // 未自定义时向外扩到半点，避免贴边
  if (!conf.dayStart) startMin = Math.floor((startMin - 30) / 30) * 30;
  if (!conf.dayEnd) endMin = Math.ceil((endMin + 30) / 30) * 30;

  return {
    startMin,
    endMin,
    totalMin: endMin - startMin,
    startLabel: minToTime(startMin),
    endLabel: minToTime(endMin)
  };
}

function buildHourLines(range) {
  const hours = [];
  if (!range || range.totalMin <= 0) return hours;
  const start = Math.ceil(range.startMin / 60) * 60;
  for (let m = start; m <= range.endMin; m += 60) {
    const topPct = ((m - range.startMin) / range.totalMin) * 100;
    hours.push({
      min: m,
      label: minToTime(m),
      topPct
    });
  }
  return hours;
}

/**
 * iOS 日历式并排布局
 * events: [{ startMin, endMin, ... }]
 * 返回带 leftPct/widthPct/topPct/heightPct 的块
 */
function layoutCalendarEvents(events, range) {
  if (!events || !events.length) return [];
  const total = range.totalMin || 1;
  const sorted = events
    .map((e) => ({ ...e }))
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const laid = [];
  let cluster = [];
  let clusterEnd = -1;

  function flush() {
    if (!cluster.length) return;
    const colEnds = [];
    cluster.forEach((ev) => {
      let col = 0;
      while (col < colEnds.length && colEnds[col] > ev.startMin) col++;
      if (col === colEnds.length) colEnds.push(ev.endMin);
      else colEnds[col] = Math.max(colEnds[col], ev.endMin);
      ev._col = col;
    });
    const cols = Math.max(1, colEnds.length);
    const widthPct = 100 / cols;
    cluster.forEach((ev) => {
      const top = ((ev.startMin - range.startMin) / total) * 100;
      const height = ((ev.endMin - ev.startMin) / total) * 100;
      laid.push({
        ...ev,
        leftPct: ev._col * widthPct,
        widthPct,
        topPct: top,
        heightPct: Math.max(height, 2),
        multiCol: cols > 1
      });
    });
    cluster = [];
  }

  sorted.forEach((ev) => {
    if (cluster.length && ev.startMin >= clusterEnd) {
      flush();
      clusterEnd = -1;
    }
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd === -1 ? ev.endMin : clusterEnd, ev.endMin);
  });
  flush();
  return laid;
}

function clampCount(n, max) {
  const v = parseInt(n, 10);
  if (isNaN(v) || v < 0) return 0;
  return Math.min(v, max == null ? 12 : max);
}

/** 按上午/下午/晚上节数生成节次列表（可保留已有起止） */
function buildPeriodsFromPlan(plan, prevPeriods) {
  const p = { ...DEFAULT_PERIOD_PLAN, ...(plan || {}) };
  const breakMin = Math.max(0, parseInt(p.breakMin, 10) || 0);
  const periods = [];
  let global = 0;

  SESSION_META.forEach((ses) => {
    const count = clampCount(p[ses.countKey], 12);
    const sessionStart = p[ses.startKey] || ses.defStart;
    let cursor = timeToMin(sessionStart);
    const prevInSession = (prevPeriods || []).filter((x) => x.session === ses.key);

    for (let i = 0; i < count; i++) {
      global += 1;
      const prev = prevInSession[i];
      let start = prev && prev.start ? prev.start : minToTime(cursor);
      let durationMin = prev && prev.durationMin ? Number(prev.durationMin) : (ses.key === 'evening' ? 100 : 100);
      if (!prev && i === 0) start = sessionStart;
      if (!prev && i > 0) start = minToTime(cursor);
      const endMin = timeToMin(start) + durationMin;
      const end = minToTime(endMin);
      periods.push({
        id: global,
        index: global,
        session: ses.key,
        sessionName: ses.name,
        indexInSession: i + 1,
        label: `${ses.name}第${i + 1}节`,
        start,
        durationMin,
        end,
        leftText: ''
      });
      cursor = endMin + breakMin;
    }
  });

  return periods;
}

/** 节次方案 → slots（供课表/录入使用） */
function planToSlots(plan) {
  const p = plan || DEFAULT_PERIOD_PLAN;
  const periods = p.periods && p.periods.length
    ? p.periods
    : buildPeriodsFromPlan(p, null);
  return periods.map((per, i) => ({
    id: i + 1,
    label: per.label || `第${i + 1}节`,
    start: per.start,
    end: per.end || minToTime(timeToMin(per.start) + (Number(per.durationMin) || 50)),
    period: per.sessionName || guessPeriod(per.start),
    session: per.session || '',
    durationMin: Number(per.durationMin) || 0,
    leftText: per.leftText || ''
  }));
}

/** 从已有 slots 反推节次方案（首次进入设置时） */
function planFromSlots(slots) {
  const list = normalizeSlots(slots || DEFAULT_SLOTS);
  const counts = { morning: 0, afternoon: 0, evening: 0 };
  const starts = { morning: '', afternoon: '', evening: '' };
  const periods = [];
  const sessOf = (s) => {
    if (s.session) return s.session;
    const h = timeToMin(s.start);
    if (h < 12 * 60) return 'morning';
    if (h < 18 * 60) return 'afternoon';
    return 'evening';
  };

  list.forEach((s, i) => {
    const session = sessOf(s);
    const name = session === 'morning' ? '上午' : session === 'afternoon' ? '下午' : '晚上';
    counts[session] += 1;
    const indexInSession = counts[session];
    if (indexInSession === 1) starts[session] = s.start;
    const durationMin = Math.max(1, timeToMin(s.end) - timeToMin(s.start));
    periods.push({
      id: i + 1,
      index: i + 1,
      session,
      sessionName: name,
      indexInSession,
      label: `${name}第${indexInSession}节`,
      start: s.start,
      durationMin,
      end: s.end,
      leftText: s.leftText || ''
    });
  });

  return {
    morningCount: counts.morning,
    afternoonCount: counts.afternoon,
    eveningCount: counts.evening,
    morningStart: starts.morning || DEFAULT_PERIOD_PLAN.morningStart,
    afternoonStart: starts.afternoon || DEFAULT_PERIOD_PLAN.afternoonStart,
    eveningStart: starts.evening || DEFAULT_PERIOD_PLAN.eveningStart,
    breakMin: DEFAULT_PERIOD_PLAN.breakMin,
    periods
  };
}

module.exports = {
  DAY_NAMES,
  DEFAULT_SLOTS,
  DEFAULT_SETTINGS,
  DEFAULT_PERIOD_PLAN,
  DURATION_OPTIONS,
  SESSION_META,
  SLOTS,
  MEMBER_COLORS,
  LEFT_MODES,
  hexToRgba,
  normalizeSlots,
  decorateSlotLeft,
  decorateSlots,
  guessPeriod,
  getWeekDates,
  mondayOf,
  getWeekDatesFromMonday,
  formatDate,
  parseDate,
  weekRangeLabel,
  getSemesterWeek,
  defaultSemesterStart,
  mondayOfWeek,
  getWeekDatesOfWeek,
  weekList,
  slotRange,
  slotsCovered,
  formatWeeksLabel,
  timeToMin,
  minToTime,
  getCalendarRange,
  buildHourLines,
  layoutCalendarEvents,
  buildPeriodsFromPlan,
  planToSlots,
  planFromSlots,
  clampCount
};
