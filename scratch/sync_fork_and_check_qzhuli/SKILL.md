---
name: sync_fork_and_check
description: 同步 Fork 仓库并运行构建检查。当用户需要同步 fork 的仓库代码并验证构建是否通过时使用此技能。
---

# Sync Fork and Check

此技能用于同步 Fork 的仓库（`shootdev/LobsterAI`）到上游（`netease-youdao/LobsterAI`）的最新代码并验证构建。

## 仓库背景

- **Fork**: `shootdev/LobsterAI` — 私有化产品「Q助理电脑机器人」，集成了专属 Qzhuli IM 网关
- **Upstream**: `netease-youdao/LobsterAI` — 开源版，持续新增 IM 渠道、功能等
- **合并策略**：**保留两侧所有内容** — fork 的 Qzhuli/Q助理 特性 + upstream 新增平台（QQ、企业微信、小蜜蜂等）

## 工作流程

### 1. 合并前分析

在合并前，先了解上游新增了哪些内容：

```bash
git fetch upstream
git log --oneline upstream/main ^HEAD  # 查看上游新增的 commit
git diff HEAD...upstream/main --stat    # 预览变更文件
```

重点关注以下高冲突文件（本 fork 历史上必然冲突的文件）：

| 文件                                        | 冲突原因                     |
| ------------------------------------------- | ---------------------------- |
| `src/main/im/imGatewayManager.ts`           | 双方都在扩展 IM 平台分支逻辑 |
| `src/main/im/imStore.ts`                    | 双方都在增加平台配置字段     |
| `src/main/im/types.ts`                      | 平台类型联合、默认值对象     |
| `src/renderer/components/im/IMSettings.tsx` | 双方都在添加平台 UI          |
| `src/renderer/components/Settings.tsx`      | About 区域品牌、功能差异     |
| `src/renderer/types/electron.d.ts`          | IM 接口类型扩展              |
| `src/renderer/services/i18n.ts`             | 新增平台名称翻译             |
| `src/renderer/utils/regionFilter.ts`        | 各自新增的平台常量           |
| `package.json`                              | 脚本、依赖版本               |
| `electron-builder.json`                     | 构建配置格式化/字段          |

### 2. 暂存本地修改

```bash
git stash push -m "local-dev-tweaks: <描述>"
```

### 3. 执行合并

```bash
git merge upstream/main
```

如果出现冲突（大概率），`git status` 查看冲突文件列表，逐一解决。

### 4. 冲突解决规则

#### 4.1 IM 平台类型 / 联合类型

**原则：保留双方所有平台。**

当前完整平台联合类型（按字母排序保持稳定）：

```typescript
"dingtalk" |
  "discord" |
  "feishu" |
  "nim" |
  "qq" |
  "qzhuli" |
  "telegram" |
  "wecom" |
  "xiaomifeng";
```

涉及文件：`src/main/im/types.ts`、`src/renderer/types/im.ts`、`src/main/preload.ts`、`src/renderer/types/electron.d.ts`

#### 4.2 区域过滤 / 平台列表常量

`src/renderer/utils/regionFilter.ts` 中的 `CHINA_IM_PLATFORMS` 数组需同时包含 fork 的 `'qzhuli'` 和 upstream 新增的平台。

#### 4.3 IMSettings.tsx

- `platformMeta` 中保留所有平台入口，包括 `qzhuli: { label: 'Q助理', logo: 'qzhuli.png' }`
- `getSetConfigAction` map 需覆盖全部 9 个平台
- **保留** fork 的 QZhuli 绑定流程（QR 码弹窗、auto-open modal、`onQzhuliBindCompleted` prop）
- **增加** upstream 新增的平台处理器（Xiaomifeng、WeCom 等）
- **保留** upstream 的 `errorMessageI18nMap` + `translateIMError` 工具函数

#### 4.4 Settings.tsx — About 区域

- 保留 fork 的品牌：`Q助理电脑机器人`（产品名）
- 保留 upstream 的功能：日志导出、检查更新、测试模式解锁（logo 点击 10 次）、用户手册链接
- 版权行：使用 `© {year}` 替换掉 NetEase Youdao 版权声明
- `ABOUT_CONTACT_EMAIL`、`ABOUT_USER_MANUAL_URL`、`ABOUT_SERVICE_TERMS_URL` 常量从 upstream 引入但可按需修改

#### 4.5 endpoints.ts — 更新检查 URL

`src/renderer/services/endpoints.ts` 统一使用 Qzhuli 的 URL：

```typescript
export const getUpdateCheckUrl = () =>
  isTestMode()
    ? "https://test.client.qzhuli.com/sys/lobsterai_update_config"
    : "https://client.qzhuli.com/sys/lobsterai_update_config";

export const getFallbackDownloadUrl = () => (isTestMode() ? "" : "");
```

#### 4.6 package.json

- `start:electron` 脚本：在参数末尾保留 `--no-sandbox`（Linux 开发必需）
- `dist:linux` 脚本：使用 `node scripts/prepare-dist-dir.js &&` 前缀，且只构建 `build:skill:web-search`（不包含 tech-news/email skill）
- 其余 dist 脚本使用 upstream 的完整 `build:skills`

#### 4.7 electron-builder.json

- `win` 段：保留 upstream 的 `extraResources`（mingit + python-win）
- `linux` 段：保留 `["AppImage", "deb"]` 双目标
- 格式优先以 upstream 的多行风格为准（避免 stash 格式化引入噪音）

#### 4.8 i18n.ts

保留双方的翻译键。fork 专属键：

```typescript
qzhuli: "Q助理"; // zh
qzhuli: "QZhuli"; // en
```

### 5. 完成合并

```bash
git add <已解决的文件...>
git commit -m "feat: merge upstream/main (vX.X.X) into fork - <本次主要变更描述>"
```

### 6. 恢复本地修改

```bash
git stash pop
# 若有冲突，按上述规则解决后 git add + git stash drop
```

### 7. 运行构建检查

```bash
npm install --force  # 如果 upstream 新增了依赖
npm run build
```

构建常见的后合并问题：

- **`\n` 转义字符串出现在 .tsx 文件** — 合并工具将换行符变为字面量，需手动展开为正确的多行代码
- **方法被放错位置** — 检查大括号嵌套深度，确保代码块归属正确的方法
- **对象重复 key**（如 `DEFAULT_IM_STATUS` 中重复的平台字段）— 删除重复项
- **缺少依赖** — `npm install --force` 安装 upstream 新增的包

### 8. 推送

```bash
git push origin main
```

## 注意事项

- 合并前务必 `git stash`，避免未提交内容干扰冲突解决
- 因 fork 和 upstream 长期并行演进，每次同步都可能有 10–20 个文件冲突，这是正常的
- 合并基点越新，下次冲突越少；建议每隔 1–2 个上游版本同步一次
- Node.js 版本要求 `>=24 <25`，构建时如遇版本警告可加 `--engine-strict=false`
