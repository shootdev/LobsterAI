'use strict';

const { existsSync, readFileSync } = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RuntimeTargetId = Object.freeze({
  MacArm64: 'mac-arm64',
  MacX64: 'mac-x64',
  WinArm64: 'win-arm64',
  WinX64: 'win-x64',
  LinuxArm64: 'linux-arm64',
  LinuxX64: 'linux-x64',
});

const DAVEY_PACKAGE_NAME = '@snazzah/davey';

const NativeBindingRequirement = Object.freeze({
  [RuntimeTargetId.MacArm64]: {
    candidates: ['@snazzah/davey-darwin-universal', '@snazzah/davey-darwin-arm64'],
    installPackage: '@snazzah/davey-darwin-arm64',
  },
  [RuntimeTargetId.MacX64]: {
    candidates: ['@snazzah/davey-darwin-universal', '@snazzah/davey-darwin-x64'],
    installPackage: '@snazzah/davey-darwin-x64',
  },
  [RuntimeTargetId.WinArm64]: {
    candidates: ['@snazzah/davey-win32-arm64-msvc'],
    installPackage: '@snazzah/davey-win32-arm64-msvc',
  },
  [RuntimeTargetId.WinX64]: {
    candidates: ['@snazzah/davey-win32-x64-msvc'],
    installPackage: '@snazzah/davey-win32-x64-msvc',
  },
  [RuntimeTargetId.LinuxArm64]: {
    candidates: ['@snazzah/davey-linux-arm64-gnu', '@snazzah/davey-linux-arm64-musl'],
    installPackage: '@snazzah/davey-linux-arm64-gnu',
  },
  [RuntimeTargetId.LinuxX64]: {
    candidates: ['@snazzah/davey-linux-x64-gnu', '@snazzah/davey-linux-x64-musl'],
    installPackage: '@snazzah/davey-linux-x64-gnu',
  },
});

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function packageJsonPath(runtimeRoot, packageName) {
  return path.join(runtimeRoot, 'node_modules', ...packageName.split('/'), 'package.json');
}

function hasInstalledPackage(runtimeRoot, packageName) {
  return existsSync(packageJsonPath(runtimeRoot, packageName));
}

function resolveRequiredNativePackageSpecs(runtimeRoot, targetId) {
  const daveyPkg = readJson(packageJsonPath(runtimeRoot, DAVEY_PACKAGE_NAME));
  if (!daveyPkg) {
    return [];
  }

  const requirement = NativeBindingRequirement[targetId];
  if (!requirement) {
    return [];
  }

  const optionalDependencies = daveyPkg.optionalDependencies || {};
  const supportedCandidates = requirement.candidates.filter(
    (packageName) => optionalDependencies[packageName] || hasInstalledPackage(runtimeRoot, packageName),
  );

  if (supportedCandidates.length === 0) {
    return [];
  }

  return [
    {
      ownerPackage: DAVEY_PACKAGE_NAME,
      candidates: supportedCandidates,
      installPackage: requirement.installPackage,
      installVersion: optionalDependencies[requirement.installPackage] || daveyPkg.version || null,
    },
  ];
}

function classifyMissingRequiredNativePackages(runtimeRoot, targetId) {
  const missing = [];

  for (const spec of resolveRequiredNativePackageSpecs(runtimeRoot, targetId)) {
    const installed = spec.candidates.some((packageName) => hasInstalledPackage(runtimeRoot, packageName));
    if (!installed) {
      missing.push(spec.installPackage);
    }
  }

  return missing;
}

function installMissingRequiredNativePackages(runtimeRoot, targetId, options = {}) {
  const missingSpecs = resolveRequiredNativePackageSpecs(runtimeRoot, targetId).filter(
    (spec) => !spec.candidates.some((packageName) => hasInstalledPackage(runtimeRoot, packageName)),
  );

  if (missingSpecs.length === 0) {
    return [];
  }

  const packagesToInstall = missingSpecs.map((spec) =>
    spec.installVersion ? `${spec.installPackage}@${spec.installVersion}` : spec.installPackage,
  );
  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(
    npmBin,
    ['install', '--no-save', '--omit=dev', '--no-audit', '--no-fund', '--legacy-peer-deps', ...packagesToInstall],
    {
      cwd: runtimeRoot,
      encoding: 'utf8',
      stdio: options.stdio || 'pipe',
      env: options.env || process.env,
      shell: process.platform === 'win32',
      windowsVerbatimArguments: process.platform === 'win32',
    },
  );

  if (result.error) {
    throw new Error(`npm install failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    throw new Error(
      `npm install exited with code ${result.status}` + (stderr ? `\n${stderr}` : ''),
    );
  }

  const stillMissing = classifyMissingRequiredNativePackages(runtimeRoot, targetId);
  if (stillMissing.length > 0) {
    throw new Error(`required native packages are still missing after install: ${stillMissing.join(', ')}`);
  }

  return missingSpecs.map((spec) => spec.installPackage);
}

module.exports = {
  RuntimeTargetId,
  classifyMissingRequiredNativePackages,
  installMissingRequiredNativePackages,
  resolveRequiredNativePackageSpecs,
};
