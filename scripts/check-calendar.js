// 日历布局自检
const timeUtil = require('../miniprogram/utils/time.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exitCode = 1;
  } else {
    console.log('OK:', msg);
  }
}

assert(timeUtil.timeToMin('08:00') === 480, 'timeToMin 08:00');
assert(timeUtil.minToTime(480) === '08:00', 'minToTime 480');
assert(timeUtil.minToTime(510) === '08:30', 'minToTime 510');

const slots = timeUtil.DEFAULT_SLOTS;
const range = timeUtil.getCalendarRange(slots, {});
assert(range.startMin < timeUtil.timeToMin('08:00'), 'range starts before first slot');
assert(range.endMin > timeUtil.timeToMin('22:00'), 'range ends after last slot');
assert(range.totalMin > 0, 'totalMin > 0');

const hours = timeUtil.buildHourLines(range);
assert(hours.length >= 8, 'hour lines count, got ' + hours.length);
assert(hours[0].label.indexOf(':00') !== -1, 'hour labels on the hour');

// 周一 1-2 节：我 08:00-09:40，林晓 08:00-09:40，周予 08:00-09:40，叶南 08:00-09:40
const events = [
  { courseId: 'a', startMin: timeUtil.timeToMin('08:00'), endMin: timeUtil.timeToMin('09:40'), title: 'A' },
  { courseId: 'b', startMin: timeUtil.timeToMin('08:00'), endMin: timeUtil.timeToMin('09:40'), title: 'B' },
  { courseId: 'c', startMin: timeUtil.timeToMin('10:00'), endMin: timeUtil.timeToMin('11:40'), title: 'C' }
];
const laid = timeUtil.layoutCalendarEvents(events, range);
assert(laid.length === 3, '3 events laid out');

const ab = laid.filter((x) => x.courseId === 'a' || x.courseId === 'b');
assert(ab.length === 2, 'ab present');
assert(Math.abs(ab[0].widthPct + ab[1].widthPct - 100) < 0.1 || ab[0].widthPct === 50, 'overlap split width');
assert(ab[0].widthPct === 50 && ab[1].widthPct === 50, 'two concurrent share 50% each, got ' + ab[0].widthPct + ' ' + ab[1].widthPct);

const c = laid.find((x) => x.courseId === 'c');
assert(c && c.widthPct === 100, 'non-overlapping full width');

// top/height 对应上下课
const a = laid.find((x) => x.courseId === 'a');
const expectedTop = ((timeUtil.timeToMin('08:00') - range.startMin) / range.totalMin) * 100;
const expectedH = ((timeUtil.timeToMin('09:40') - timeUtil.timeToMin('08:00')) / range.totalMin) * 100;
assert(Math.abs(a.topPct - expectedTop) < 0.01, 'top matches start time');
assert(Math.abs(a.heightPct - expectedH) < 0.01, 'height matches duration');

// 自定义 dayStart/dayEnd
const customRange = timeUtil.getCalendarRange(slots, { dayStart: '07:00', dayEnd: '23:00' });
assert(customRange.startMin === 420 && customRange.endMin === 1380, 'custom calendar range');

console.log('done');
