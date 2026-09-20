const store = require('../../utils/store');

Page({
  data: {
    group: null,
    members: [],
    myCourseCount: 0
  },

  onLoad(options) {
    const id = options && options.id;
    store.init();
    const groups = store.getGroups();
    const group = groups.find((g) => g.groupId === id) || store.getCurrentGroup();
    if (!group) {
      wx.navigateBack();
      return;
    }
    const members = store.getGroupMembers(group.groupId);
    const me = store.getCurrentUser();
    const myCourses = store.getMyCourses(group.groupId, me.userId);
    this.setData({
      group,
      members,
      myCourseCount: myCourses.length
    });
  },

  copyCode() {
    const code = this.data.group.inviteCode;
    wx.setClipboardData({
      data: code,
      success() {
        wx.showToast({ title: '已复制邀请码', icon: 'none' });
      }
    });
  },

  onShareAppMessage() {
    const g = this.data.group;
    return {
      title: `加入「${g.name}」，叠层看课表`,
      path: `/pages/schedule/schedule?groupId=${g.groupId}&invite=${g.inviteCode}`
    };
  },

  leaveGroup() {
    const that = this;
    const g = this.data.group;
    wx.showModal({
      title: '退出群组',
      content: `确定退出「${g.name}」？你的课程将不再对群友可见。`,
      confirmText: '退出',
      confirmColor: '#EF4444',
      success(res) {
        if (res.confirm) {
          store.leaveGroup(g.groupId);
          wx.showToast({ title: '已退出', icon: 'none' });
          setTimeout(() => {
            wx.switchTab({ url: '/pages/friends/friends' });
          }, 400);
        }
      }
    });
  },

  goSchedule() {
    store.setCurrentGroup(this.data.group.groupId);
    wx.switchTab({ url: '/pages/schedule/schedule' });
  }
});
