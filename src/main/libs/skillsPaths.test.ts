import path from 'path';
import { expect, test } from 'vitest';
import { APP_CONFIG_PATH } from '../appConstants';
import { listExistingSkillsRoots, listSkillsRootCandidates, resolveSkillsRoot } from './skillsPaths';

test('resolveSkillsRoot prefers existing current userData SKILLs directory', () => {
  const resolved = resolveSkillsRoot({
    isPackaged: true,
    userDataPath: '/Users/test/Library/Application Support/current-app',
    appDataPath: '/Users/test/Library/Application Support',
    appPath: '/Applications/LobsterAI.app/Contents/Resources/app.asar',
    cwd: '/tmp/app',
    moduleDir: '/tmp/app/dist-electron/libs',
  }, (candidate) => candidate.endsWith('/current-app/SKILLs'));

  expect(resolved).toBe('/Users/test/Library/Application Support/current-app/SKILLs');
});

test('resolveSkillsRoot falls back to APP_CONFIG_PATH skills directory when present', () => {
  const resolved = resolveSkillsRoot({
    isPackaged: true,
    userDataPath: '/Users/test/Library/Application Support/current-app',
    appDataPath: '/Users/test/Library/Application Support',
    appPath: '/Applications/LobsterAI.app/Contents/Resources/app.asar',
    cwd: '/tmp/app',
    moduleDir: '/tmp/app/dist-electron/libs',
  }, (candidate) => candidate === `/Users/test/Library/Application Support/${APP_CONFIG_PATH}/skills`);

  expect(resolved).toBe(`/Users/test/Library/Application Support/${APP_CONFIG_PATH}/skills`);
});

test('listExistingSkillsRoots includes APP_CONFIG_PATH skills directory without duplicates', () => {
  const existing = new Set([
    '/Users/test/Library/Application Support/current-app/SKILLs',
    `/Users/test/Library/Application Support/${APP_CONFIG_PATH}/skills`,
  ]);

  const roots = listExistingSkillsRoots({
    isPackaged: true,
    userDataPath: '/Users/test/Library/Application Support/current-app',
    appDataPath: '/Users/test/Library/Application Support',
    appPath: '/Applications/LobsterAI.app/Contents/Resources/app.asar',
    cwd: '/tmp/app',
    moduleDir: '/tmp/app/dist-electron/libs',
  }, (candidate) => existing.has(candidate));

  expect(roots).toEqual([
    '/Users/test/Library/Application Support/current-app/SKILLs',
    `/Users/test/Library/Application Support/${APP_CONFIG_PATH}/skills`,
  ]);
});

test('development candidates include repo-local SKILLs directories', () => {
  const roots = listSkillsRootCandidates({
    isPackaged: false,
    userDataPath: '/Users/test/Library/Application Support/current-app',
    appDataPath: '/Users/test/Library/Application Support',
    appPath: '/repo',
    cwd: '/repo',
    moduleDir: path.join('/repo', 'dist-electron', 'libs'),
    envRoots: ['/custom/skills'],
  });

  expect(roots).toContain('/custom/skills');
  expect(roots).toContain('/repo/SKILLs');
});
