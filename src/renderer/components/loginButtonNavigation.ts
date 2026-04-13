export const LoginButtonSettingsTarget = {
  Tab: 'im',
  Platform: 'qzhuli',
} as const;

export const buildLoginSettingsOpenOptions = () => ({
  initialTab: LoginButtonSettingsTarget.Tab,
  initialImPlatform: LoginButtonSettingsTarget.Platform,
});
