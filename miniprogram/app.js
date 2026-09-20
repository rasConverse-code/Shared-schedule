App({
  globalData: {
    userInfo: null,
    openid: '',
    currentGroupId: '',
    cloudReady: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    // 云开发环境 ID：开通后填入，未填则走本地 mock
    const envId = '';
    if (envId) {
      wx.cloud.init({
        env: envId,
        traceUser: true
      });
      this.globalData.cloudReady = true;
    }

    const store = require('./utils/store');
    store.init();
  }
});
