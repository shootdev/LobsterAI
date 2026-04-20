import type { AppConfig } from '../../config';

const CUSTOM_PROVIDER_KEYS = [
  'custom_0', 'custom_1', 'custom_2', 'custom_3', 'custom_4',
  'custom_5', 'custom_6', 'custom_7', 'custom_8', 'custom_9',
] as const;

export const QZHULI_QWEN_CUSTOM_PROVIDER_DISPLAY_NAME = 'QZhuli Qwen';

export const QZHULI_QWEN_MODELS = [
  { id: 'qwen3.5-plus', name: 'Qwen3.5 Plus', supportsImage: true },
  { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus', supportsImage: false },
] as const;

type ProvidersConfig = NonNullable<AppConfig['providers']>;
type ProviderConfig = ProvidersConfig[string];
type CustomProviderKey = typeof CUSTOM_PROVIDER_KEYS[number];

type QzhuliModelConfigInput = {
  apiModelBaseUrl?: string;
  apiModelKey?: string;
};

export type QzhuliQwenProviderSyncResult = {
  providerKey: CustomProviderKey;
  provider: ProviderConfig;
};

export function buildQzhuliQwenProviderSyncResult(
  providers: ProvidersConfig,
  input: QzhuliModelConfigInput,
): QzhuliQwenProviderSyncResult | null {
  const nextBaseUrl = input.apiModelBaseUrl?.trim();
  const nextApiKey = input.apiModelKey?.trim();
  if (!nextBaseUrl && !nextApiKey) {
    return null;
  }

  const existingKey = CUSTOM_PROVIDER_KEYS.find((key) => {
    const displayName = providers[key]?.displayName;
    return typeof displayName === 'string' && displayName.trim() === QZHULI_QWEN_CUSTOM_PROVIDER_DISPLAY_NAME;
  });

  const availableKey = existingKey ?? CUSTOM_PROVIDER_KEYS.find((key) => !providers[key]);
  if (!availableKey) {
    throw new Error('No custom provider slot is available for QZhuli Qwen.');
  }

  const currentProvider = providers[availableKey];
  return {
    providerKey: availableKey,
    provider: {
      enabled: true,
      apiKey: nextApiKey || currentProvider?.apiKey || '',
      baseUrl: nextBaseUrl || currentProvider?.baseUrl || '',
      apiFormat: 'openai',
      displayName: QZHULI_QWEN_CUSTOM_PROVIDER_DISPLAY_NAME,
      models: QZHULI_QWEN_MODELS.map((model) => ({ ...model })),
    },
  };
}
