import { expect, test } from 'vitest';

const { resolveRuntimeTargetId } = require('../../scripts/openclaw-runtime-target.cjs');

test('resolveRuntimeTargetId maps Apple Silicon mac hosts to mac-arm64', () => {
  expect(resolveRuntimeTargetId('darwin', 'arm64')).toBe('mac-arm64');
});

test('resolveRuntimeTargetId maps Intel mac hosts to mac-x64', () => {
  expect(resolveRuntimeTargetId('darwin', 'x64')).toBe('mac-x64');
});

test('resolveRuntimeTargetId maps Windows ARM hosts to win-arm64', () => {
  expect(resolveRuntimeTargetId('win32', 'arm64')).toBe('win-arm64');
});

test('resolveRuntimeTargetId rejects unsupported platform and arch pairs', () => {
  expect(() => resolveRuntimeTargetId('sunos', 'x64')).toThrow('Unsupported host platform/arch');
  expect(() => resolveRuntimeTargetId('darwin', 'ppc')).toThrow('Unsupported host platform/arch');
});
