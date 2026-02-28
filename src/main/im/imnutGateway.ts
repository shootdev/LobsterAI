/**
 * IMNut Gateway
 * Bridges IMNut websocket inbound messages and HTTP push outbound replies.
 */

import { EventEmitter } from 'events';
import {
  ImnutConfig,
  ImnutGatewayStatus,
  IMMessage,
  DEFAULT_IMNUT_STATUS,
} from './types';

const DEFAULT_IMNUT_HOST_DEV = 'test.im.qzhuli.com';
const DEFAULT_IMNUT_HOST_RELEASE = 'im.qzhuli.com';
const DEFAULT_PUSH_PATH = '/api/v1/conversations/push_message';
const DEFAULT_WS_URL_PATH = '/wss_openclaw';
const DEFAULT_MSG_TYPE = 11;
const DEFAULT_RECONNECT_MS = 2_000;
const DEFAULT_MAX_RECONNECT_MS = 30_000;

function resolveImnutHost(config: ImnutConfig): string {
  return config.environment === 'release' ? DEFAULT_IMNUT_HOST_RELEASE : DEFAULT_IMNUT_HOST_DEV;
}

function getImnutBaseUrl(config: ImnutConfig): string {
  return `https://${resolveImnutHost(config)}`;
}

function getImnutWsUrl(config: ImnutConfig): string {
  return `wss://${resolveImnutHost(config)}${DEFAULT_WS_URL_PATH}`;
}

function addTokenQuery(url: string, token?: string): string {
  const value = (token || '').trim();
  if (!value) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}token=${encodeURIComponent(value)}`;
}

export class ImnutGateway extends EventEmitter {
  private ws: any = null;
  private config: ImnutConfig | null = null;
  private status: ImnutGatewayStatus = { ...DEFAULT_IMNUT_STATUS };
  private onMessageCallback?: (message: IMMessage, replyFn: (text: string) => Promise<void>) => Promise<void>;
  private lastConvId: string | null = null;
  private lastSenderCid: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastActivityAt = 0;
  private log: (...args: any[]) => void = () => {};

  getStatus(): ImnutGatewayStatus {
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

  async start(config: ImnutConfig): Promise<void> {
    if (this.ws) {
      throw new Error('IMNut gateway already running');
    }
    this.config = config;
    this.log = config.debug ? console.log.bind(console) : () => {};

    if (!config.enabled) {
      return;
    }
    if (!config.senderCid.trim()) {
      throw new Error('IMNut senderCid is required');
    }
    if (!config.convId.trim()) {
      throw new Error('IMNut convId is required');
    }
    if (!config.wsToken.trim()) {
      throw new Error('IMNut wsToken is required');
    }

    const WSImpl = (globalThis as any).WebSocket;
    if (!WSImpl) {
      throw new Error('WebSocket is not available in current runtime');
    }

    const wsUrl = addTokenQuery(getImnutWsUrl(config), config.wsToken);
    this.log('[IMNut Gateway] Starting websocket bridge:', wsUrl);

    this.status = {
      ...this.status,
      connected: false,
      startedAt: Date.now(),
      lastError: null,
      lastWsUrl: wsUrl,
    };
    this.emit('status');

    await new Promise<void>((resolve, reject) => {
      this.ws = new WSImpl(wsUrl);
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
          reject(new Error(this.status.lastError || 'IMNut websocket disconnected'));
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
      throw new Error('No IMNut conversation available yet');
    }
    await this.pushMessage(convId, text, this.lastSenderCid || this.config?.senderCid || undefined);
  }

  async sendToConversation(conversationId: string, text: string): Promise<void> {
    const convId = (conversationId || '').trim();
    if (!convId) {
      throw new Error('IMNut conversationId is required');
    }
    await this.pushMessage(convId, text, this.lastSenderCid || this.config?.senderCid || undefined);
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
      platform: 'imnut',
      messageId,
      conversationId: convId,
      senderId: senderCid || `imnut:conv:${convId}`,
      senderName: senderCid || undefined,
      content,
      chatType: 'direct',
      timestamp: Number(payload.ts) || Date.now(),
    };

    if (this.onMessageCallback) {
      await this.onMessageCallback(message, async (replyText: string) => {
        await this.pushMessage(convId, replyText, senderCid || undefined);
      });
    }
    this.emit('message', message);
  }

  private async pushMessage(convId: string, text: string, senderCid?: string): Promise<void> {
    if (!this.config) {
      throw new Error('IMNut config missing');
    }
    const endpoint = `${getImnutBaseUrl(this.config)}${DEFAULT_PUSH_PATH}`;
    const payload: Record<string, unknown> = {
      conv_id: convId,
      content: text,
      msg_type: DEFAULT_MSG_TYPE,
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
        throw new Error(`IMNut API error: ${body.msg || 'unknown error'}`);
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
