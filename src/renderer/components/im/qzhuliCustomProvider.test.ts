import { describe, expect, test } from 'vitest';

import { type AppConfig,defaultConfig } from '../../config';
import {
  buildQzhuliQwenProviderSyncResult,
  QZHULI_QWEN_CUSTOM_PROVIDER_DISPLAY_NAME,
  QZHULI_QWEN_MODELS,
} from './qzhuliCustomProvider';

type ProvidersConfig = NonNullable<AppConfig['providers']>;

function cloneProviders(): ProvidersConfig {
  return structuredClone(defaultConfig.providers) as ProvidersConfig;
}

describe('buildQzhuliQwenProviderSyncResult', () => {
  test('creates the first available custom provider slot for qzhuli qwen', () => {
    const providers = cloneProviders();

    const result = buildQzhuliQwenProviderSyncResult(providers, {
      apiModelBaseUrl: 'https://oneapi.qzhuli.com/v1',
      apiModelKey: 'secret-key',
    });

    expect(result).not.toBeNull();
    expect(result!.providerKey).toBe('custom_0');
    expect(result!.provider.displayName).toBe(QZHULI_QWEN_CUSTOM_PROVIDER_DISPLAY_NAME);
    expect(result!.provider.enabled).toBe(true);
    expect(result!.provider.baseUrl).toBe('https://oneapi.qzhuli.com/v1');
    expect(result!.provider.apiKey).toBe('secret-key');
    expect(result!.provider.apiFormat).toBe('openai');
    expect(result!.provider.models).toEqual(QZHULI_QWEN_MODELS);
  });

  test('updates the existing qzhuli qwen custom provider in place', () => {
    const providers = cloneProviders();
    providers.custom_3 = {
      enabled: false,
      apiKey: 'old-key',
      baseUrl: 'https://old.example.com/v1',
      apiFormat: 'anthropic',
      displayName: QZHULI_QWEN_CUSTOM_PROVIDER_DISPLAY_NAME,
      models: [],
    };

    const result = buildQzhuliQwenProviderSyncResult(providers, {
      apiModelBaseUrl: 'https://oneapi.qzhuli.com/v1',
      apiModelKey: 'new-key',
    });

    expect(result).not.toBeNull();
    expect(result!.providerKey).toBe('custom_3');
    expect(result!.provider.enabled).toBe(true);
    expect(result!.provider.baseUrl).toBe('https://oneapi.qzhuli.com/v1');
    expect(result!.provider.apiKey).toBe('new-key');
    expect(result!.provider.apiFormat).toBe('openai');
    expect(result!.provider.models).toEqual(QZHULI_QWEN_MODELS);
  });

  test('returns null when both qzhuli api fields are missing', () => {
    const providers = cloneProviders();

    const result = buildQzhuliQwenProviderSyncResult(providers, {
      apiModelBaseUrl: '  ',
      apiModelKey: '',
    });

    expect(result).toBeNull();
  });

  test('throws when no custom provider slot is available', () => {
    const providers = cloneProviders();
    for (let i = 0; i < 10; i++) {
      providers[`custom_${i}`] = {
        enabled: true,
        apiKey: `key-${i}`,
        baseUrl: `https://example.com/${i}`,
        apiFormat: 'openai',
        displayName: `Custom ${i}`,
        models: [],
      };
    }

    expect(() => buildQzhuliQwenProviderSyncResult(providers, {
      apiModelBaseUrl: 'https://oneapi.qzhuli.com/v1',
      apiModelKey: 'secret-key',
    })).toThrow('No custom provider slot is available for QZhuli Qwen.');
  });
});
