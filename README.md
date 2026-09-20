# 课表搭子

多人共享微信小程序课表。群友叠层查看谁被占用，点开看具体课程/事件。

> Copyright © 2026 rasConverse-code. 保留所有权，详见 [LICENSE](./LICENSE) 与 [NOTICE.md](./NOTICE.md)。

## 功能

- **周视图叠层**：一格多人时显示色条 + 头像点，一眼看出冲突
- **点开详情**：底部弹层列出该时段每位成员的课程名、地点、老师
- **查空闲**：按节次列出今天谁有空
- **双轨录入**：大学课程（按周重复）+ 临时事件
- **群组分享**：邀请码 / 转发小程序卡片进群

## 目录

```
课表/
  project.config.json
  DESIGN.md
  miniprogram/          # 小程序前端
    pages/
      schedule/         # 主课表（Tab）
      friends/          # 群组（Tab）
      profile/          # 我的（Tab）
      course-edit/      # 添加/编辑课程事件
      group-detail/     # 群组详情
    utils/
      store.js          # 数据层（本地 mock，可换云开发）
      mock.js           # 演示数据
      time.js           # 节次、周计算
  cloudfunctions/
    login/
    createGroup/
    joinGroup/
```

## 本地运行（演示模式）

1. 用 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 打开本目录
2. AppID 可选「测试号」
3. 编译后即可体验：默认群组「宿舍 302」含 5 人示例课表
4. 点格子看谁占用；「查空闲」看今天空档；「+ 记一笔」添加条目

未开通云开发时数据存在本机 `Storage`，可在「我的 → 重置演示数据」恢复。

## 接入微信云开发（多人真实同步）

### 1. 开通

开发者工具 → 云开发 → 开通 → 记下环境 ID。

### 2. 配置前端

编辑 `miniprogram/app.js`，把 `envId` 填成你的环境 ID：

```js
const envId = 'your-env-id';
```

### 3. 部署云函数

右键以下目录 →「上传并部署：云端安装依赖」：

- `cloudfunctions/login`
- `cloudfunctions/createGroup`
- `cloudfunctions/joinGroup`

### 4. 建集合

云开发控制台 → 数据库，创建集合：

| 集合 | 说明 | 权限建议 |
|------|------|----------|
| `users` | 用户资料，`_openid` 为文档 id | 仅创建者可读写 |
| `groups` | 群组，`memberIds` 为 openid 数组 | 所有用户可读，仅创建者可写 |
| `courses` | 课程/事件，按 `groupId` + `userId` | 所有用户可读，仅创建者可写 |

### 5. 切换数据层

将 `utils/store.js` 中的本地方法改为调云函数 / 云数据库。接口已按下列形状对齐：

```js
// 群组
createGroup(name)           // → cloud.callFunction createGroup
joinGroupByCode(code, user) // → cloud.callFunction joinGroup
getGroupMembers(groupId)    // → db.collection('users').where(...)
buildWeekGrid(groupId, weekNum)

// 条目
addCourse(course)           // → db.collection('courses').add
updateCourse(id, patch)
removeCourse(id)
```

`store.isCloudReady()` 在 `app.js` 配好 `envId` 后会返回 `true`，可用于 UI 提示。

## 作息设置（按节数配置）

课表左侧**无名称栏**，只显示连续时间轴。

路径：课表页 **「作息」**

1. **课表节数**：分别设置上午 / 下午 / 晚上各几节，并设各段开始时间、课间休息
2. **课表时间**：点「按节数生成」后，对每一节设置**开始时间**与**时长**（下课时间自动算出）
3. **教学周**：开学日、总周数
4. **日历可视时间**：可选

色块上下边界 = 该节开始 / 下课时间。

## 数据模型

```js
Course {
  groupId, userId,
  type: 'course' | 'event',
  title, location?, teacher?, note?,
  dayOfWeek: 1-7,        // 周一 = 1
  startSlot, endSlot,    // 时段索引 1-6（1=1-2节 … 6=11-12节）
  weeks: number[]        // course 生效周；event 为空
}
```

节次表在 `utils/time.js`，可按学校作息改：

| 节次 | 时间 |
|------|------|
| 1-2 | 08:00-09:40 |
| 3-4 | 10:00-11:40 |
| 5-6 | 14:00-15:40 |
| 7-8 | 16:00-17:40 |
| 9-10 | 19:00-20:40 |
| 11-12 | 21:00-22:00 |

## 分享进群

群组页 / 群详情页可转发卡片。路径带 `invite=邀请码`，好友打开后自动调用加入逻辑。

## 设计说明

见 [DESIGN.md](./DESIGN.md)。

## 开源与版权

| 文件 | 作用 |
|------|------|
| [LICENSE](./LICENSE) | MIT 许可证（Copyright © 2026 rasConverse-code） |
| [NOTICE.md](./NOTICE.md) | 版权归属、署名要求、AppID 注意事项 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 欢迎共建：联系方式与协作流程 |

- **著作权归原作者 rasConverse-code**；MIT 仅授予使用/修改/分发许可，**不转让版权**
- 二次分发须保留 `LICENSE` 与版权声明

## 欢迎共建（须先联系）

欢迎协助完善小程序的**未来版本更新与维护**。  
**请先邮件联系，经同意并邀请为 GitHub Collaborator 后再开始协作。**

- 联系邮箱：**rashuang05@gmail.com**
- 邮件请注明：GitHub 用户名、擅长方向、希望改进的内容
- 详细约定见 [CONTRIBUTING.md](./CONTRIBUTING.md)

未经联系请勿以本项目名义对外发布、上架或商业使用。

## 上传 GitHub 步骤

1. 将 `LICENSE` 中的 `课表搭子 作者` 改为你的姓名
2. 确认是否公开 `project.config.json` 里的 appid（正式号建议改占位符）
3. 在 GitHub 新建空仓库（不要勾选 README，本仓库已有）
4. 在本目录执行：

```bash
cd C:\Users\ran\XiaomiMiMoProjects\课表
git init
git add .
git commit -m "Initial release: 课表搭子多人共享课表小程序"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

若使用 SSH：`git remote add origin git@github.com:<用户名>/<仓库名>.git`

5. 之后更新：

```bash
git add .
git commit -m "说明改了什么"
git push
```
