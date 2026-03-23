# QZhuli Parity Pass (Newest -> Oldest)

Date: 2026-03-23
Scope: `upstream/main..HEAD` ahead commits, with strict parity check and explicit keep/apply/ignore decisions.
Rule: stale or risky behaviors are explicitly ignored.

| Commit | Decision | Notes |
|---|---|---|
| d555522 | keep | Sync bookkeeping commit; kept. |
| cce9a92 | keep | Upstream v0.2.4 merge baseline; kept. |
| 2fb0d0f | keep | `APP_CONFIG_PATH` behavior present and kept. |
| 89a881b | apply | QZhuli channel + scheduled task channel support restored in IM types/UI/store. |
| cb55d0a | keep | `user|assistant` push role behavior preserved in QZhuli gateway path. |
| 0a627b4 | ignore (stale) | Skill maintenance commit; not product behavior. |
| e7ce65c | ignore (stale) | Skill maintenance commit; not product behavior. |
| 180b8b3 | ignore (stale) | Historical version bump only. |
| b2805ed | keep | Post-merge artifact fixes are already represented in current code. |
| a39edf2 | keep | QZhuli update endpoints are active in renderer endpoints. |
| d76b64d | keep | Upstream v0.2.3 merge baseline; kept. |
| cac189d | ignore (stale) | Build markdown doc commit only. |
| 1ef34d7 | ignore (stale) | Historical version bump only. |
| baf89ed | keep | Platform label fix retained via current i18n/platform mappings. |
| b39b791 | keep | QZhuli push-message path retained. |
| b65d0a9 | ignore (stale) | Trust-files commit not needed for runtime parity. |
| 843371e | ignore (stale) | Notarize-only historical fix. |
| 6dc04e7 | keep | `imnut -> qzhuli` naming preserved across main/renderer types and UI. |
| 734c7b3 | apply | Release env normalization added on startup for QZhuli settings. |
| d0cef05 | ignore (buggy/risky) | Old behavior forced app quit when modal closed without bind; intentionally not restored. |
| 579591c | partial | Copyright removal handled in visible branding areas; no destructive rewrite of unrelated legal text. |
| b0d9661 | apply | Default env changed to `release` (main + renderer defaults). |
| 0687e0c | apply | Tray/icon assets restored from this commit lineage. |
| bdf32f0 | apply | App icon set restored (`build/icons/*`, tray assets). |
| 661bbcf | keep | Notice/update ordering remains in current branch history. |
| e7e533a | apply | App branding updated to Q助理电脑机器人 (packaging + visible UI labels). |
| 79303b7 | apply | Logo/robot asset updates restored. |
| f9a9045 | apply | Latest logo and ai-robot assets restored. |
| 71dd44b | apply | QZhuli bind modal style and startup bind flow restored. |
| 64f65e6 | apply | `QZhuli -> Q助理` naming restored in UI copy. |
| c519526 | keep | Existing settings behavior preserved (non-QR path). |
| de9e546 | apply | Re-applied bind-driven provider auto-fill/enable (`apiModelBaseUrl/apiModelKey` -> `providers.custom`). |
| 641fee6 | apply | Bind-status IPC path restored (`im:qzhuli:bindStatus`). |
| 32a3f70 | keep | `msg_type=1` push path preserved. |
| e0110ff | apply | Bind-status polling interval kept at 5s. |
| 287dcb2 | apply | QR bind flow present in IM settings. |
| 63479f1 | apply | Startup auto-jump to IM/QZhuli bind flow restored. |
| 23e736a | keep | naming transition retained (`qzhuli`). |
| f2710ec | keep | QZhuli bind robustness retained via latest bind poll + config persistence flow. |
| 4ac1b3a | keep | WSS URL query behavior preserved in gateway URL builder. |
| a8c06f2 | keep | IM sync behavior retained in manager/session mapping paths. |
| 395070b | keep | Initial QR scan feature superseded by later redesigned modal (kept via newer impl). |
| e5b79e6 | keep | Base QZhuli 3rd-party IM support retained. |

## QR UI parity notes

- Kept latest target style from `71dd44b` (center logo overlay, status ping, modal structure).
- Updated copy to match legacy phrasing (`登录Q助理电脑机器人`, `用Q助理扫一扫`, `已绑定成功 ✓`).
- Kept auto-open bind flow when QZhuli credentials are absent.
- Explicitly ignored forced-quit behavior from `d0cef05` as risky UX.

## Detailed verification for `keep` and `apply`

- `d555522` keep: commit exists in `upstream/main..HEAD`; no runtime regression introduced by this bookkeeping commit.
- `cce9a92` keep: merge commit exists and current branch builds (`npm run build`, `npm run compile:electron`).
- `2fb0d0f` keep: `APP_CONFIG_PATH` is active in [src/main/appConstants.ts](/home/yw07/zjz/LobsterAI/src/main/appConstants.ts).
- `89a881b` apply: QZhuli appears in IM types/store/UI and scheduled-task notify options (see [src/renderer/types/im.ts](/home/yw07/zjz/LobsterAI/src/renderer/types/im.ts), [src/renderer/store/slices/imSlice.ts](/home/yw07/zjz/LobsterAI/src/renderer/store/slices/imSlice.ts), [src/renderer/services/i18n.ts](/home/yw07/zjz/LobsterAI/src/renderer/services/i18n.ts)).
- `cb55d0a` keep: role-aware push path exists (`assistant`/`user`) in [src/main/im/qzhuliGateway.ts](/home/yw07/zjz/LobsterAI/src/main/im/qzhuliGateway.ts).
- `b2805ed` keep: post-merge artifacts are clean; project compiles successfully.
- `a39edf2` keep: QZhuli update endpoints are active in [src/renderer/services/endpoints.ts](/home/yw07/zjz/LobsterAI/src/renderer/services/endpoints.ts).
- `baf89ed` keep: platform label mapping is present and consistent via i18n + platform cards.
- `b39b791` keep: full-message push path remains in QZhuli gateway send APIs.
- `6dc04e7` keep: `imnut -> qzhuli` migration is retained across runtime/types/UI.
- `734c7b3` apply: startup release-env normalization exists in [src/renderer/components/im/IMSettings.tsx](/home/yw07/zjz/LobsterAI/src/renderer/components/im/IMSettings.tsx).
- `b0d9661` apply: default env is `release` in [src/main/im/types.ts](/home/yw07/zjz/LobsterAI/src/main/im/types.ts) and [src/renderer/types/im.ts](/home/yw07/zjz/LobsterAI/src/renderer/types/im.ts).
- `0687e0c` apply: tray/icon asset set restored (`resources/tray/tray-icon.png` etc.).
- `bdf32f0` apply: app icon set restored (`build/icons/mac`, `build/icons/win`, `build/icons/png`).
- `661bbcf` keep: notice/update flow remains aligned with current branch behavior.
- `e7e533a` apply: app branding changed to `Q助理电脑机器人` in packaging + settings/about + i18n.
- `79303b7` apply: logo update restored ([public/logo.png](/home/yw07/zjz/LobsterAI/public/logo.png)).
- `f9a9045` apply: ai-robot asset restored ([public/ai-robot.png](/home/yw07/zjz/LobsterAI/public/ai-robot.png)).
- `71dd44b` apply: redesigned QZhuli bind modal + startup bind flow restored in [src/renderer/components/im/IMSettings.tsx](/home/yw07/zjz/LobsterAI/src/renderer/components/im/IMSettings.tsx).
- `64f65e6` apply: naming uses `Q助理` in IM-facing copy.
- `c519526` keep: settings behavior retained; no regression detected in current settings pipeline.
- `de9e546` apply: bind status now auto-fills + enables custom provider (Qwen token/base URL path) via [src/renderer/components/im/IMSettings.tsx](/home/yw07/zjz/LobsterAI/src/renderer/components/im/IMSettings.tsx) and [src/renderer/components/Settings.tsx](/home/yw07/zjz/LobsterAI/src/renderer/components/Settings.tsx).
- `641fee6` apply: bind-status IPC restored (`im:qzhuli:bindStatus`) in main/preload/renderer types.
- `32a3f70` keep: QZhuli push `msg_type=1` retained in gateway constants.
- `e0110ff` apply: bind polling interval is 5s in current IM settings flow.
- `287dcb2` apply: QR bind flow exists and is reachable from QZhuli settings.
- `63479f1` apply: app startup auto-jumps to IM/QZhuli bind flow when credentials are missing.
- `23e736a` keep: final platform naming is `qzhuli`; only protocol payload keeps `imnut_bind` for backend compatibility.
- `f2710ec` keep: bind robustness path retained (`poll -> persist -> enable`).
- `4ac1b3a` keep: WSS query params (`cid/token/conv_id`) retained in URL builder.
- `a8c06f2` keep: IM-session synchronization path remains in manager/session mapping logic.
- `395070b` keep: initial QR feature retained via superseding redesigned modal.
- `e5b79e6` keep: base QZhuli third-party IM support retained end-to-end.
