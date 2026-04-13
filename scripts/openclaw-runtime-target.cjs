'use strict';

function resolveRuntimeTargetId(platform, arch) {
  const platformMap = {
    darwin: 'mac',
    win32: 'win',
    linux: 'linux',
  };
  const archMap = {
    x64: 'x64',
    arm64: 'arm64',
    ia32: 'ia32',
  };

  const resolvedPlatform = platformMap[platform];
  const resolvedArch = archMap[arch];
  if (!resolvedPlatform || !resolvedArch) {
    throw new Error(`Unsupported host platform/arch: ${platform}/${arch}`);
  }

  return `${resolvedPlatform}-${resolvedArch}`;
}

module.exports = {
  resolveRuntimeTargetId,
};
