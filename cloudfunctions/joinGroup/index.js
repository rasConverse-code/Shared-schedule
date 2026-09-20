// 通过邀请码加入群组
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const inviteCode = String(event.inviteCode || '').trim().toUpperCase();
  const nickName = event.nickName || '群友';
  const avatarUrl = event.avatarUrl || '';

  if (!openid || !inviteCode) {
    return { ok: false, msg: '参数不完整' };
  }

  const gRes = await db
    .collection('groups')
    .where({ inviteCode })
    .limit(1)
    .get();

  if (!gRes.data.length) {
    return { ok: false, msg: '邀请码无效' };
  }

  const group = gRes.data[0];

  // 确保用户文档存在
  await db
    .collection('users')
    .doc(openid)
    .set({
      data: {
        nickName,
        avatarUrl,
        updatedAt: Date.now()
      }
    });

  const inGroup = (group.memberIds || []).indexOf(openid) !== -1;
  if (!inGroup) {
    await db
      .collection('groups')
      .doc(group._id)
      .update({
        data: {
          memberIds: db.command.addToSet(openid),
          memberCount: (group.memberIds || []).length + 1
        }
      });
  }

  return {
    ok: true,
    group: {
      groupId: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
      ownerId: group.ownerId
    }
  };
};
