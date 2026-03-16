# 2026-03-16 QZhuli user window sync role

## Summary

Window interactive messages that originate from the user were previously pushed to QZhuli through the same outbound API shape as assistant replies, so QZhuli treated them as assistant push messages. This change keeps the internal role handling explicit and sends QZhuli's numeric `role` field instead: `0` for assistant and `1` for user.

## Code Explanation

### 1. Added a typed QZhuli role

In `src/main/im/types.ts`, a new `QzhuliMessageRole` type was introduced:

```ts
export type QzhuliMessageRole = 'assistant' | 'user';
```

This keeps the role handling explicit at compile time instead of passing loosely typed strings through the IM bridge.

### 2. Made QZhuli outbound pushes role-aware

In `src/main/im/qzhuliGateway.ts`, the outbound methods still accept a readable internal role and convert it to QZhuli's numeric wire format at the HTTP boundary:

```ts
async sendToConversation(
  conversationId: string,
  text: string,
  roleType: QzhuliMessageRole = 'assistant'
): Promise<void>
```

and:

```ts
function getQzhuliRoleCode(roleType: QzhuliMessageRole): number {
  return roleType === 'user' ? 1 : 0;
}

const payload: Record<string, unknown> = {
  conv_id: convId,
  content: text,
  msg_type: DEFAULT_MSG_TYPE,
  role: getQzhuliRoleCode(roleType),
};
```

This preserves the previous assistant behavior as the default while matching the actual QZhuli API shape: `role` as an integer instead of `role_type` as a string.

### 3. Propagated the role through the IM manager

In `src/main/im/imGatewayManager.ts`, `sendQzhuliConversationMessage` still accepts the same semantic `roleType` parameter and passes it through to the gateway. The logging also includes the role so future debugging can confirm whether a sync was sent as `user` or `assistant` before it is encoded to `1` or `0`.

### 4. Marked window user syncs as user

In `src/main/main.ts`, the sync logic for cowork stream messages already distinguishes user messages from assistant completions.

The user-message sync path now does this:

```ts
await imManager.sendQzhuliConversationMessage(conversationId, content, 'user');
```

The assistant completion path now does this explicitly:

```ts
await imManager.sendQzhuliConversationMessage(conversationId, trimmedContent, 'assistant');
```

This means:

- Messages typed by the user in the window and synced to QZhuli are encoded as `role: 1`.
- Assistant completions synced back to QZhuli remain encoded as `role: 0`.
- Existing reply flows still default to assistant behavior unless a caller intentionally sets another role.

## Validation

Targeted diagnostics were checked for the changed files:

- `src/main/im/types.ts`
- `src/main/im/qzhuliGateway.ts`
- `src/main/im/imGatewayManager.ts`
- `src/main/main.ts`

No new errors were reported in the edited areas. The only diagnostics shown were pre-existing nullability warnings in unrelated parts of `src/main/main.ts`.
