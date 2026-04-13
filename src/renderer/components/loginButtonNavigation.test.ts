import { expect, test } from 'vitest';

import {
  LoginButtonSettingsTarget,
  buildLoginSettingsOpenOptions,
} from './loginButtonNavigation';

test('buildLoginSettingsOpenOptions opens IM settings on the QZhuli platform', () => {
  expect(buildLoginSettingsOpenOptions()).toEqual({
    initialTab: LoginButtonSettingsTarget.Tab,
    initialImPlatform: LoginButtonSettingsTarget.Platform,
  });
});
