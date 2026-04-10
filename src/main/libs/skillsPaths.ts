import path from 'path';
import { APP_CONFIG_PATH } from '../appConstants';

const SKILLS_DIR_NAMES = ['SKILLs', 'skills'] as const;

type SkillsPathOptions = {
  isPackaged: boolean;
  userDataPath: string;
  appDataPath: string;
  appPath: string;
  cwd: string;
  moduleDir: string;
  envRoots?: Array<string | undefined>;
};

const uniquePaths = (paths: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of paths) {
    const normalized = path.resolve(entry);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

export function listSkillsRootCandidates(options: SkillsPathOptions): string[] {
  const envRoots = (options.envRoots ?? [])
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  const userDataRoots = SKILLS_DIR_NAMES.map((dirName) => path.join(options.userDataPath, dirName));
  const configRoots = SKILLS_DIR_NAMES.map((dirName) => path.join(options.appDataPath, APP_CONFIG_PATH, dirName));

  if (options.isPackaged) {
    return uniquePaths([
      ...envRoots,
      ...userDataRoots,
      ...configRoots,
    ]);
  }

  const devRoots = SKILLS_DIR_NAMES.flatMap((dirName) => [
    path.join(options.appPath, dirName),
    path.join(options.cwd, dirName),
    path.join(options.moduleDir, '..', dirName),
    path.join(options.moduleDir, '..', '..', dirName),
  ]);

  return uniquePaths([
    ...envRoots,
    ...userDataRoots,
    ...configRoots,
    ...devRoots,
  ]);
}

export function resolveSkillsRoot(
  options: SkillsPathOptions,
  exists: (candidate: string) => boolean,
): string {
  const candidates = listSkillsRootCandidates(options);
  const existing = candidates.find((candidate) => exists(candidate));
  return existing ?? candidates[0];
}

export function listExistingSkillsRoots(
  options: SkillsPathOptions,
  exists: (candidate: string) => boolean,
): string[] {
  return listSkillsRootCandidates(options).filter((candidate) => exists(candidate));
}
