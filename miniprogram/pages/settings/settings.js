const store = require('../../utils/store');
const timeUtil = require('../../utils/time');

const DURATION_OPTIONS = timeUtil.DURATION_OPTIONS;

function pad2(n) {
  return String(n).padStart(2, '0');
}

Page({
  data: {
    // 节数
    morningCount: 2,
    afternoonCount: 2,
    eveningCount: 2,
    morningStart: '08:00',
    afternoonStart: '14:00',
    eveningStart: '19:00',
    breakMin: 20,
    breakMinStr: '20',
    // 各节时间
    periods: [],
    durationOptions: DURATION_OPTIONS,
    durationLabels: DURATION_OPTIONS.map((d) => d + ' 分钟'),
    // 教学周 / 日历
    semesterStart: '',
    semesterStartDisplay: '',
    totalWeeks: 16,
    totalWeeksStr: '16',
    currentWeek: 1,
    dayStart: '',
    dayEnd: '',
    totalCount: 6,
    saving: false
  },

  onShow() {
    this.load();
  },

  load() {
    store.init();
    const settings = store.getSettings();
    const plan = store.getPeriodPlan();
    const { semesterStart, totalWeeks } = store.getSemesterInfo();
    const periods = (plan.periods || timeUtil.buildPeriodsFromPlan(plan, null)).map((p, i) => ({
      ...p,
      key: 'p_' + i,
      index: i,
      durationIndex: Math.max(0, DURATION_OPTIONS.indexOf(Number(p.durationMin))),
      durationLabel: String(p.durationMin || 100) + ' 分钟',
      endLabel: p.end || timeUtil.minToTime(timeUtil.timeToMin(p.start) + Number(p.durationMin || 0))
    }));

    const calRange = timeUtil.getCalendarRange(timeUtil.planToSlots(plan), settings);

    this.setData({
      morningCount: plan.morningCount != null ? plan.morningCount : 2,
      afternoonCount: plan.afternoonCount != null ? plan.afternoonCount : 2,
      eveningCount: plan.eveningCount != null ? plan.eveningCount : 2,
      morningStart: plan.morningStart || '08:00',
      afternoonStart: plan.afternoonStart || '14:00',
      eveningStart: plan.eveningStart || '19:00',
      breakMin: plan.breakMin != null ? plan.breakMin : 20,
      breakMinStr: String(plan.breakMin != null ? plan.breakMin : 20),
      periods,
      totalCount: periods.length,
      semesterStart,
      semesterStartDisplay: semesterStart || timeUtil.defaultSemesterStart(),
      totalWeeks,
      totalWeeksStr: String(totalWeeks),
      currentWeek: store.currentWeekNum(),
      dayStart: settings.dayStart || calRange.startLabel,
      dayEnd: settings.dayEnd || calRange.endLabel
    });
  },

  /** 节数 ± */
  onCountStep(e) {
    const { field, delta } = e.currentTarget.dataset;
    const cur = Number(this.data[field]) || 0;
    const next = timeUtil.clampCount(cur + Number(delta), 12);
    this.setData({ [field]: next }, () => this.regenPeriods(true));
  },

  onSessionStartChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value }, () => this.regenPeriods(true));
  },

  onBreakInput(e) {
    this.setData({ breakMinStr: e.detail.value });
  },

  /** 按节数重新生成各节列表（尽量保留已设时间） */
  regenPeriods(keepPrev) {
    const d = this.data;
    const prev = keepPrev ? d.periods : [];
    const plan = {
      morningCount: d.morningCount,
      afternoonCount: d.afternoonCount,
      eveningCount: d.eveningCount,
      morningStart: d.morningStart,
      afternoonStart: d.afternoonStart,
      eveningStart: d.eveningStart,
      breakMin: parseInt(d.breakMinStr, 10) || 0
    };
    const periods = timeUtil.buildPeriodsFromPlan(plan, prev).map((p, i) => ({
      ...p,
      key: 'p_' + i,
      index: i,
      durationIndex: Math.max(0, DURATION_OPTIONS.indexOf(Number(p.durationMin))),
      durationLabel: String(p.durationMin) + ' 分钟',
      endLabel: p.end
    }));
    this.setData({ periods, totalCount: periods.length });
  },

  onTapRegen() {
    this.regenPeriods(true);
    wx.showToast({ title: '已按节数生成', icon: 'none' });
  },

  onPeriodStartChange(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const start = e.detail.value;
    const key = `periods[${idx}].start`;
    const dur = Number(this.data.periods[idx].durationMin) || 100;
    const end = timeUtil.minToTime(timeUtil.timeToMin(start) + dur);
    this.setData({
      [key]: start,
      [`periods[${idx}].end`]: end,
      [`periods[${idx}].endLabel`]: end
    });
  },

  onPeriodDurationChange(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const di = Number(e.detail.value);
    const durationMin = DURATION_OPTIONS[di] || 100;
    const start = this.data.periods[idx].start;
    const end = timeUtil.minToTime(timeUtil.timeToMin(start) + durationMin);
    this.setData({
      [`periods[${idx}].durationIndex`]: di,
      [`periods[${idx}].durationMin`]: durationMin,
      [`periods[${idx}].durationLabel`]: durationMin + ' 分钟',
      [`periods[${idx}].end`]: end,
      [`periods[${idx}].endLabel`]: end
    });
  },

  onSemesterStartChange(e) {
    this.setData({
      semesterStart: e.detail.value,
      semesterStartDisplay: e.detail.value
    });
  },

  onDayStartChange(e) {
    this.setData({ dayStart: e.detail.value });
  },

  onDayEndChange(e) {
    this.setData({ dayEnd: e.detail.value });
  },

  onTotalWeeksInput(e) {
    this.setData({ totalWeeksStr: e.detail.value });
  },

  buildPlanFromForm() {
    const d = this.data;
    const breakMin = Math.max(0, parseInt(d.breakMinStr, 10) || 0);
    const periods = (d.periods || []).map((p, i) => {
      const start = String(p.start || '').trim();
      const durationMin = Number(p.durationMin) || 50;
      const end = timeUtil.minToTime(timeUtil.timeToMin(start) + durationMin);
      return {
        id: i + 1,
        index: i + 1,
        session: p.session,
        sessionName: p.sessionName,
        indexInSession: p.indexInSession,
        label: p.label,
        start,
        durationMin,
        end,
        leftText: ''
      };
    });

    for (let i = 0; i < periods.length; i++) {
      if (!periods[i].start) {
        wx.showToast({ title: `第 ${i + 1} 节未设置开始时间`, icon: 'none' });
        return null;
      }
    }

    return {
      morningCount: d.morningCount,
      afternoonCount: d.afternoonCount,
      eveningCount: d.eveningCount,
      morningStart: d.morningStart,
      afternoonStart: d.afternoonStart,
      eveningStart: d.eveningStart,
      breakMin,
      periods
    };
  },

  onSave() {
    const plan = this.buildPlanFromForm();
    if (!plan) return;

    const totalWeeks = Math.max(1, Math.min(30, parseInt(this.data.totalWeeksStr, 10) || 16));
    const semesterStart = this.data.semesterStart || timeUtil.defaultSemesterStart();
    const dayStart = String(this.data.dayStart || '').trim();
    const dayEnd = String(this.data.dayEnd || '').trim();
    if (dayStart && dayEnd && dayStart >= dayEnd) {
      wx.showToast({ title: '日历结束时间须晚于开始', icon: 'none' });
      return;
    }

    try {
      store.updateSettings({
        periodPlan: plan,
        semesterStart,
        totalWeeks,
        dayStart,
        dayEnd,
        leftMode: 'time_only'
      });
      wx.showToast({ title: '已保存', icon: 'success' });
      this.load();
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  restoreDefault() {
    const that = this;
    wx.showModal({
      title: '恢复默认作息',
      content: '上午/下午/晚上各 2 节，课表左栏仅显示时间轴（无名称栏）。',
      success(res) {
        if (!res.confirm) return;
        const plan = {
          ...timeUtil.DEFAULT_PERIOD_PLAN,
          periods: timeUtil.buildPeriodsFromPlan(timeUtil.DEFAULT_PERIOD_PLAN, null)
        };
        store.updateSettings({
          periodPlan: plan,
          slots: timeUtil.planToSlots(plan),
          totalWeeks: 16,
          semesterStart: timeUtil.defaultSemesterStart(),
          dayStart: '',
          dayEnd: '',
          leftMode: 'time_only'
        });
        that.load();
        wx.showToast({ title: '已恢复默认', icon: 'success' });
      }
    });
  }
});
