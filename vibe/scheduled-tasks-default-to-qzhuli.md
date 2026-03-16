# Generated: 2026-03-16

## Epic Plan

1. Trace how scheduled task completion messages are built and delivered.
2. Remove the gap that prevented QZhuli from receiving scheduled task notifications.
3. Make QZhuli the default IM return channel for scheduled tasks.
4. Ensure QZhuli notifications can be sent at any time through the configured conversation.
5. Validate the changed files and keep unrelated behavior intact.

## Codebase Changing

### 1. QZhuli notifications now use the configured channel deterministically

In `src/main/im/qzhuliGateway.ts`, `sendNotification` was adjusted to prefer the configured `convId` and `senderCid` before any last-seen inbound values.

In `src/main/im/imGatewayManager.ts`, QZhuli push sends are also no longer blocked on websocket connection state. The manager now checks whether QZhuli push is configured, because scheduled task delivery uses the HTTP push endpoint rather than an active websocket session.

Effect:

- scheduled tasks and other generic notifications no longer depend on prior inbound QZhuli activity
- scheduled task returns can be pushed through QZhuli even when no websocket conversation is currently active
- QZhuli can be used as a stable default return channel at any time

### 2. The media notification path now supports QZhuli

In `src/main/im/imGatewayManager.ts`, `sendNotificationWithMedia` previously had no `qzhuli` branch, so scheduler notifications routed through that method did not actually send to QZhuli.

It now falls back to:

```ts
await this.qzhuliGateway.sendNotification(text);
```

Effect:

- scheduled task result messages can now be delivered through QZhuli
- the scheduler can keep using the unified notification API even though QZhuli currently sends text only

### 2.1 QZhuli push timeout handling was relaxed for scheduled notifications

In `src/main/im/qzhuliGateway.ts`, the HTTP push timeout was increased from 10 seconds to 30 seconds and abort errors are now reported as a clear QZhuli push timeout instead of the generic `This operation was aborted` message.

Effect:

- slower QZhuli push responses no longer fail prematurely during scheduled task delivery
- timeout failures are easier to diagnose from logs

### 3. Scheduler notifications now default to QZhuli when no platform is configured

In `src/main/libs/scheduler.ts`, notification dispatch now resolves an effective platform list before sending.

If `task.notifyPlatforms` is empty and QZhuli is enabled in IM config, the scheduler uses `['qzhuli']`.

Effect:

- existing tasks without explicit notification platforms can still return their result through QZhuli
- scheduled tasks now return information by default instead of silently producing no IM output
- scheduler logs now distinguish between successful delivery and a false return from the IM manager

### 4. New scheduled tasks default to QZhuli at creation time

In `src/main/main.ts`, scheduled task create and update normalization now fills notification platforms with `['qzhuli']` when no platform list is provided and QZhuli is enabled.

Effect:

- backend-created tasks inherit the default consistently
- the default is enforced even outside the renderer form path

### 5. The scheduled task form preselects QZhuli for new tasks

In `src/renderer/components/scheduledTasks/TaskForm.tsx`, create mode now preselects QZhuli when it is enabled and visible.

Effect:

- the UI matches the backend default
- users can immediately see that scheduled task results will return through QZhuli by default

## Validation

Targeted diagnostics were checked for:

- `src/main/im/qzhuliGateway.ts`
- `src/main/im/imGatewayManager.ts`
- `src/main/libs/scheduler.ts`
- `src/main/main.ts`
- `src/renderer/components/scheduledTasks/TaskForm.tsx`

No new errors were reported in the edited files. The only diagnostics shown were pre-existing nullability warnings in unrelated parts of `src/main/main.ts`.
