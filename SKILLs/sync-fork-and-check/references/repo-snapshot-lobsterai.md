# Repo Snapshot - shootdev/LobsterAI

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
| **Fork version** | 2026.5.12 |
| **Build command** | `npm run build` |
| **Node requirement** | `>=24 <25` |

---

## Current state (as of 2026-05-14)

| | Commit | Tag / Note |
|---|---|---|
| **Fork HEAD** | `74c9f296` | feat: merge upstream/main (2026.5.12) |
| **Last upstream merge** | `74c9f296` | merged upstream `2026.5.12` |
| **upstream/main HEAD** | `6ea82818` | tag `2026.5.12` |
| **origin/main** | `dcb0d1c2` | not yet pushed to remote |
| **Divergence** | 0 behind - 62 ahead | build passes after merge |

### Ahead commits (fork -> upstream, newest first)

```text
74c9f296 feat: merge upstream/main (2026.5.12)
dcb0d1c2 fix(renderer): disable privacy agreement popup
dee0a8b5 feat(im): autofill qzhuli qwen custom provider
d58f7763 feat(release): include git commit in publish notes
51226e5a feat(release): add mac build and publish script
a8cd59a fix(build): harden mac openclaw runtime packaging
58f476e feat(cron): implement buildManagedCronConfig function and update cron configuration
dfd890b fix(renderer): open qzhuli settings from login button
5a7f8ff fix: align post-merge types and refresh sync snapshot
ee29c54 feat: merge upstream/main (2026.4.8) and preserve qzhuli parity
b50cd69 fix(skills): resolve APP_CONFIG_PATH skill roots
0b97577 docs: create roadmap (4 phases)
0a962ac docs: define v1 requirements
112363a chore: add project config
1e762bf docs: initialize project
e96a23d Fix build error
46be4e2 feat(build): enhance cross-compilation support for macOS and verify native module architecture
aaec17f chore.ignore plugins not installed
4e84b1b fix(sync): restore full qzhuli parity after upstream rebase
d555522 chore: finalize upstream sync with build fixes and snapshot
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
64f65e6 Chore. fix QZhuli to `Q助理`
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

- **Gateway class**: `src/main/im/` - `QzhuliGateway`, `qzhuliGateway` field in `imGatewayManager.ts`
- **Binding flow**: QR code modal, auto-open on connect, `onQzhuliBindCompleted` / custom-provider sync path in `IMSettings.tsx`
- **Platform config key**: `qzhuli` in all platform maps/unions
- **i18n key**: `qzhuli: 'Q助理'` (zh) / `qzhuli: 'QZhuli'` (en)
- **Logo asset**: `qzhuli.png`

### Branding

- Product name: `Q助理电脑机器人` - appears in `Settings.tsx` About section, `electron-builder.json` app name, `extendInfo` strings, privacy/cowork copy
- Copyright: `© {year}` (replaced NetEase Youdao copyright)
- Update check URL: `https://client.qzhuli.com/sys/lobsterai_update_config` (test: `https://test.client.qzhuli.com/sys/lobsterai_update_config`)
- Fallback download URL: `''` (intentionally empty - fork has no download page)

### Dev tweaks (local, not committed as a rule)

- `start:electron` may include `--no-sandbox` in local development
- Local Linux packaging scripts may skip nonessential skills during ad hoc builds

---

## Known conflict-prone files

| File | Why it conflicts | Resolution rule |
|---|---|---|
| `src/main/im/types.ts` | Both sides add platform entries to the union type and `DEFAULT_IM_STATUS` | Keep `qzhuli` and upstream multi-instance `telegram`, `discord`, `nim`, `popo`, `email`; remove stale `xiaomifeng` keys |
| `src/renderer/types/im.ts` | Same - renderer-side platform types | Mirror main types exactly; `IMPlatform` should derive from `IMGatewayConfig` |
| `src/renderer/types/electron.d.ts` | IPC interface types extended by both sides | Mirror renderer IM/cowork types; preserve `qzhuli` IPC plus upstream embedding, Dreaming, app-update, and session-policy fields |
| `src/main/im/imGatewayManager.ts` | Both sides add direct gateway and OpenClaw channel branches | Keep direct `qzhuli` gateway branches and bind-status polling; keep upstream OpenClaw multi-instance branches; drop stale `xiaomifeng` direct gateway code |
| `src/main/im/imStore.ts` | Both sides add platform config fields and migrations | Keep `qzhuli` plus upstream multi-instance storage; preserve `xiaomifeng -> netease-bee` migration |
| `src/renderer/store/slices/imSlice.ts` | Both sides add reducers for new platforms | Keep all `set*Config` reducers and exports for `qzhuli`, `netease-bee`, and upstream multi-instance platforms |
| `src/renderer/components/im/IMSettings.tsx` | Both sides add platform UI entries | Keep QZhuli bind flow and provider auto-fill; keep upstream multi-instance settings/components; use shared `PlatformRegistry` |
| `src/renderer/App.tsx` | Upstream adds privacy/welcome/update state; fork adds QZhuli auto-open bind settings path | Keep upstream app-update runtime state and privacy/welcome UI; preserve `buildLoginSettingsOpenOptions()` QZhuli startup flow |
| `src/renderer/components/Settings.tsx` | Upstream adds About/model/memory sections; fork has custom branding and IM initial platform prop | Keep Q助理 brand name + upstream log-export, update-check, Dreaming/embedding, provider registry, and user-manual features |
| `src/renderer/components/Sidebar.tsx` | Login button layout changed upstream; fork passes `onShowLogin` navigation hook | Keep upstream compact layout and pass `onShowLogin` into `LoginButton` |
| `src/renderer/components/agent/AgentCreateModal.tsx` | Platform binding UI moved to shared registry | Use `PlatformRegistry` and `getVisibleIMPlatforms`; `qzhuli` must be in shared platform definitions |
| `src/renderer/services/i18n.ts` | Both sides add translation keys | Merge all keys; keep `qzhuli` key and Q助理 product-name copy |
| `src/renderer/services/endpoints.ts` | Upstream uses Youdao URLs; fork uses Qzhuli URLs | Always use Qzhuli URLs |
| `src/main/libs/openclawConfigSync.ts` | Upstream adds memory/bootstrap/extension diagnostics; fork adds skill-root and cron helpers | Keep upstream diagnostics and `findThirdPartyExtensionsDir`; keep `listExistingSkillsRoots`; ensure `buildManagedCronConfig()` includes `skipMissedJobs` |
| `src/main/libs/coworkUtil.ts` | Fork skill-root handling collides with upstream proxy/runtime imports | Keep `resolveSkillsRoot`, `appendPythonRuntimeToEnv`, and upstream proxy target helper imports |
| `src/main/skillManager.ts` | Skill root/security imports drift | Keep `resolveSkillsRoot`, `mergeReports`, and `scanMultipleSkillDirs`; remove unused scanner imports |
| `scripts/electron-builder-hooks.cjs` | Runtime packaging hooks changed upstream; fork adds native binding verification | Keep upstream `third-party-extensions` packaging and local extension restore; keep fork `verifyRequiredNativePackages()` |
| `package.json` | Script additions, version bumps, new deps | Keep upstream scripts/deps and version; preserve fork `description`/branding metadata |
| `electron-builder.json` | Upstream packaging resources and fork branding collide | Keep upstream packaging resources; preserve fork product/executable names and assets |
| `src/main/preload.ts` | Both sides expose new IPC methods | Merge all exposed methods and keep `Platform` type aligned with shared registry |
| `src/renderer/components/scheduledTasks/utils.ts` | Package import paths can drift | Prefer package root import when subpath typings break |

## Full platform union (current)

```typescript
'dingtalk' | 'discord' | 'email' | 'feishu' | 'netease-bee' | 'nim' | 'popo' | 'qq' | 'qzhuli' | 'telegram' | 'wecom' | 'weixin'
```

---

## Common post-merge build artifacts

These have appeared in previous syncs - check for them before declaring the build clean:

1. **Literal `\n` in .tsx** - a merge tool encoded newlines as `\n` inside a string. Manually expand it.
2. **Code block outside its method** - a closing `}` was duplicated, pushing a block outside the method scope. Check brace count around the affected method.
3. **Duplicate object key in `DEFAULT_IM_STATUS`** - a platform key appears twice. Delete the duplicate.
4. **Missing npm package** - upstream added a dep not yet installed locally. Run `npm install --force`.
5. **Shared type drift** - `src/renderer/types/electron.d.ts` can lag behind `src/renderer/types/im.ts` and `src/renderer/types/cowork.ts`.
6. **Stale platform key references** - legacy `xiaomifeng` references can survive after upstream renamed the platform to `netease-bee`.
7. **Malformed merge around `listExistingSkillsRoots`** - watch for an extra `});` in `src/main/libs/openclawConfigSync.ts`.
8. **Unused import after combining icon lists** - `Settings.tsx` can retain unused icons such as `Cog6ToothIcon`; TypeScript catches this.

---

## Upstream latest tags (for reference)

```text
2026.5.12
2026.5.9
2026.5.7
2026.4.29
2026.4.25
2026.4.24
2026.4.23
2026.4.21
2026.4.17
2026.4.13
```

---

*Update this file after each sync: set new upstream version, refresh ahead-commits list, add any new conflict patterns.*
