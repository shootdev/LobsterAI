import { test, expect, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getAppPath: () => process.cwd(),
    getPath: () => process.cwd(),
  },
}));

import { buildManagedCronConfig } from './openclawConfigSync';

test('buildManagedCronConfig omits unsupported skipMissedJobs field', () => {
  expect(buildManagedCronConfig(true)).toEqual({
    enabled: true,
    maxConcurrentRuns: 3,
    sessionRetention: '7d',
  });
});
