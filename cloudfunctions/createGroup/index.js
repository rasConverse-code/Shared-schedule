// 创建群组并生成邀请码
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const name = (event.name || '新群组').slice(0, 20);
  const nickName = event.nickName || '我';

  if (!openid) {
    return { ok: false, msg: '未登录' };
  }

  let inviteCode = genCode();
  // 极小概率冲突，重试几次
  for (let i = 0; i < 5; i++) {
    const exist = await db.collection('groups').where({ inviteCode }).count();
    if (!exist.total) break;
    inviteCode = genCode();
  }

  await db.collection('users').doc(openid).set({
    data: { nickName, updatedAt: Date.now() }
  });

  const addRes = await db.collection('groups').add({
    data: {
      name,
      inviteCode,
      ownerId: openid,
      memberIds: [openid],
      memberCount: 1,
      createdAt: Date.now()
    }
  });

  return {
    ok: true,
    group: {
      groupId: addRes._id,
      name,
      inviteCode,
      ownerId: openid
    }
  };
};
