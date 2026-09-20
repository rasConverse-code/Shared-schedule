// 本地逻辑自检：不依赖 wx API
const timeUtil = require('../miniprogram/utils/time.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exitCode = 1;
  } else {
    console.log('OK:', msg);
  }
}

const dates = timeUtil.getWeekDates('2026-03-11');
assert(dates.length === 7, '一周 7 天');
assert(dates[0].dayOfWeek === 1 && dates[0].dayLabel === '一', '周一起始');
assert(dates[2].date === '2026-03-11', '周三日期');

assert(timeUtil.slotRange(1, 1) === '08:00-09:40', '默认 1-2 节时间');
assert(timeUtil.slotRange(2, 2) === '10:00-11:40', '默认 3-4 节时间');

const custom = [
  { label: '早', start: '07:30', end: '08:20' },
  { label: '上1', start: '08:30', end: '10:00' },
  { label: '上2', start: '10:20', end: '11:50' }
];
assert(timeUtil.slotRange(1, 2, custom) === '07:30-10:00', '自定义时段');
assert(timeUtil.normalizeSlots(custom).length === 3, 'normalize 长度');
assert(timeUtil.normalizeSlots(custom)[0].period === '上午', 'period 推断');

const week = timeUtil.getSemesterWeek('2026-03-11', '2026-03-02');
assert(week === 2, '学期第 2 周，got ' + week);

const weekDates = timeUtil.getWeekDatesOfWeek('2026-03-02', 2);
assert(weekDates[0].date === '2026-03-09', '第2周周一应为 03-09，got ' + weekDates[0].date);
assert(weekDates[6].date === '2026-03-15', '第2周周日');

assert(timeUtil.weekList(16).length === 16, 'weekList 16');
assert(timeUtil.weekList(20).length === 20, 'weekList 20');
assert(timeUtil.formatWeeksLabel([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], 16) === '1-16周', '全周压缩');
assert(timeUtil.formatWeeksLabel([1,3,5], 16) === '1,3,5周', '单双混');
assert(timeUtil.formatWeeksLabel([], 16) === '每周', '空周=每周');

const slot = { label: '早八', start: '08:00', end: '09:40', leftText: '8点上课' };
const d1 = timeUtil.decorateSlotLeft(slot, 'label_range');
assert(d1.leftMain === '早八' && d1.leftSub === '08:00-09:40', '左栏：名称+起止');
const d2 = timeUtil.decorateSlotLeft(slot, 'label_custom');
assert(d2.leftSub === '8点上课', '左栏：自定义时间');
const d3 = timeUtil.decorateSlotLeft(slot, 'label_only');
assert(d3.leftMain === '早八' && d3.leftSub === '', '左栏：仅名称');
const d4 = timeUtil.decorateSlotLeft(slot, 'time_only');
assert(d4.leftMain === '08:00' && d4.leftSub === '09:40', '左栏：仅时间');
const decorated = timeUtil.decorateSlots([slot], 'label_custom');
assert(decorated[0].leftSub === '8点上课', 'decorateSlots 保留自定义');

// 节数 → 节次方案
const plan = timeUtil.buildPeriodsFromPlan({
  morningCount: 2,
  afternoonCount: 1,
  eveningCount: 2,
  morningStart: '08:00',
  afternoonStart: '14:00',
  eveningStart: '19:00',
  breakMin: 10
}, null);
assert(plan.length === 5, '节数 2+1+2=5，got ' + plan.length);
assert(plan[0].label === '上午第1节' && plan[0].start === '08:00', '上午第1节');
assert(plan[0].end === timeUtil.minToTime(480 + 100), '默认时长 100 分钟');
assert(plan[2].sessionName === '下午', '下午节次');
const slots5 = timeUtil.planToSlots({
  morningCount: 2,
  afternoonCount: 1,
  eveningCount: 2,
  morningStart: '08:00',
  afternoonStart: '14:00',
  eveningStart: '19:00',
  breakMin: 10,
  periods: plan
});
assert(slots5.length === 5, 'planToSlots 长度');
assert(slots5[0].start === '08:00' && slots5[0].end === '09:40', 'slots0 时间');

const back = timeUtil.planFromSlots(timeUtil.DEFAULT_SLOTS);
assert(back.morningCount === 2 && back.afternoonCount === 2 && back.eveningCount === 2, '从 slots 反推节数');

console.log('done');
