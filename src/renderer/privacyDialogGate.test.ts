import { expect, test } from 'vitest';

import { shouldShowPrivacyDialog } from './privacyDialogGate';

test('never shows the privacy dialog when startup privacy state is false', () => {
  expect(shouldShowPrivacyDialog(false)).toBe(false);
});

test('never shows the privacy dialog when startup privacy state is true', () => {
  expect(shouldShowPrivacyDialog(true)).toBe(false);
});

test('never shows the privacy dialog when startup privacy state is unknown', () => {
  expect(shouldShowPrivacyDialog(null)).toBe(false);
});
