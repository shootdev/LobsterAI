/**
 * IM Slice
 * Redux slice for IM gateway state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  IMGatewayConfig,
  IMGatewayStatus,
  DingTalkOpenClawConfig,
  FeishuOpenClawConfig,
  TelegramOpenClawConfig,
  QQOpenClawConfig,
  DiscordOpenClawConfig,
  NimConfig,
  QzhuliConfig,
  XiaomifengConfig,
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
        settings: { ...DEFAULT_IM_CONFIG.settings, ...(config.settings || {}) },
      };
    },
    setDingTalkConfig: (state, action: PayloadAction<Partial<DingTalkOpenClawConfig>>) => {
      state.config.dingtalk = { ...state.config.dingtalk, ...action.payload };
    },
    setFeishuConfig: (state, action: PayloadAction<Partial<FeishuOpenClawConfig>>) => {
      state.config.feishu = { ...state.config.feishu, ...action.payload };
    },
    setTelegramOpenClawConfig: (state, action: PayloadAction<Partial<TelegramOpenClawConfig>>) => {
      state.config.telegram = {
        ...state.config.telegram,
        ...action.payload,
      };
    },
    setQQConfig: (state, action: PayloadAction<Partial<QQOpenClawConfig>>) => {
      state.config.qq = { ...state.config.qq, ...action.payload };
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
    setXiaomifengConfig: (state, action: PayloadAction<Partial<XiaomifengConfig>>) => {
      state.config.xiaomifeng = { ...state.config.xiaomifeng, ...action.payload };
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
  setFeishuConfig,
  setTelegramOpenClawConfig,
  setQQConfig,
  setDiscordConfig,
  setNimConfig,
  setQzhuliConfig,
  setXiaomifengConfig,
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
