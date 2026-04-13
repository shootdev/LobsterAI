'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const { resolveRuntimeTargetId } = require('./openclaw-runtime-target.cjs');

const targetId = resolveRuntimeTargetId(process.platform, process.arch);
const rootDir = path.resolve(__dirname, '..');
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const result = spawnSync(npmBin, ['run', `openclaw:runtime:${targetId}`], {
  cwd: rootDir,
  env: process.env,
  stdio: 'inherit',
  shell: true,
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
