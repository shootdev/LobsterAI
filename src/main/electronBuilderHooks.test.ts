import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, expect, test } from 'vitest';

const { __test__ } = require('../../scripts/electron-builder-hooks.cjs');

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

function createRuntimeRootWithExtensions(ids: string[]) {
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-root-'));
  tempDirs.push(runtimeRoot);
  const extensionsDir = path.join(runtimeRoot, 'extensions');
  fs.mkdirSync(extensionsDir, { recursive: true });
  for (const id of ids) {
    fs.mkdirSync(path.join(extensionsDir, id), { recursive: true });
  }
  return runtimeRoot;
}

test('classifyMissingPreinstalledPlugins ignores missing optional plugins', () => {
  const runtimeRoot = createRuntimeRootWithExtensions(['required-plugin']);
  const result = __test__.classifyMissingPreinstalledPlugins(runtimeRoot, [
    { id: 'required-plugin' },
    { id: 'optional-plugin', optional: true },
  ]);

  expect(result.missingRequired).toEqual([]);
  expect(result.missingOptional).toEqual(['optional-plugin']);
});

test('classifyMissingPreinstalledPlugins marks missing required plugins', () => {
  const runtimeRoot = createRuntimeRootWithExtensions([]);
  const result = __test__.classifyMissingPreinstalledPlugins(runtimeRoot, [
    { id: 'required-plugin' },
    { id: 'optional-plugin', optional: true },
  ]);

  expect(result.missingRequired).toEqual(['required-plugin']);
  expect(result.missingOptional).toEqual(['optional-plugin']);
});
