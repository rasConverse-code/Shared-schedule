function rpx(px) {
  // 用于 JS 内联样式时的简单换算提示（小程序 rpx 自动生效，此函数备用）
  return px;
}

function initials(name) {
  if (!name) return '?';
  return name.slice(0, 1);
}

function uid() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = {
  rpx,
  initials,
  uid
};
