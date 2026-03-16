/**
 * QZhuli Gateway
 * Bridges QZhuli websocket inbound messages and HTTP push outbound replies.
 */

import { EventEmitter } from 'events';
import {
  QzhuliConfig,
  QzhuliGatewayStatus,
  QzhuliMessageRole,
  IMMessage,
  DEFAULT_QZHULI_STATUS,
} from './types';

/** Header name expected by ServeWssOpenClaw when OpenClawWSToken is configured. */
const OPENCLAW_TOKEN_HEADER = 'X-OpenClaw-Token';

const DEFAULT_QZHULI_HOST_DEV = 'test.im.qzhuli.com';
const DEFAULT_QZHULI_HOST_RELEASE = 'im.qzhuli.com';
const DEFAULT_PUSH_PATH = '/api/v1/conversations/push_message';
const DEFAULT_WS_URL_PATH = '/wss_openclaw';
const DEFAULT_MSG_TYPE = 1;
const DEFAULT_RECONNECT_MS = 2_000;
const DEFAULT_MAX_RECONNECT_MS = 30_000;

function resolveQzhuliHost(config: QzhuliConfig): string {
  return config.environment === 'release' ? DEFAULT_QZHULI_HOST_RELEASE : DEFAULT_QZHULI_HOST_DEV;
}

function getQzhuliBaseUrl(config: QzhuliConfig): string {
  return `https://${resolveQzhuliHost(config)}`;
}

function getQzhuliRoleCode(roleType: QzhuliMessageRole): number {
  return roleType === 'user' ? 1 : 0;
}

/**
 * Builds the full WebSocket URL for the /wss_openclaw endpoint.
 *
 * ServeWssOpenClaw (server.go) requires all three query params:
 *   ?cid=<senderCid>&token=<wsToken>&conv_id=<convId>
 *
 * The server validates:
 *  1. cid + token are present (401 if missing)
 *  2. conv_id is present (400 if missing)
 *  3. token matches the stored DB token for cid (401 if mismatch)
 *  4. Optionally, X-OpenClaw-Token header matches OpenClawWSToken config
 */
function getQzhuliWsUrl(config: QzhuliConfig): string {
  const base = `wss://${resolveQzhuliHost(config)}${DEFAULT_WS_URL_PATH}`;
  const params = new URLSearchParams();
  params.set('cid', config.senderCid.trim());
  params.set('token', config.wsToken.trim());
  params.set('conv_id', config.convId.trim());
  return `${base}?${params.toString()}`;
}

export class QzhuliGateway extends EventEmitter {
  private ws: any = null;
  private config: QzhuliConfig | null = null;
  private status: QzhuliGatewayStatus = { ...DEFAULT_QZHULI_STATUS };
  private onMessageCallback?: (message: IMMessage, replyFn: (text: string) => Promise<void>) => Promise<void>;
  private lastConvId: string | null = null;
  private lastSenderCid: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastActivityAt = 0;
  private log: (...args: any[]) => void = () => {};

  getStatus(): QzhuliGatewayStatus {
    return { ...this.status };
  }

  isConnected(): boolean {
    return this.status.connected;
  }

  reconnectIfNeeded(): void {
    if (this.config && !this.status.connected && !this.ws) {
      this.scheduleReconnect(0);
    }
  }

  setMessageCallback(
    callback: (message: IMMessage, replyFn: (text: string) => Promise<void>) => Promise<void>
  ): void {
    this.onMessageCallback = callback;
  }

  async start(config: QzhuliConfig): Promise<void> {
    if (this.ws) {
      throw new Error('QZhuli gateway already running');
    }
    this.config = config;
    this.log = config.debug ? console.log.bind(console) : () => {};

    if (!config.enabled) {
      return;
    }
    if (!config.senderCid.trim()) {
      throw new Error('QZhuli senderCid is required');
    }
    if (!config.convId.trim()) {
      throw new Error('QZhuli convId is required');
    }
    if (!config.wsToken.trim()) {
      throw new Error('QZhuli wsToken is required');
    }

    const WSImpl = (globalThis as any).WebSocket;
    if (!WSImpl) {
      throw new Error('WebSocket is not available in current runtime');
    }

    const wsUrl = getQzhuliWsUrl(config);
    this.log('[QZhuli Gateway] Starting websocket bridge:', wsUrl);

    this.status = {
      ...this.status,
      connected: false,
      startedAt: Date.now(),
      lastError: null,
      lastWsUrl: wsUrl,
    };
    this.emit('status');

    await new Promise<void>((resolve, reject) => {
      // Pass X-OpenClaw-Token via the WebSocket subprotocol list when present.
      // Browser/Node WebSocket APIs do not allow arbitrary upgrade headers;
      // the server must accept this convention when openClawToken is set.
      const protocols: string[] = config.openClawToken
        ? [`${OPENCLAW_TOKEN_HEADER}.${config.openClawToken.trim()}`]
        : [];
      this.ws = protocols.length ? new WSImpl(wsUrl, protocols) : new WSImpl(wsUrl);
      let settled = false;

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.lastActivityAt = Date.now();
        this.status.connected = true;
        this.status.lastError = null;
        this.status.lastWsUrl = wsUrl;
        this.emit('connected');
        this.emit('status');
        this.startHeartbeat();
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      this.ws.onmessage = (event: any) => {
        void this.handleInboundFrame(event?.data);
      };

      this.ws.onerror = () => {
        // onclose carries reconnect and error details.
      };

      this.ws.onclose = (event: any) => {
        this.stopHeartbeat();
        this.ws = null;
        const error = event?.code ? `ws_closed:${event.code}:${event.reason || 'no_reason'}` : null;
        this.status.connected = false;
        if (error) {
          this.status.lastError = error;
        }
        this.emit('disconnected');
        this.emit('status');
        if (!settled) {
          settled = true;
          reject(new Error(this.status.lastError || 'QZhuli websocket disconnected'));
          return;
        }
        if (this.config?.enabled) {
          this.scheduleReconnect(this.config.reconnectMs || DEFAULT_RECONNECT_MS);
        }
      };
    });
  }

  async stop(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // noop
      }
      this.ws = null;
    }
    this.status = {
      ...this.status,
      connected: false,
      startedAt: null,
      lastError: null,
    };
    this.emit('disconnected');
    this.emit('status');
  }

  async sendNotification(text: string): Promise<void> {
    const convId = (this.lastConvId || this.config?.convId || '').trim();
    if (!convId) {
      throw new Error('No QZhuli conversation available yet');
    }
    await this.pushMessage(convId, text, this.lastSenderCid || this.config?.senderCid || undefined, 'assistant');
  }

  async sendToConversation(
    conversationId: string,
    text: string,
    roleType: QzhuliMessageRole = 'assistant'
  ): Promise<void> {
    const convId = (conversationId || '').trim();
    if (!convId) {
      throw new Error('QZhuli conversationId is required');
    }
    await this.pushMessage(convId, text, this.lastSenderCid || this.config?.senderCid || undefined, roleType);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    const heartbeatMs = this.config?.heartbeatMs ?? 0;
    if (!heartbeatMs || heartbeatMs <= 0) return;
    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== 1) return;
      if (Date.now() - this.lastActivityAt < heartbeatMs) return;
      try {
        this.ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
        this.lastActivityAt = Date.now();
      } catch {
        // noop
      }
    }, heartbeatMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(delayMs: number): void {
    if (!this.config || !this.config.enabled) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    const maxAttempts = this.config.maxReconnectAttempts;
    if (maxAttempts > 0 && this.reconnectAttempts >= maxAttempts) {
      this.status.lastError = `reconnect attempts exhausted (${maxAttempts})`;
      this.emit('status');
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts += 1;
      const cfg = this.config;
      if (!cfg) return;
      this.start(cfg).catch((error: any) => {
        this.status.lastError = error.message;
        this.emit('status');
        const nextDelay = Math.min(
          Math.max(delayMs || cfg.reconnectMs, DEFAULT_RECONNECT_MS) * 2,
          cfg.maxReconnectMs || DEFAULT_MAX_RECONNECT_MS
        );
        this.scheduleReconnect(nextDelay);
      });
    }, delayMs);
  }

  private async handleInboundFrame(rawData: any): Promise<void> {
    this.lastActivityAt = Date.now();
    let text = '';
    if (typeof rawData === 'string') {
      text = rawData;
    } else if (rawData && typeof rawData.toString === 'function') {
      text = rawData.toString();
    }
    if (!text) return;

    let frame: any = null;
    try {
      frame = JSON.parse(text);
    } catch {
      frame = text;
    }

    if (typeof frame === 'string' && frame.trim().toLowerCase() === 'ping') {
      this.ws?.send('pong');
      return;
    }

    const frameType = String(frame?.type || '').toLowerCase();
    if (frameType === 'ping' || frameType === 'heartbeat') {
      this.ws?.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      return;
    }
    if (frameType !== 'inbound_message') return;

    const payload = frame?.payload || {};
    const convId = String(payload.conv_id || '').trim();
    const content = String(payload.content || '').trim();
    const senderCid = String(payload.sender_cid || '').trim();
    const messageId = payload.msg_id != null ? String(payload.msg_id) : `${Date.now()}`;
    if (!convId || !content) return;

    this.lastConvId = convId;
    this.lastSenderCid = senderCid || null;
    this.status.lastInboundAt = Date.now();
    this.emit('status');

    const message: IMMessage = {
      platform: 'qzhuli',
      messageId,
      conversationId: convId,
      senderId: senderCid || `qzhuli:conv:${convId}`,
      senderName: senderCid || undefined,
      content,
      chatType: 'direct',
      timestamp: Number(payload.ts) || Date.now(),
    };

    if (this.onMessageCallback) {
      await this.onMessageCallback(message, async (replyText: string) => {
        await this.pushMessage(convId, replyText, senderCid || undefined, 'assistant');
      });
    }
    this.emit('message', message);
  }

  private async pushMessage(
    convId: string,
    text: string,
    senderCid?: string,
    roleType: QzhuliMessageRole = 'assistant'
  ): Promise<void> {
    if (!this.config) {
      throw new Error('QZhuli config missing');
    }
    const endpoint = `${getQzhuliBaseUrl(this.config)}${DEFAULT_PUSH_PATH}`;
    const payload: Record<string, unknown> = {
      conv_id: convId,
      content: text,
      msg_type: DEFAULT_MSG_TYPE,
      role: getQzhuliRoleCode(roleType),
    };
    if (senderCid || this.config.senderCid) {
      payload.sender_cid = senderCid || this.config.senderCid;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      let body: any = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(body)}`);
      }
      if (body && typeof body.code === 'number' && body.code !== 200) {
        throw new Error(`QZhuli API error: ${body.msg || 'unknown error'}`);
      }
      this.lastConvId = convId;
      this.status.lastOutboundAt = Date.now();
      this.status.lastError = null;
      this.emit('status');
    } catch (error: any) {
      this.status.lastError = error.message;
      this.emit('status');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
