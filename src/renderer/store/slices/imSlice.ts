/**
 * IM Slice
 * Redux slice for IM gateway state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  IMGatewayConfig,
  IMGatewayStatus,
  DingTalkOpenClawConfig,
  DingTalkInstanceConfig,
  DingTalkMultiInstanceConfig,
  FeishuOpenClawConfig,
  FeishuInstanceConfig,
  FeishuMultiInstanceConfig,
  TelegramOpenClawConfig,
  QQOpenClawConfig,
  QQInstanceConfig,
  QQMultiInstanceConfig,
  DiscordOpenClawConfig,
  NimConfig,
  QzhuliConfig,
  NeteaseBeeChanConfig,
  WecomOpenClawConfig,
  PopoOpenClawConfig,
  WeixinOpenClawConfig,
  IMSettings,
} from '../../types/im';
import {
  DEFAULT_IM_CONFIG,
  DEFAULT_IM_STATUS,
} from '../../types/im';

export interface IMState {
  config: IMGatewayConfig;
  status: IMGatewayStatus;
  isLoading: boolean;
  error: string | null;
}

const initialState: IMState = {
  config: DEFAULT_IM_CONFIG,
  status: DEFAULT_IM_STATUS,
  isLoading: false,
  error: null,
};

const imSlice = createSlice({
  name: 'im',
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<IMGatewayConfig>) => {
      const config = action.payload as Partial<IMGatewayConfig>;
      state.config = {
        ...DEFAULT_IM_CONFIG,
        ...config,
        dingtalk: { ...DEFAULT_IM_CONFIG.dingtalk, ...(config.dingtalk || {}) },
        feishu: { ...DEFAULT_IM_CONFIG.feishu, ...(config.feishu || {}) },
        telegram: { ...DEFAULT_IM_CONFIG.telegram, ...(config.telegram || {}) },
        discord: { ...DEFAULT_IM_CONFIG.discord, ...(config.discord || {}) },
        nim: { ...DEFAULT_IM_CONFIG.nim, ...(config.nim || {}) },
        qzhuli: { ...DEFAULT_IM_CONFIG.qzhuli, ...(config.qzhuli || {}) },
        'netease-bee': { ...DEFAULT_IM_CONFIG['netease-bee'], ...(config['netease-bee'] || {}) },
        settings: { ...DEFAULT_IM_CONFIG.settings, ...(config.settings || {}) },
      };
    },
    /** @deprecated Use setDingTalkInstanceConfig instead */
    setDingTalkConfig: (state, action: PayloadAction<Partial<DingTalkOpenClawConfig>>) => {
      // Backward compat: update first instance if exists
      const first = state.config.dingtalk.instances[0];
      if (first) {
        Object.assign(first, action.payload);
      }
    },
    setDingTalkInstances: (state, action: PayloadAction<DingTalkInstanceConfig[]>) => {
      state.config.dingtalk = { instances: action.payload };
    },
    setDingTalkMultiInstanceConfig: (state, action: PayloadAction<DingTalkMultiInstanceConfig>) => {
      state.config.dingtalk = action.payload;
    },
    setDingTalkInstanceConfig: (state, action: PayloadAction<{ instanceId: string; config: Partial<DingTalkOpenClawConfig> }>) => {
      const inst = state.config.dingtalk.instances.find(i => i.instanceId === action.payload.instanceId);
      if (inst) Object.assign(inst, action.payload.config);
    },
    addDingTalkInstance: (state, action: PayloadAction<DingTalkInstanceConfig>) => {
      state.config.dingtalk.instances.push(action.payload);
    },
    removeDingTalkInstance: (state, action: PayloadAction<string>) => {
      state.config.dingtalk.instances = state.config.dingtalk.instances.filter(
        i => i.instanceId !== action.payload
      );
    },
    /** @deprecated Use setFeishuInstanceConfig instead */
    setFeishuConfig: (state, action: PayloadAction<Partial<FeishuOpenClawConfig>>) => {
      // Backward compat: update first instance if exists
      const first = state.config.feishu.instances[0];
      if (first) {
        Object.assign(first, action.payload);
      }
    },
    setFeishuInstances: (state, action: PayloadAction<FeishuInstanceConfig[]>) => {
      state.config.feishu = { instances: action.payload };
    },
    setFeishuMultiInstanceConfig: (state, action: PayloadAction<FeishuMultiInstanceConfig>) => {
      state.config.feishu = action.payload;
    },
    setFeishuInstanceConfig: (state, action: PayloadAction<{ instanceId: string; config: Partial<FeishuOpenClawConfig> }>) => {
      const inst = state.config.feishu.instances.find(i => i.instanceId === action.payload.instanceId);
      if (inst) Object.assign(inst, action.payload.config);
    },
    addFeishuInstance: (state, action: PayloadAction<FeishuInstanceConfig>) => {
      state.config.feishu.instances.push(action.payload);
    },
    removeFeishuInstance: (state, action: PayloadAction<string>) => {
      state.config.feishu.instances = state.config.feishu.instances.filter(
        i => i.instanceId !== action.payload
      );
    },
    setTelegramOpenClawConfig: (state, action: PayloadAction<Partial<TelegramOpenClawConfig>>) => {
      state.config.telegram = {
        ...state.config.telegram,
        ...action.payload,
      };
    },
    /** @deprecated Use setQQInstanceConfig instead */
    setQQConfig: (state, action: PayloadAction<Partial<QQOpenClawConfig>>) => {
      // Backward compat: update first instance if exists
      const first = state.config.qq.instances[0];
      if (first) {
        Object.assign(first, action.payload);
      }
    },
    setQQInstances: (state, action: PayloadAction<QQInstanceConfig[]>) => {
      state.config.qq = { instances: action.payload };
    },
    setQQMultiInstanceConfig: (state, action: PayloadAction<QQMultiInstanceConfig>) => {
      state.config.qq = action.payload;
    },
    setQQInstanceConfig: (state, action: PayloadAction<{ instanceId: string; config: Partial<QQOpenClawConfig> }>) => {
      const inst = state.config.qq.instances.find(i => i.instanceId === action.payload.instanceId);
      if (inst) Object.assign(inst, action.payload.config);
    },
    addQQInstance: (state, action: PayloadAction<QQInstanceConfig>) => {
      state.config.qq.instances.push(action.payload);
    },
    removeQQInstance: (state, action: PayloadAction<string>) => {
      state.config.qq.instances = state.config.qq.instances.filter(
        i => i.instanceId !== action.payload
      );
    },
    setDiscordConfig: (state, action: PayloadAction<Partial<DiscordOpenClawConfig>>) => {
      state.config.discord = { ...state.config.discord, ...action.payload };
    },
    setNimConfig: (state, action: PayloadAction<Partial<NimConfig>>) => {
      state.config.nim = { ...state.config.nim, ...action.payload };
    },
    setQzhuliConfig: (state, action: PayloadAction<Partial<QzhuliConfig>>) => {
      state.config.qzhuli = { ...state.config.qzhuli, ...action.payload };
    },
    setNeteaseBeeChanConfig: (state, action: PayloadAction<Partial<NeteaseBeeChanConfig>>) => {
      state.config['netease-bee'] = { ...state.config['netease-bee'], ...action.payload };
    },
    setWecomConfig: (state, action: PayloadAction<Partial<WecomOpenClawConfig>>) => {
      state.config.wecom = { ...state.config.wecom, ...action.payload };
    },
    setPopoConfig: (state, action: PayloadAction<Partial<PopoOpenClawConfig>>) => {
      state.config.popo = { ...state.config.popo, ...action.payload };
    },
    setWeixinConfig: (state, action: PayloadAction<Partial<WeixinOpenClawConfig>>) => {
      state.config.weixin = { ...state.config.weixin, ...action.payload };
    },
    setIMSettings: (state, action: PayloadAction<Partial<IMSettings>>) => {
      state.config.settings = { ...state.config.settings, ...action.payload };
    },
    setStatus: (state, action: PayloadAction<IMGatewayStatus>) => {
      const status = action.payload as Partial<IMGatewayStatus>;
      state.status = {
        ...DEFAULT_IM_STATUS,
        ...status,
        dingtalk: { ...DEFAULT_IM_STATUS.dingtalk, ...(status.dingtalk || {}) },
        feishu: { ...DEFAULT_IM_STATUS.feishu, ...(status.feishu || {}) },
        telegram: { ...DEFAULT_IM_STATUS.telegram, ...(status.telegram || {}) },
        discord: { ...DEFAULT_IM_STATUS.discord, ...(status.discord || {}) },
        nim: { ...DEFAULT_IM_STATUS.nim, ...(status.nim || {}) },
        qzhuli: { ...DEFAULT_IM_STATUS.qzhuli, ...(status.qzhuli || {}) },
        'netease-bee': { ...DEFAULT_IM_STATUS['netease-bee'], ...(status['netease-bee'] || {}) },
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setConfig,
  setDingTalkConfig,
  setDingTalkInstances,
  setDingTalkMultiInstanceConfig,
  setDingTalkInstanceConfig,
  addDingTalkInstance,
  removeDingTalkInstance,
  setFeishuConfig,
  setFeishuInstances,
  setFeishuMultiInstanceConfig,
  setFeishuInstanceConfig,
  addFeishuInstance,
  removeFeishuInstance,
  setTelegramOpenClawConfig,
  setQQConfig,
  setQQInstances,
  setQQMultiInstanceConfig,
  setQQInstanceConfig,
  addQQInstance,
  removeQQInstance,
  setDiscordConfig,
  setNimConfig,
  setQzhuliConfig,
  setNeteaseBeeChanConfig,
  setWecomConfig,
  setPopoConfig,
  setWeixinConfig,
  setIMSettings,
  setStatus,
  setLoading,
  setError,
  clearError,
} = imSlice.actions;

export default imSlice.reducer;
