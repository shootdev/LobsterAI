# Repo Snapshot — shootdev/LobsterAI

> Read this file before every sync. Update it after every successful sync.

## Identity

| Field                | Value                                       |
| -------------------- | ------------------------------------------- |
| Fork                 | `git@github.com:shootdev/LobsterAI.git`     |
| Upstream             | `git@github.com:netease-youdao/LobsterAI.git` |
| Fork product name    | Q助理电脑机器人                             |
| Fork version         | 2026.3.22                                   |
| Build command        | `npm run build`                             |
| Runtime requirements | Node >=24 <25                               |

## Current state (as of 2026-03-23)

|                     | Commit             | Note                      |
| ------------------- | ------------------ | ------------------------- |
| Fork HEAD           | `cce9a92`          | feat: merge upstream/main (v0.2.4) - sync fork with OpenClaw architecture updates |
| Last upstream merge | `cce9a92`          | merged upstream v0.2.4    |
| upstream/main HEAD  | `9bed181`          | tag `v0.2.4` lineage      |
| origin/main         | `2fb0d0f`          | not yet pushed            |
| Divergence          | 0 behind · 42 ahead |                           |

### Ahead commits (fork → upstream, newest first)

```text
cce9a92 feat: merge upstream/main (v0.2.4) - sync fork with OpenClaw architecture updates
2fb0d0f [Feat] Add APP_CONFIG_PATH constant and update user data path logic to use it
89a881b [Feat] 1. Notify platform add QZhuli 2. scheduled task using QZhuli channel.
cb55d0a [Fix] supports user|assistant role for pushingmessage.
0a627b4 [Feat] Add sync-fork git repo SKILL. II
e7ce65c [Feat] Add sync-fork git repo SKILL.
180b8b3 Chore.update to 1.1.1 on upstream tag 0.2.3
b2805ed fix: resolve post-merge code artifacts in Settings.tsx, imGatewayManager.ts, types.ts
a39edf2 chore: replace youdao update endpoints with qzhuli urls
d76b64d feat: merge upstream/main (v0.2.3) into fork - integrate QQ/WeCom/Xiaomifeng IM channels, MCP support, Skill Store, sandbox fixes, and UI improvements while preserving Qzhuli/Q助理 integration
cac189d Chore. add build markdown
1ef34d7 [Fix] update version.
baf89ed [Fix] fix  title platformlabel
b39b791 [Fix] push whole message to qzhuli.
b65d0a9 chore. add trust files
843371e [Fix] notarize issue.
6dc04e7 [Fix] rename channel name from `imnut` to `qzhuli`.
734c7b3 [Fix] force env to release
d0cef05 [Fix] auto close after scan qrcode
579591c 移除版权信息
b0d9661 [Fix] fix default env to release
0687e0c [Fix] add icons II
bdf32f0 [Fix] add icons
661bbcf [Fix] update notice handling in CoworkView and correct update check URL order
e7e533a [Fix] rename app to `Q助理电脑机器人`
79303b7 [Fix] update logo
f9a9045 feat: refresh application logo and AI robot images.
71dd44b feat: Redesign QZhuli binding modal UI with new assets and update Electron start command.
64f65e6 Chore. fix Qzhuli to `Q助理`
c519526 feat(settings): 开启其他模型则关闭自定义模型
de9e546 + 增加自动设置qwen key
641fee6 [Fix] QRCode scan.
32a3f70 [Fix] push message with msg_type=1
e0110ff Chore. polling 5seconds, close qr-code window
287dcb2 [Feat] add qr-code
63479f1 [Feat] auto jump to qr-code for scanning qzhuli
23e736a Chore. rename imnut to qzhuli
f2710ec [Feat] fix qzhuli binding
4ac1b3a [Feat] add url-query for wss connection
a8c06f2 [Feat] sync task-window session chat through IM.
395070b [Feat] add imnut scan qrcode.
e5b79e6 [Feat] supports 3-party Qzhuli IM.
```

## Fork-specific features (always preserve)

- QZhuli channel integration and bridge behavior.
  Files: `src/main/im/qzhuliGateway.ts`, `src/main/appConstants.ts`, `src/main/im/index.ts`, `src/main/im/types.ts`.
  Do not overwrite: QZhuli config/status/message role contracts and APP_CONFIG_PATH usage.
- Q助理 branding and product identity.
  Files: app name/logo assets, update copy, settings labels, onboarding flows.
  Do not overwrite: product naming (`Q助理电脑机器人`) and branding assets/text.
- Custom update endpoint routing to qzhuli domains.
  Files: `src/renderer/services/endpoints.ts` and related update-check callsites.
  Do not overwrite: qzhuli update URL substitutions.

## Known conflict-prone files

| File | Why it conflicts | Resolution rule |
| ---- | ---------------- | --------------- |
| `package.json` | version/scripts/deps move quickly upstream and in fork | take upstream dependency graph; re-apply fork-specific metadata only if required |
| `electron-builder.json` | packaging pipeline changed heavily upstream | prefer upstream packaging unless a fork release channel override is required |
| `src/main/main.ts` | central IPC and runtime orchestration diverges often | prefer upstream architecture; re-apply only fork-specific channels/features |
| `src/main/preload.ts` | IPC surface changes frequently | prefer upstream typings/bridge; add fork-only APIs explicitly |
| `src/main/im/imGatewayManager.ts` | IM platform orchestrator changed significantly | prefer upstream base and selectively re-add fork-specific adapters |
| `src/renderer/components/im/IMSettings.tsx` | large UI surface with frequent upstream churn | prefer upstream layout/logic, then re-apply fork platform cards/settings |
| `src/renderer/services/i18n.ts` | high-churn translation dictionaries | keep all keys; never drop fork locale keys |
| `src/renderer/types/electron.d.ts` | IPC contract drift | align to upstream contract, then add fork-only fields explicitly |

## Common post-merge build artifacts

- `TS2339/TS2305` for removed fork-only IM fields (e.g. `qzhuli`) after taking upstream types.
  Fix: either reintroduce full typed contract across renderer/main/preload OR remove stale usages from renderer slice/UI; do not leave partial type additions.
- Stale conflict markers in large files (`main.ts`, IM settings).
  Fix: run `rg -n '^(<<<<<<<|=======|>>>>>>>)'` before commit.

## Upstream release tags (for reference)

```text
v0.2.4
v0.2.3
v0.2.2
v0.2.1
v0.2.0
v0.1.24
v0.1.23
v0.1.22
v0.1.21
v0.1.20
```
