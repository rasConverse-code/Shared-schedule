const store = require('../../utils/store');

Page({
  data: {
    groups: [],
    currentGroupId: '',
    showJoin: false,
    showCreate: false,
    inviteCode: '',
    groupName: '',
    cloudReady: false
  },

  onShow() {
    store.init();
    const groups = store.getGroups();
    const current = store.getCurrentGroup();
    this.setData({
      groups: groups.map((g) => ({
        ...g,
        memberCount: g.memberIds.length,
        isCurrent: current && g.groupId === current.groupId
      })),
      currentGroupId: current ? current.groupId : '',
      cloudReady: store.isCloudReady()
    });
  },

  openCreate() {
    this.setData({ showCreate: true, groupName: '' });
  },

  openJoin() {
    this.setData({ showJoin: true, inviteCode: '' });
  },

  closeModals() {
    this.setData({ showCreate: false, showJoin: false });
  },

  onNameInput(e) {
    this.setData({ groupName: e.detail.value });
  },

  onCodeInput(e) {
    this.setData({ inviteCode: e.detail.value });
  },

  createGroup() {
    const name = (this.data.groupName || '').trim() || '新群组';
    const g = store.createGroup(name);
    store.setCurrentGroup(g.groupId);
    this.setData({ showCreate: false });
    wx.showToast({ title: '已创建', icon: 'success' });
    this.onShow();
  },

  joinGroup() {
    const code = (this.data.inviteCode || '').trim();
    if (!code) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }
    // 本地演示：同设备模拟一个群友身份加入
    const me = store.getCurrentUser();
    const result = store.joinGroupByCode(code, {
      userId: me.userId,
      nickName: me.nickName,
      avatarUrl: me.avatarUrl,
      colorIndex: me.colorIndex,
      isMe: true
    });
    if (!result.ok) {
      // 尝试用演示邀请码
      wx.showModal({
        title: '邀请码无效',
        content: '演示环境可尝试 K302XX，或先创建自己的群组。开通云开发后，好友通过分享卡片直接加入。',
        showCancel: false
      });
      return;
    }
    store.setCurrentGroup(result.group.groupId);
    this.setData({ showJoin: false });
    wx.showToast({ title: '已加入', icon: 'success' });
    this.onShow();
  },

  switchGroup(e) {
    const { id } = e.currentTarget.dataset;
    store.setCurrentGroup(id);
    this.onShow();
    wx.showToast({ title: '已切换', icon: 'none' });
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/group-detail/group-detail?id=${id}` });
  },

  onShareAppMessage() {
    const current = store.getCurrentGroup();
    if (!current) {
      return {
        title: '一起来叠层看课表',
        path: '/pages/friends/friends'
      };
    }
    return {
      title: `加入「${current.name}」，一起看谁有空`,
      path: `/pages/schedule/schedule?groupId=${current.groupId}&invite=${current.inviteCode}`
    };
  },

  copyCode(e) {
    const { code } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: code,
      success() {
        wx.showToast({ title: '邀请码已复制', icon: 'none' });
      }
    });
  }
});
