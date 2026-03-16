# Repo Snapshot — shootdev/LobsterAI

> **Read this file before every sync.** It records the fork's custom divergence,
> conflict-prone files, and resolution rules. Update the "Current state" section
> after each successful upstream merge.

---

## Identity

| | Value |
|---|---|
| **Fork** | `git@github.com:shootdev/LobsterAI.git` |
| **Upstream** | `git@github.com:netease-youdao/LobsterAI.git` |
| **Fork product name** | Q助理电脑机器人 |
| **Fork version** | 1.1.0 |
| **Build command** | `npm run build` |
| **Node requirement** | `>=24 <25` (use `--engine-strict=false` if on v25) |

---

## Current state (as of 2026-03-12)

| | Commit | Tag / Note |
|---|---|---|
| **Fork HEAD** | `b2805ed` | fix: post-merge artifacts |
| **Last upstream merge** | `d76b64d` | merged upstream v0.2.3 |
| **upstream/main HEAD** | `feeb629` | tag `v0.2.3` |
| **origin/main** | `cac189d` | not yet pushed to remote |
| **Divergence** | 0 behind · 35 ahead | upstream has no new commits |

### Ahead commits (fork → upstream, newest first)

```
b2805ed fix: resolve post-merge code artifacts in Settings.tsx, imGatewayManager.ts, types.ts
a39edf2 chore: replace youdao update endpoints with qzhuli urls
d76b64d feat: merge upstream/main (v0.2.3) into fork - integrate QQ/WeCom/Xiaomifeng IM channels...
cac189d Chore. add build markdown
1ef34d7 [Fix] update version.
baf89ed [Fix] fix title platformlabel
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

---

## Fork-specific features (always preserve)

### Qzhuli IM gateway

The fork's primary proprietary addition. Every file it touches will conflict
with upstream IM changes.

- **Gateway class**: `src/main/im/` — `QzhuliGateway`, `qzhuliGateway` field in `imGatewayManager.ts`
- **Binding flow**: QR code modal, auto-open on connect, `onQzhuliBindCompleted` prop in `IMSettings.tsx`
- **Platform config key**: `qzhuli` in all platform maps/unions
- **i18n key**: `qzhuli: 'Q助理'` (zh) / `qzhuli: 'QZhuli'` (en)
- **Logo asset**: `qzhuli.png`

### Branding

- Product name: `Q助理电脑机器人` — appears in `Settings.tsx` About section, `electron-builder.json` app name, `extendInfo` strings
- Copyright: `© {year}` (replaced NetEase Youdao copyright)
- Update check URL: `https://client.qzhuli.com/sys/lobsterai_update_config` (test: `https://test.client.qzhuli.com/sys/lobsterai_update_config`)
- Fallback download URL: `''` (intentionally empty — fork has no download page)

### Dev tweaks (local, not committed as a rule)

- `start:electron` includes `--no-sandbox` (Linux dev environment)
- `dist:linux` uses `node scripts/prepare-dist-dir.js &&` prefix and only `build:skill:web-search` (skips tech-news/email skills)

---

## Known conflict-prone files

| File | Why it conflicts | Resolution rule |
|---|---|---|
| `src/main/im/types.ts` | Both sides add platform entries to the union type and `DEFAULT_IM_STATUS` | Keep all platforms from both sides; alphabetical order; no duplicate keys |
| `src/renderer/types/im.ts` | Same — renderer-side platform types | Same as above |
| `src/main/im/imGatewayManager.ts` | Both sides add `if (platform === 'X')` branches | Merge all branches; keep `qzhuli` branch inside `runAuthProbe()`; fix brace nesting carefully |
| `src/main/im/imStore.ts` | Both sides add platform config fields | Keep all fields |
| `src/renderer/components/im/IMSettings.tsx` | Both sides add platform UI entries | Keep `platformMeta.qzhuli`, QZhuli bind flow, `onQzhuliBindCompleted`; add upstream's new platform handlers; keep upstream's `errorMessageI18nMap` |
| `src/renderer/components/Settings.tsx` | Upstream adds About section features; fork has custom branding | Keep Q助理 brand name + upstream's log-export, update-check, test-mode-unlock, user-manual features; use `© {year}` copyright |
| `src/renderer/types/electron.d.ts` | IM interface types extended by both sides | Merge all interface fields and status types |
| `src/renderer/store/slices/imSlice.ts` | Both sides add reducers for new platforms | Keep all `set*Config` reducers and exports |
| `src/renderer/utils/regionFilter.ts` | Both sides add platforms to `CHINA_IM_PLATFORMS` | Keep all entries from both sides |
| `src/renderer/services/i18n.ts` | Both sides add translation keys | Merge all keys; keep `qzhuli` key |
| `src/renderer/services/endpoints.ts` | Upstream uses Youdao URLs; fork uses Qzhuli URLs | Always use Qzhuli URLs (see Branding section) |
| `src/renderer/services/appUpdate.ts` | Upstream restructures update logic | Use upstream's `endpoints.ts` import pattern; Qzhuli URLs are already in `endpoints.ts` |
| `package.json` | Script additions, version bumps, new deps | Keep upstream scripts + fork's `--no-sandbox` and `dist:linux` customisation |
| `electron-builder.json` | Upstream adds `extraResources`, fork reformats | Keep upstream's `win.extraResources` (mingit + python-win); keep `["AppImage","deb"]` for linux |
| `src/main/preload.ts` | Both sides expose new IPC methods | Merge all exposed methods |
| `src/main/scheduledTaskStore.ts` | `NotifyPlatform` union extended by both | Keep all platforms |
| `src/renderer/types/scheduledTask.ts` | Same | Keep all platforms |
| `src/renderer/components/scheduledTasks/TaskForm.tsx` | Platform selector options | Keep all options |

## Full platform union (current)

```typescript
'dingtalk' | 'discord' | 'feishu' | 'nim' | 'qq' | 'qzhuli' | 'telegram' | 'wecom' | 'xiaomifeng'
```

---

## Common post-merge build artifacts

These have appeared in previous syncs — check for them before declaring the build clean:

1. **Literal `\n` in .tsx** — a merge tool encoded newlines as `\n` inside a string. The symptom is a single very long line where a multi-statement block should be. Manually expand it.
2. **Code block outside its method** — a closing `}` was duplicated, pushing a block (e.g. the `qzhuli` branch of `runAuthProbe`) outside the method scope. Check brace count around the affected method.
3. **Duplicate object key in `DEFAULT_IM_STATUS`** — a platform key (e.g. `qq`) appears twice. Delete the duplicate.
4. **Missing npm package** — upstream added a dep (e.g. `yazl`) not yet installed locally. Run `npm install --force`.

---

## Upstream latest tags (for reference)

```
v0.2.3  (current merge base)
v0.2.2
v0.2.1
v0.2.0
v0.1.24
```

---

*Update this file after each sync: set new upstream version, refresh ahead-commits list, add any new conflict patterns.*
