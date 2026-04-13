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

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function createRuntimeRootWithNativePackages(packages: Record<string, unknown>) {
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-native-root-'));
  tempDirs.push(runtimeRoot);

  for (const [pkgName, pkgJson] of Object.entries(packages)) {
    writeJson(path.join(runtimeRoot, 'node_modules', pkgName, 'package.json'), pkgJson);
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

test('classifyMissingRequiredNativePackages reports missing davey arm64 binding on macOS', () => {
  const runtimeRoot = createRuntimeRootWithNativePackages({
    '@snazzah/davey': {
      name: '@snazzah/davey',
      version: '0.1.10',
      optionalDependencies: {
        '@snazzah/davey-darwin-arm64': '0.1.10',
        '@snazzah/davey-darwin-x64': '0.1.10',
      },
    },
  });

  const missing = __test__.classifyMissingRequiredNativePackages(runtimeRoot, 'mac-arm64');

  expect(missing).toEqual(['@snazzah/davey-darwin-arm64']);
});

test('classifyMissingRequiredNativePackages accepts installed davey arm64 binding on macOS', () => {
  const runtimeRoot = createRuntimeRootWithNativePackages({
    '@snazzah/davey': {
      name: '@snazzah/davey',
      version: '0.1.10',
      optionalDependencies: {
        '@snazzah/davey-darwin-arm64': '0.1.10',
        '@snazzah/davey-darwin-x64': '0.1.10',
      },
    },
    '@snazzah/davey-darwin-arm64': {
      name: '@snazzah/davey-darwin-arm64',
      version: '0.1.10',
    },
  });

  const missing = __test__.classifyMissingRequiredNativePackages(runtimeRoot, 'mac-arm64');

  expect(missing).toEqual([]);
});
