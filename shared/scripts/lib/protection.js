/**
 * File protection constants and helpers for install, sync, and init operations.
 * Prevents overwriting user-modified or project-specific files.
 */

/**
 * Files that should NOT be overwritten if they already exist at destination.
 * Overridable with --force.
 */
const SKIP_IF_EXISTS = [
  'opencode.json',
  'AGENTS.md',
  'repos.json',
  'package.json',
  '.gitignore',
];

/**
 * Agent filenames that are internal to aramirez-ai and should never be
 * synced from repo-level .opencode/agents/ to a project's .opencode/agents/.
 */
const EXCLUDE_FROM_SYNC = [
  'agent-creator.md',
  'architecture-creator.md',
  'command-creator.md',
  'config-creator.md',
  'flow-creator.md',
  'instructions-creator.md',
  'mcp-creator.md',
  'new-harness.md',
  'permission-creator.md',
  'plan.md',
  'plugin-creator.md',
  'prompt-creator.md',
  'reference-creator.md',
  'rule-creator.md',
  'script-creator.md',
  'skill-creator.md',
  'tool-creator.md',
];

/**
 * Skills that are internal to aramirez-ai and should not be synced
 * to external projects.
 */
const EXCLUDE_SKILLS_FROM_SYNC = [
  'distribution-pattern',
  'customize-opencode',
  'harness-generator',
];

/**
 * Check if a file should be skipped during install/sync/init.
 * @param {string} relPath - relative path of the file at destination
 * @param {boolean} force - if true, override protection
 * @returns {boolean} true if the file should be skipped
 */
function shouldSkip(relPath, force) {
  if (force) return false;
  return SKIP_IF_EXISTS.some(p => relPath === p || relPath.endsWith('/' + p));
}

/**
 * Check if an agent file is internal and should not be synced.
 * @param {string} filename - agent filename (e.g. 'agent-creator.md')
 * @returns {boolean} true if excluded from sync
 */
function isExcludedFromSync(filename) {
  return EXCLUDE_FROM_SYNC.includes(filename);
}

/**
 * Check if a skill is internal and should not be synced.
 * @param {string} name - skill directory name
 * @returns {boolean} true if excluded from sync
 */
function isExcludedSkill(name) {
  return EXCLUDE_SKILLS_FROM_SYNC.includes(name);
}

export {
  SKIP_IF_EXISTS,
  EXCLUDE_FROM_SYNC,
  EXCLUDE_SKILLS_FROM_SYNC,
  shouldSkip,
  isExcludedFromSync,
  isExcludedSkill,
};
