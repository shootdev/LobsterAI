'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function commandExists(command) {
  const checker = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(checker, [command], { stdio: 'ignore' });
  return result.status === 0;
}

function resolveBashExecutable(rootDir) {
  if (process.platform !== 'win32') {
    return commandExists('bash') ? 'bash' : null;
  }

  // On Windows, we must use Git Bash (MSYS2), NOT WSL's bash.
  // WSL bash (WindowsApps\bash.exe) runs in a separate Linux environment and
  // cannot access Windows-installed node, npm, pnpm, etc.

  // 1. Check all bash locations, prefer Git Bash over WSL bash.
  try {
    const result = spawnSync('where', ['bash'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    if (result.status === 0 && result.stdout) {
      const paths = result.stdout.trim().split(/\r?\n/).map(p => p.trim()).filter(Boolean);
      const gitBash = paths.find(p => !p.toLowerCase().includes('windowsapps'));
      if (gitBash) return gitBash;
    }
  } catch {}

  // 2. Derive bash path from git installation.
  try {
    const gitResult = spawnSync('where', ['git'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    if (gitResult.status === 0 && gitResult.stdout) {
      const gitPath = gitResult.stdout.trim().split(/\r?\n/)[0].trim();
      const gitRoot = path.resolve(path.dirname(gitPath), '..');
      const gitBashCandidates = [
        path.join(gitRoot, 'bin', 'bash.exe'),
        path.join(gitRoot, 'usr', 'bin', 'bash.exe'),
      ];
      for (const candidate of gitBashCandidates) {
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  } catch {}

  // 3. Bundled mingit bash.
  const candidates = [
    path.join(rootDir, 'resources', 'mingit', 'bin', 'bash.exe'),
    path.join(rootDir, 'resources', 'mingit', 'usr', 'bin', 'bash.exe'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

const targetId = (process.argv[2] || '').trim();
if (!targetId) {
  console.error('[run-build-openclaw-runtime] Missing target id (example: mac-arm64, win-x64, linux-x64).');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const bashExecutable = resolveBashExecutable(rootDir);
if (!bashExecutable) {
  console.error('[run-build-openclaw-runtime] bash is required but not found.');
  if (process.platform === 'win32') {
    console.error('[run-build-openclaw-runtime] Install Git Bash or run `npm run setup:mingit` first.');
  }
  process.exit(1);
}

// On Windows, normalise the environment for bash:
// 1. Bash expects "PATH" (uppercase) but Windows may use "Path" — merge all
//    case-variants into a single uppercase "PATH".
// 2. Prepend the directory containing the current node binary so that node,
//    npm, pnpm, etc. are findable inside the bash script even when spawned
//    through deeply-nested npm/cmd.exe process chains.
const env = { ...process.env };
if (process.platform === 'win32') {
  const nodeDir = path.dirname(process.execPath);
  const pathEntries = Object.entries(env).filter(([k]) => k.toUpperCase() === 'PATH');
  const pathValue = pathEntries.map(([, v]) => v).join(path.delimiter);
  for (const [k] of pathEntries) delete env[k];
  env.PATH = `${nodeDir}${path.delimiter}${pathValue}`;
}

// Use a relative path so bash never sees Windows drive-letter paths like
// "D:/..." which can fail when invoked through nested npm/cmd.exe chains.
const scriptPath = 'scripts/build-openclaw-runtime.sh';

let command = bashExecutable;
let args = [scriptPath, targetId];

// On macOS, if the host arch (process.arch) is different from the target arch,
// we should use the 'arch' command to force the shell to run in the target mode.
// This is critical for native module compilation/fetching during 'npm install'.
// e.g. on arm64 host, building for x64: 'arch -x86_64 bash ...'
if (process.platform === 'darwin') {
  const hostArch = process.arch; // 'arm64' or 'x64'
  const targetArch = targetId.split('-')[1]; // 'arm64' or 'x64'
  
  if (targetArch && hostArch !== targetArch) {
    const archFlag = targetArch === 'x64' ? '-x86_64' : '-arm64';
    console.log(`[run-build-openclaw-runtime] Cross-compiling detected (host=${hostArch}, target=${targetArch}). Using: arch ${archFlag}`);
    command = 'arch';
    args = [archFlag, bashExecutable, scriptPath, targetId];
  }
}

const result = spawnSync(command, args, {
  cwd: rootDir,
  env,
  stdio: 'inherit',
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
