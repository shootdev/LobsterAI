#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import shlex
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib import error, request


REPO_ROOT = Path(__file__).resolve().parent
PACKAGE_JSON_PATH = REPO_ROOT / 'package.json'
ELECTRON_BUILDER_JSON_PATH = REPO_ROOT / 'electron-builder.json'
RELEASE_DIR = REPO_ROOT / 'release'

DEFAULT_BASE_URL = 'https://ipa.qzhuli.cn'
DEFAULT_POLICY_PATH = '/open-api/v1/uploads/policy'
DEFAULT_COMPLETE_PATH = '/open-api/v1/versions/complete'
DEFAULT_FEISHU_PATH_TEMPLATE = '/open-api/v1/versions/{versionId}/publish-feishu'
DEFAULT_APP_ID = 'a807bf3ac2ab4ea7d52b9c4f6d3112c4'
DEFAULT_TOKEN = 'fab170ca69f25b60fc308629e648d1f0b90e433496a6e25902c86836227685e9'

ARCH_CONFIG = {
  'intel': {
    'npm_script': 'dist:mac:x64',
    'package_architecture': 'intel',
    'artifact_suffix': '-x64.dmg',
  },
  'mac': {
    'npm_script': 'dist:mac:arm64',
    'package_architecture': 'apple_silicon',
    'artifact_suffix': '-arm64.dmg',
  },
}


class ReleaseError(RuntimeError):
  pass


def log(message: str) -> None:
  print(f'[build-and-publish] {message}', flush=True)


def load_json(path: Path) -> dict[str, Any]:
  with path.open('r', encoding='utf-8') as file:
    return json.load(file)


def first_non_empty(*values: str | None) -> str | None:
  for value in values:
    if value is None:
      continue
    normalized = value.strip()
    if normalized:
      return normalized
  return None


def require_value(name: str, value: str | None) -> str:
  if value:
    return value
  raise ReleaseError(f'Missing required setting: {name}')


def run_command(command: list[str]) -> None:
  quoted = ' '.join(shlex.quote(part) for part in command)
  log(f'Running command: {quoted}')
  try:
    subprocess.run(command, cwd=REPO_ROOT, check=True)
  except FileNotFoundError as exc:
    raise ReleaseError(f'Command not found: {command[0]}') from exc


def join_url(base_url: str, path_or_url: str) -> str:
  if path_or_url.startswith('http://') or path_or_url.startswith('https://'):
    return path_or_url
  return f'{base_url.rstrip("/")}/{path_or_url.lstrip("/")}'


def get_git_commit_id() -> str | None:
  try:
    result = subprocess.run(
      ['git', 'rev-parse', 'HEAD'],
      cwd=REPO_ROOT,
      check=True,
      capture_output=True,
      text=True,
    )
  except (FileNotFoundError, subprocess.CalledProcessError):
    return None

  commit_id = result.stdout.strip()
  return commit_id or None


def build_release_notes(base_notes: str | None, commit_id: str | None) -> str | None:
  notes = first_non_empty(base_notes)
  if not commit_id:
    return notes

  commit_line = f'commit: {commit_id}'
  if not notes:
    return commit_line
  if commit_line in notes:
    return notes
  return f'{notes}\n{commit_line}'


def request_json(url: str, headers: dict[str, str], payload: dict[str, Any] | None = None) -> dict[str, Any]:
  data = None
  request_headers = dict(headers)
  if payload is not None:
    data = json.dumps(payload).encode('utf-8')
    request_headers['Content-Type'] = 'application/json'

  http_request = request.Request(url, data=data, headers=request_headers, method='POST')

  try:
    with request.urlopen(http_request) as response:
      body = response.read().decode('utf-8')
  except error.HTTPError as exc:
    body = exc.read().decode('utf-8', errors='replace')
    raise ReleaseError(f'HTTP {exc.code} for {url}: {body}') from exc
  except error.URLError as exc:
    raise ReleaseError(f'Request failed for {url}: {exc.reason}') from exc

  try:
    return json.loads(body) if body else {}
  except json.JSONDecodeError as exc:
    raise ReleaseError(f'Invalid JSON response from {url}: {body}') from exc


def upload_file(upload_url: str, upload_token: str, key: str, artifact_path: Path) -> None:
  curl = shutil.which('curl')
  if not curl:
    raise ReleaseError('curl is required for file upload but was not found in PATH')

  command = [
    curl,
    '--fail',
    '--silent',
    '--show-error',
    '-X',
    'POST',
    upload_url,
    '-F',
    f'token={upload_token}',
    '-F',
    f'key={key}',
    '-F',
    f'file=@{artifact_path}',
  ]
  run_command(command)


def snapshot_dmgs() -> dict[Path, float]:
  if not RELEASE_DIR.exists():
    return {}
  return {path: path.stat().st_mtime for path in RELEASE_DIR.glob('*.dmg')}


def resolve_artifact_path(artifact_argument: str | None, arch: str, before_build: dict[Path, float] | None, build_started_at: float | None) -> Path:
  config = ARCH_CONFIG[arch]
  suffix = config['artifact_suffix']

  if artifact_argument:
    artifact_path = Path(artifact_argument).expanduser()
    if not artifact_path.is_absolute():
      artifact_path = (REPO_ROOT / artifact_path).resolve()
    if not artifact_path.is_file():
      raise ReleaseError(f'Artifact file does not exist: {artifact_path}')
    return artifact_path

  if not RELEASE_DIR.exists():
    raise ReleaseError(f'Release directory does not exist: {RELEASE_DIR}')

  candidates = [path for path in RELEASE_DIR.glob(f'*{suffix}') if path.is_file()]
  if not candidates:
    candidates = [path for path in RELEASE_DIR.glob('*.dmg') if path.is_file()]
  if not candidates:
    raise ReleaseError(f'No DMG artifact found under {RELEASE_DIR}')

  if before_build is not None and build_started_at is not None:
    new_candidates = []
    for candidate in candidates:
      previous_mtime = before_build.get(candidate)
      current_mtime = candidate.stat().st_mtime
      if previous_mtime is None or current_mtime > previous_mtime or current_mtime >= build_started_at:
        new_candidates.append(candidate)
    if new_candidates:
      candidates = new_candidates

  candidates.sort(key=lambda item: item.stat().st_mtime, reverse=True)
  return candidates[0]


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description='Build and publish LobsterAI macOS packages.')
  parser.add_argument('--arch', required=True, choices=sorted(ARCH_CONFIG.keys()), help='Target architecture: intel or mac')
  parser.add_argument('--base-url', default=DEFAULT_BASE_URL, help=f'IPA distribution base URL (default: {DEFAULT_BASE_URL})')
  parser.add_argument('--policy-path', default=DEFAULT_POLICY_PATH, help=f'Upload policy API path or absolute URL (default: {DEFAULT_POLICY_PATH})')
  parser.add_argument('--complete-path', default=DEFAULT_COMPLETE_PATH, help=f'Complete API path or absolute URL (default: {DEFAULT_COMPLETE_PATH})')
  parser.add_argument(
    '--feishu-path',
    default=DEFAULT_FEISHU_PATH_TEMPLATE,
    help=f'Feishu publish API path or absolute URL (default: {DEFAULT_FEISHU_PATH_TEMPLATE})',
  )
  parser.add_argument('--token', default=DEFAULT_TOKEN, help='Open API token used by the distribution service')
  parser.add_argument('--app-id', default=DEFAULT_APP_ID, help=f'macOS app id on the distribution platform (default: {DEFAULT_APP_ID})')
  parser.add_argument('--display-name', help='Display name sent to the distribution platform')
  parser.add_argument('--version', help='Release version, defaults to package.json version')
  parser.add_argument('--build-number', help='Build number, defaults to the release version')
  parser.add_argument('--release-notes', help='Release notes sent to the complete API')
  parser.add_argument('--artifact', help='Existing DMG path; skips automatic artifact discovery when provided')
  parser.add_argument('--skip-build', action='store_true', help='Skip npm build and publish the existing DMG')
  parser.add_argument('--publish-feishu', action='store_true', help='Publish completed version to Feishu')
  return parser.parse_args()


def main() -> int:
  args = parse_args()
  package_json = load_json(PACKAGE_JSON_PATH)
  electron_builder_json = load_json(ELECTRON_BUILDER_JSON_PATH)
  base_url = require_value('base_url', args.base_url).rstrip('/')
  token = require_value('token', args.token)
  app_id = require_value('app_id', args.app_id)
  version = first_non_empty(args.version, package_json.get('version'))
  version = require_value('version', version)
  build_number = first_non_empty(args.build_number, version)
  display_name = first_non_empty(
    args.display_name,
    electron_builder_json.get('productName'),
    package_json.get('description'),
    package_json.get('name'),
  )
  display_name = require_value('display_name', display_name)
  git_commit_id = get_git_commit_id()
  release_notes = build_release_notes(first_non_empty(args.release_notes, f'v{version} release'), git_commit_id)

  headers = {
    'Accept': 'application/json',
    'X-IPA-TOKEN': token,
  }

  before_build: dict[Path, float] | None = None
  build_started_at: float | None = None
  if not args.skip_build:
    before_build = snapshot_dmgs()
    build_started_at = time.time()
    run_command(['npm', 'run', ARCH_CONFIG[args.arch]['npm_script']])

  artifact_path = resolve_artifact_path(args.artifact, args.arch, before_build, build_started_at)
  architecture = ARCH_CONFIG[args.arch]['package_architecture']

  log(f'Using artifact: {artifact_path}')
  log(f'Publishing version={version}, buildNumber={build_number}, architecture={architecture}')
  log(f'Using baseUrl={base_url}, appId={app_id}')
  if git_commit_id:
    log(f'Using git commit id: {git_commit_id}')

  policy_response = request_json(
    join_url(base_url, args.policy_path),
    headers,
    {
      'appId': app_id,
      'filename': artifact_path.name,
      'architecture': architecture,
    },
  )

  upload_url = require_value('uploadUrl', policy_response.get('uploadUrl'))
  upload_token = require_value('uploadToken', policy_response.get('uploadToken'))
  key = require_value('key', policy_response.get('key'))

  upload_file(upload_url, upload_token, key, artifact_path)

  complete_payload: dict[str, Any] = {
    'appId': app_id,
    'key': key,
    'architecture': architecture,
    'version': version,
    'buildNumber': build_number,
    'displayName': display_name,
  }
  if release_notes:
    complete_payload['releaseNotes'] = release_notes

  version_response = request_json(
    join_url(base_url, args.complete_path),
    headers,
    complete_payload,
  )
  version_id = version_response.get('id')
  if not version_id:
    raise ReleaseError(f'complete API did not return a version id: {version_response}')

  log(f'Uploaded successfully, versionId={version_id}')

  if args.publish_feishu:
    feishu_path = args.feishu_path.replace('{versionId}', str(version_id)).replace('%s', str(version_id))
    publish_response = request_json(
      join_url(base_url, feishu_path),
      headers,
    )
    log(f'publish-feishu response: {json.dumps(publish_response, ensure_ascii=False)}')
  else:
    log('Skipped publish-feishu step')

  log('Build and publish flow completed successfully')
  return 0


if __name__ == '__main__':
  try:
    sys.exit(main())
  except subprocess.CalledProcessError as exc:
    print(f'[build-and-publish] Command failed with exit code {exc.returncode}', file=sys.stderr)
    sys.exit(exc.returncode or 1)
  except ReleaseError as exc:
    print(f'[build-and-publish] {exc}', file=sys.stderr)
    sys.exit(1)
