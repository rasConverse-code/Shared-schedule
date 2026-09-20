const store = require('../../utils/store');
const timeUtil = require('../../utils/time');

Page({
  data: {
    weekLabel: '',
    weekNum: 1,
    totalWeeks: 16,
    semesterStart: '',
    realWeekNum: 1,
    dates: [],
    members: [],
    group: null,
    groups: [],
    groupPickerVisible: false,
    groupOptions: [],
    // 日历
    hours: [],
    blocks: [],
    range: null,
    bodyHeightRpx: 720,
    hourHeightRpx: 120,
    slotMarks: [],
    // 弹层
    sheetVisible: false,
    sheetItems: [],
    sheetFree: [],
    sheetTitle: '',
    sheetTime: '',
    queryMode: false,
    queryResult: null
  },

  onLoad(options) {
    this.pendingInvite = (options && options.invite) || '';
    this.pendingGroupId = (options && options.groupId) || '';
    this.viewWeekNum = null;
  },

  onShow() {
    store.init();
    if (this.pendingInvite) {
      const me = store.getCurrentUser();
      if (me) {
        const result = store.joinGroupByCode(this.pendingInvite, me);
        if (result.ok) {
          store.setCurrentGroup(result.group.groupId);
          wx.showToast({ title: `已加入「${result.group.name}」`, icon: 'none' });
        }
      }
      this.pendingInvite = '';
      this.viewWeekNum = null;
    } else if (this.pendingGroupId) {
      const groups = store.getGroups();
      if (groups.some((g) => g.groupId === this.pendingGroupId)) {
        store.setCurrentGroup(this.pendingGroupId);
      }
      this.pendingGroupId = '';
    }
    this.refresh();
  },

  onPullDownRefresh() {
    this.refresh();
    wx.stopPullDownRefresh();
  },

  refresh() {
    store.init();
    const { semesterStart, totalWeeks } = store.getSemesterInfo();
    const realWeekNum = store.currentWeekNum();

    if (this.viewWeekNum == null) this.viewWeekNum = realWeekNum;
    let weekNum = this.viewWeekNum;
    if (weekNum < 1) weekNum = 1;
    if (weekNum > totalWeeks) weekNum = totalWeeks;
    this.viewWeekNum = weekNum;

    const dates = timeUtil.getWeekDatesOfWeek(semesterStart, weekNum);
    const group = store.getCurrentGroup();
    const groups = store.getGroups();

    if (!group) {
      const emptyRange = timeUtil.getCalendarRange(store.getSlots(), store.getSettings());
      this.setData({
        group: null,
        groups,
        members: [],
        blocks: [],
        hours: timeUtil.buildHourLines(emptyRange),
        range: emptyRange,
        bodyHeightRpx: Math.round((emptyRange.totalMin / 60) * 120),
        slotMarks: this.buildSlotMarks(store.getSlots(), emptyRange),
        dates,
        weekLabel: timeUtil.weekRangeLabel(dates),
        weekNum,
        totalWeeks,
        semesterStart,
        realWeekNum,
        sheetVisible: false,
        groupPickerVisible: false,
        queryMode: false,
        queryResult: null
      });
      return;
    }

    const cal = store.buildWeekCalendar(group.groupId, weekNum);
    const slotMarks = this.buildSlotMarks(cal.slots, cal.range);

    this.setData({
      group,
      groups,
      members: cal.members,
      blocks: cal.blocks,
      hours: cal.hours,
      range: cal.range,
      bodyHeightRpx: cal.bodyHeightRpx,
      hourHeightRpx: cal.hourHeightRpx,
      slotMarks,
      dates,
      weekLabel: timeUtil.weekRangeLabel(dates),
      weekNum,
      totalWeeks,
      semesterStart,
      realWeekNum,
      sheetVisible: false,
      groupPickerVisible: false,
      queryMode: false,
      queryResult: null
    });
  },

  buildSlotMarks(slots, range) {
    return (slots || []).map((s) => {
      const startMin = timeUtil.timeToMin(s.start);
      const endMin = timeUtil.timeToMin(s.end);
      const topPct = ((startMin - range.startMin) / range.totalMin) * 100;
      const heightPct = ((endMin - startMin) / range.totalMin) * 100;
      return {
        id: s.id,
        label: s.label,
        leftMain: s.leftMain || s.label,
        leftSub: s.leftSub || `${s.start}-${s.end}`,
        startLabel: s.start,
        endLabel: s.end,
        topPct,
        heightPct,
        rangeLabel: `${s.start}-${s.end}`
      };
    });
  },

  prevWeek() {
    if (this.viewWeekNum <= 1) return;
    this.viewWeekNum -= 1;
    this.refresh();
  },

  nextWeek() {
    const { totalWeeks } = store.getSemesterInfo();
    if (this.viewWeekNum >= totalWeeks) return;
    this.viewWeekNum += 1;
    this.refresh();
  },

  goThisWeek() {
    this.viewWeekNum = store.currentWeekNum();
    this.refresh();
  },

  /** 点击事件色块 */
  onEventTap(e) {
    const { day, course } = e.currentTarget.dataset;
    if (!course) return;
    const dayInfo = this.data.dates[Number(day) - 1];
    const group = store.getCurrentGroup();
    if (!group) return;

    const cal = store.buildWeekCalendar(group.groupId, this.data.weekNum);
    const occ = cal.dayOccupancy[Number(day) - 1] || { items: [], free: [] };

    // 同时段重叠的其他人
    const items = occ.items.filter((it) => {
      const b = occ.itemsRaw.find((x) => x.courseId === it.courseId);
      if (!b) return true;
      return b.startMin < course.endMin && b.endMin > course.startMin;
    });
    // 至少包含自己点的
    if (!items.some((it) => it.courseId === course.courseId)) {
      items.unshift({
        userId: course.userId,
        nickName: course.nickName,
        color: course.color,
        initial: course.initial,
        isMe: course.isMe,
        type: course.type,
        typeLabel: course.typeLabel,
        title: course.title,
        location: course.location,
        teacher: course.teacher,
        note: course.note,
        courseId: course.courseId,
        rangeLabel: `${course.startLabel}-${course.endLabel}`
      });
    }

    const busyIds = {};
    items.forEach((it) => {
      busyIds[it.userId] = true;
    });
    const free = (cal.members || [])
      .filter((m) => !busyIds[m.userId])
      .map((m) => ({
        nickName: m.nickName,
        color: m.color,
        initial: m.initial,
        isMe: m.isMe
      }));

    this.setData({
      sheetVisible: true,
      sheetTitle: `周${dayInfo ? dayInfo.dayLabel : ''} · ${course.startLabel}-${course.endLabel}`,
      sheetTime: course.location ? course.location : course.typeLabel,
      sheetItems: items,
      sheetFree: free,
      queryMode: false,
      queryResult: null
    });
  },

  /** 点击空白日列：看当日占用与有空 */
  onDayColTap(e) {
    const day = Number(e.currentTarget.dataset.day);
    const group = store.getCurrentGroup();
    if (!group) return;
    const dayInfo = this.data.dates[day - 1];
    const cal = store.buildWeekCalendar(group.groupId, this.data.weekNum);
    const occ = cal.dayOccupancy[day - 1] || { items: [], free: [] };

    this.setData({
      sheetVisible: true,
      sheetTitle: `周${dayInfo ? dayInfo.dayLabel : ''} · 全天占用`,
      sheetTime: this.data.weekLabel || '',
      sheetItems: occ.items,
      sheetFree: occ.free,
      queryMode: false,
      queryResult: null
    });
  },

  closeSheet() {
    this.setData({ sheetVisible: false });
  },

  noop() {},

  onEditCourse(e) {
    const { id } = e.currentTarget.dataset;
    this.closeSheet();
    wx.navigateTo({
      url: id ? `/pages/course-edit/course-edit?id=${id}` : '/pages/course-edit/course-edit'
    });
  },

  onAddTap() {
    const group = store.getCurrentGroup();
    if (!group) {
      wx.showToast({ title: '请先加入或创建群组', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/course-edit/course-edit' });
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  openGroupPicker() {
    const group = store.getCurrentGroup();
    const groups = store.getGroups();
    const options = groups.map((g) => ({
      groupId: g.groupId,
      name: g.name,
      inviteCode: g.inviteCode,
      memberCount: g.memberIds ? g.memberIds.length : 0,
      isCurrent: group && g.groupId === group.groupId
    }));
    this.setData({
      groupPickerVisible: true,
      groupOptions: options,
      sheetVisible: false
    });
  },

  closeGroupPicker() {
    this.setData({ groupPickerVisible: false });
  },

  onSelectGroup(e) {
    const { id } = e.currentTarget.dataset;
    if (!id || id === (this.data.group && this.data.group.groupId)) {
      this.setData({ groupPickerVisible: false });
      return;
    }
    store.setCurrentGroup(id);
    this.setData({ groupPickerVisible: false });
    this.refresh();
    const next = store.getCurrentGroup();
    if (next) {
      wx.showToast({ title: `已切换「${next.name}」`, icon: 'none' });
    }
  },

  goFriends() {
    this.setData({ groupPickerVisible: false });
    wx.switchTab({ url: '/pages/friends/friends' });
  },

  onShareAppMessage() {
    const group = store.getCurrentGroup();
    return {
      title: group ? `「${group.name}」多人课表，来看看谁有空` : '课表搭子 · 多人共享课表',
      path: `/pages/schedule/schedule?groupId=${group ? group.groupId : ''}`
    };
  },

  onQueryFree() {
    const group = store.getCurrentGroup();
    if (!group) return;
    const slots = store.getSlots();
    const dates = this.data.dates;
    const todayIdx = dates.findIndex((d) => d.isToday);
    const day = todayIdx >= 0 ? todayIdx + 1 : 1;
    const dayLabel = todayIdx >= 0 ? '今天' : `周${(dates[day - 1] && dates[day - 1].dayLabel) || '一'}`;
    const rows = slots.map((s) => {
      const occ = store.getSlotOccupancy(group.groupId, day, s.id, this.data.weekNum);
      return {
        label: s.label || s.start,
        time: `${s.start}-${s.end}`,
        free: occ.free.map((m) => ({ nickName: m.nickName, color: m.color })),
        busyCount: occ.items.length
          ? Object.keys(
              occ.items.reduce((acc, it) => {
                acc[it.user.userId] = true;
                return acc;
              }, {})
            ).length
          : 0
      };
    });
    this.setData({
      queryMode: true,
      sheetVisible: true,
      sheetTitle: `第${this.data.weekNum}周 · ${dayLabel} · 谁有空`,
      sheetItems: [],
      sheetFree: [],
      queryResult: rows
    });
  }
});
