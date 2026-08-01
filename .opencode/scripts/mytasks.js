#!/usr/bin/env node
/**
 * mytasks.js — Wrapper for the mytasks CLI.
 *
 * Usage:
 *   node .opencode/scripts/mytasks.js <command> [args] [options]
 *
 * Resolves the mytasks repo (env MYTASKS_REPO or default <repoRoot>/../mytasks)
 * and spawns `node <repo>/packages/cli/dist/index.js <command> ...`, passing
 * through stdout/stderr and the exit code. Always pass --json when calling from
 * an agent; the CLI prints one JSON envelope per run.
 *
 * Cross-platform: macOS, Linux, Windows — zero external dependencies.
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

export function resolveMytasksRepo(env = process.env, repoRoot = REPO_ROOT) {
  if (env.MYTASKS_REPO) return env.MYTASKS_REPO;
  return resolve(repoRoot, '..', 'mytasks');
}

export function buildCliPath(repo) {
  return join(repo, 'packages', 'cli', 'dist', 'index.js');
}

export function run(argv = process.argv.slice(2), env = process.env, repoRoot = REPO_ROOT) {
  const repo = resolveMytasksRepo(env, repoRoot);
  const cli = buildCliPath(repo);

  if (!existsSync(cli)) {
    return {
      status: 1,
      message: `mytasks CLI not found: ${cli}\n` +
        `Set MYTASKS_REPO to the mytasks repo path, or build it first:\n` +
        `  cd ${repo} && npm run build`,
    };
  }

  const result = spawnSync(process.execPath, [cli, ...argv], {
    cwd: repo,
    stdio: 'inherit',
    env,
  });
  return { status: result.status ?? 1, message: null };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = run();
  if (result.status !== 0 && result.message) {
    console.error(result.message);
  }
  process.exit(result.status);
}
