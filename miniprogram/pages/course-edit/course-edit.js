const store = require('../../utils/store');
const timeUtil = require('../../utils/time');

const TYPE_OPTIONS = ['course', 'event'];
const TYPE_LABELS = ['课程', '事件'];

function buildWeekChips(weeks, totalWeeks) {
  return timeUtil.weekList(totalWeeks).map((n) => ({
    n,
    on: !weeks || !weeks.length ? true : weeks.indexOf(n) !== -1
  }));
}

function chipsToWeeks(chips) {
  return chips.filter((c) => c.on).map((c) => c.n);
}

Page({
  data: {
    id: '',
    isEdit: false,
    typeIndex: 0,
    typeOptions: TYPE_LABELS,
    title: '',
    location: '',
    teacher: '',
    note: '',
    dayIndex: 0,
    dayLabels: timeUtil.DAY_NAMES,
    startSlotIndex: 0,
    endSlotIndex: 0,
    slotLabels: [],
    slots: [],
    weekChips: [],
    totalWeeks: 16,
    weeksSummary: '',
    saving: false
  },

  onLoad(options) {
    store.init();
    const slots = store.getSlots();
    const { totalWeeks } = store.getSemesterInfo();
    const slotLabels = slots.map((s) => `第${s.label}节 ${s.start}-${s.end}`);
    let weekChips = buildWeekChips([], totalWeeks);

    this.setData({
      slots,
      slotLabels,
      totalWeeks,
      weekChips,
      weeksSummary: timeUtil.formatWeeksLabel(chipsToWeeks(weekChips), totalWeeks)
    });

    if (options && options.id) {
      const group = store.getCurrentGroup();
      const courses = group ? store.getCourses(group.groupId) : [];
      const c = courses.find((x) => x._id === options.id);
      if (c) {
        const maxSlot = slots.length;
        const startSlotIndex = Math.min(Math.max(0, (c.startSlot || 1) - 1), maxSlot - 1);
        const endSlotIndex = Math.min(Math.max(startSlotIndex, (c.endSlot || c.startSlot || 1) - 1), maxSlot - 1);
        const weeks = c.type === 'course' ? (c.weeks && c.weeks.length ? c.weeks : timeUtil.weekList(totalWeeks)) : [];
        weekChips = c.type === 'course'
          ? buildWeekChips(weeks, totalWeeks)
          : timeUtil.weekList(totalWeeks).map((n) => ({ n, on: false }));
        this.setData({
          id: c._id,
          isEdit: true,
          typeIndex: TYPE_OPTIONS.indexOf(c.type),
          title: c.title,
          location: c.location || '',
          teacher: c.teacher || '',
          note: c.note || '',
          dayIndex: c.dayOfWeek - 1,
          startSlotIndex,
          endSlotIndex,
          weekChips,
          weeksSummary: c.type === 'course'
            ? timeUtil.formatWeeksLabel(chipsToWeeks(weekChips), totalWeeks)
            : '不按周重复'
        });
        wx.setNavigationBarTitle({ title: '编辑条目' });
        return;
      }
    }
    wx.setNavigationBarTitle({ title: '添加课程 / 事件' });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  onTypeChange(e) {
    const typeIndex = Number(e.detail.value);
    const isCourse = TYPE_OPTIONS[typeIndex] === 'course';
    let weekChips = this.data.weekChips;
    if (isCourse && !chipsToWeeks(weekChips).length) {
      weekChips = buildWeekChips([], this.data.totalWeeks);
    }
    this.setData({
      typeIndex,
      weekChips,
      weeksSummary: isCourse
        ? timeUtil.formatWeeksLabel(chipsToWeeks(weekChips), this.data.totalWeeks)
        : '不按周重复'
    });
  },

  onDayChange(e) {
    this.setData({ dayIndex: Number(e.detail.value) });
  },

  onStartSlotChange(e) {
    const start = Number(e.detail.value);
    let end = this.data.endSlotIndex;
    if (end < start) end = start;
    this.setData({ startSlotIndex: start, endSlotIndex: end });
  },

  onEndSlotChange(e) {
    const end = Number(e.detail.value);
    let start = this.data.startSlotIndex;
    if (end < start) start = end;
    this.setData({ endSlotIndex: end, startSlotIndex: start });
  },

  toggleWeek(e) {
    if (TYPE_OPTIONS[this.data.typeIndex] !== 'course') {
      wx.showToast({ title: '事件不按周重复', icon: 'none' });
      return;
    }
    const { n } = e.currentTarget.dataset;
    const weekChips = this.data.weekChips.map((c) =>
      c.n === n ? { ...c, on: !c.on } : c
    );
    this.setData({
      weekChips,
      weeksSummary: timeUtil.formatWeeksLabel(chipsToWeeks(weekChips), this.data.totalWeeks)
    });
  },

  selectAllWeeks() {
    const weekChips = buildWeekChips([], this.data.totalWeeks);
    this.setData({
      weekChips,
      weeksSummary: timeUtil.formatWeeksLabel(chipsToWeeks(weekChips), this.data.totalWeeks)
    });
  },

  clearWeeks() {
    const weekChips = this.data.weekChips.map((c) => ({ ...c, on: false }));
    this.setData({
      weekChips,
      weeksSummary: '未选择（将显示为每周）'
    });
  },

  selectOddWeeks() {
    const weekChips = this.data.weekChips.map((c) => ({ ...c, on: c.n % 2 === 1 }));
    this.setData({
      weekChips,
      weeksSummary: timeUtil.formatWeeksLabel(chipsToWeeks(weekChips), this.data.totalWeeks)
    });
  },

  selectEvenWeeks() {
    const weekChips = this.data.weekChips.map((c) => ({ ...c, on: c.n % 2 === 0 }));
    this.setData({
      weekChips,
      weeksSummary: timeUtil.formatWeeksLabel(chipsToWeeks(weekChips), this.data.totalWeeks)
    });
  },

  onDelete() {
    const that = this;
    wx.showModal({
      title: '删除确认',
      content: '删除后群内成员将看不到这条记录',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success(res) {
        if (res.confirm) {
          store.removeCourse(that.data.id);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 400);
        }
      }
    });
  },

  onSave() {
    const d = this.data;
    if (!d.title || !d.title.trim()) {
      wx.showToast({ title: '请填写名称', icon: 'none' });
      return;
    }

    const type = TYPE_OPTIONS[d.typeIndex];
    const me = store.getCurrentUser();
    let weeks = [];
    if (type === 'course') {
      weeks = chipsToWeeks(d.weekChips);
      if (!weeks.length) {
        // 未勾选则默认全选
        weeks = timeUtil.weekList(d.totalWeeks);
      }
    }

    const payload = {
      userId: me.userId,
      type,
      title: d.title.trim(),
      location: (d.location || '').trim(),
      teacher: (d.teacher || '').trim(),
      note: (d.note || '').trim(),
      dayOfWeek: d.dayIndex + 1,
      startSlot: d.startSlotIndex + 1,
      endSlot: d.endSlotIndex + 1,
      weeks
    };

    this.setData({ saving: true });
    try {
      if (d.isEdit) {
        store.updateCourse(d.id, payload);
      } else {
        store.addCourse(payload);
      }
      wx.showToast({ title: '已保存', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 400);
    } catch (err) {
      this.setData({ saving: false });
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
