const store = require('../../utils/store');
const timeUtil = require('../../utils/time');

Page({
  data: {
    user: { nickName: '我', initial: '我' },
    courses: [],
    color: '#4F6EF7',
    settingsBrief: '',
    cloudReady: false
  },

  onShow() {
    store.init();
    const user = store.getCurrentUser();
    const group = store.getCurrentGroup();
    const slots = store.getSlots();
    const { totalWeeks } = store.getSemesterInfo();
    let courses = [];
    let color = timeUtil.MEMBER_COLORS[0];
    if (group && user) {
      courses = store.getMyCourses(group.groupId, user.userId).map((c) => ({
        ...c,
        dayLabel: '周' + timeUtil.DAY_NAMES[c.dayOfWeek - 1],
        rangeLabel: timeUtil.slotRange(c.startSlot, c.endSlot, slots),
        weeksLabel: c.type === 'course'
          ? timeUtil.formatWeeksLabel(c.weeks, totalWeeks)
          : '',
        typeLabel: c.type === 'event' ? '事件' : '课程'
      }));
      const members = store.getGroupMembers(group.groupId);
      const me = members.find((m) => m.userId === user.userId);
      if (me) color = me.color;
    }
    courses.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startSlot - b.startSlot);
    const settings = store.getSettings();
    this.setData({
      user: user
        ? { ...user, initial: (user.nickName || '我').slice(0, 1) }
        : { nickName: '我', initial: '我' },
      courses,
      color,
      settingsBrief: `${settings.slots.length} 个时段 · ${totalWeeks} 周`,
      cloudReady: store.isCloudReady()
    });
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  onNickInput(e) {
    this.setData({ 'user.nickName': e.detail.value });
  },

  saveNick() {
    const name = (this.data.user.nickName || '').trim();
    if (!name) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    store.updateProfile({ nickName: name });
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  goEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: id ? `/pages/course-edit/course-edit?id=${id}` : '/pages/course-edit/course-edit'
    });
  },

  resetDemo() {
    const that = this;
    wx.showModal({
      title: '重置演示数据',
      content: '将恢复初始群组与示例课表，本地改动会丢失。',
      success(res) {
        if (res.confirm) {
          store.resetDemo();
          that.onShow();
          wx.showToast({ title: '已重置', icon: 'success' });
        }
      }
    });
  }
});
