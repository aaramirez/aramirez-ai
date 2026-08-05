#!/usr/bin/env node
/**
 * mytasks-import.js — Import the ../gda-ai project/requirement portfolio into
 * mytasks using only the mytasks CLI commands (unit, member, project, task).
 *
 * Usage:
 *   node .opencode/scripts/mytasks-import.js --dry-run   # preview, no writes
 *   node .opencode/scripts/mytasks-import.js --apply     # execute the import
 *
 * Data sources (read-only):
 *   <gda-ai>/docs/PMO/proyectos_requerimientos_completo.json  (Proyectos + Requerimientos)
 *   <gda-ai>/team.json                                        (participants + groups)
 *
 * Idempotent: units/projects by name, members by email, tasks by
 * (normalized title + type). All writes go through the CLI — never the DB.
 * Cross-platform: macOS, Linux, Windows — zero external dependencies.
 */

import { spawnSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { resolveMytasksRepo, buildCliPath } from './mytasks.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

const PMO_PATH = resolve(REPO_ROOT, '..', 'gda-ai', 'docs', 'PMO', 'proyectos_requerimientos_completo.json');
const TEAM_PATH = resolve(REPO_ROOT, '..', 'gda-ai', 'team.json');
const DESC_MAX = 500;

export function sanitizeDescription(input = '') {
  const noTags = String(input).replace(/<[^>]*>/g, ' ');
  const decoded = noTags
    .replace(/&#58;/g, ':')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  const collapsed = decoded.replace(/\s+/g, ' ').trim();
  return collapsed.length > DESC_MAX ? collapsed.slice(0, DESC_MAX) : collapsed;
}

export function parseDate(value = '') {
  const m = String(value).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function mapPriority(priority = '') {
  const p = normalizeName(priority);
  if (p === 'critico' || p === 'alto' || p === 'urgente') return 'high';
  if (p === 'baja') return 'low';
  if (p === 'media') return 'med';
  return 'med';
}

export function normalizeName(name = '') {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function findMemberId(name = '', members = []) {
  const target = normalizeName(name);
  if (!target) return null;
  for (const member of members) {
    if (normalizeName(member.name) === target) return member.id;
  }
  const targetLast = target.split(' ').pop();
  for (const member of members) {
    const memberLast = normalizeName(member.name).split(' ').pop();
    if (memberLast === targetLast) return member.id;
  }
  return null;
}

export function pickDue(start = '', end = '') {
  return parseDate(end) || parseDate(start);
}

function flattenGroups(groups) {
  const out = [];
  for (const key of Object.keys(groups)) {
    const group = groups[key];
    out.push({ name: group.name, members: group.members || [] });
    if (group.subgroups) out.push(...flattenGroups(group.subgroups));
  }
  return out;
}

export function planUnits(groups = {}) {
  return flattenGroups(groups).map((g) => g.name);
}

function unitNameForParticipant(id, groups) {
  for (const group of flattenGroups(groups)) {
    if (group.members.includes(id)) return group.name;
  }
  return null;
}

export function planMembers(participants = {}, groups = {}) {
  const seen = new Set();
  const out = [];
  for (const id of Object.keys(participants)) {
    const p = participants[id];
    const email = String(p.email || '').trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    out.push({
      name: String(p.name || '').trim(),
      email,
      phone: p.phone ? String(p.phone).trim() : null,
      unitName: unitNameForParticipant(id, groups),
    });
  }
  return out;
}

export function planProjects(items = []) {
  const categories = new Set();
  for (const item of items) {
    const category = String(item['Categoría '] ?? '').trim();
    if (category) categories.add(category);
  }
  return [...categories].sort();
}

function parseGroupList(value) {
  try {
    const parsed = JSON.parse(String(value || ''));
    if (Array.isArray(parsed)) return parsed.map((g) => String(g).trim()).filter(Boolean);
  } catch {
    // ignore malformed group strings
  }
  return [];
}

export function planTasks(items = []) {
  return items.map((item) => {
    const category = String(item['Categoría '] ?? '').trim();
    const stage = String(item['Etapa'] ?? '').trim();
    const groupTags = parseGroupList(item['Grupo']);
    const classification = String(item['Clasificación'] ?? '').trim().toLowerCase();
    const tags = [...groupTags];
    if (category) tags.push(category);
    if (stage) tags.push(stage);
    return {
      title: String(item['Proyecto'] ?? '').trim(),
      description: sanitizeDescription(item['Descripción']),
      type: classification === 'proyecto' ? 'project' : 'requirement',
      priority: mapPriority(item['Prioridad']),
      dueDate: pickDue(item['Fecha de inicio'], item['Fecha fin']),
      category,
      tags,
      requester: String(item['Solicitado por '] ?? '').trim(),
      assignee: String(item['Asignado a'] ?? '').trim(),
    };
  });
}

export function buildTaskArgs(plan, ctx) {
  const args = ['create', plan.title, '--type', plan.type, '--priority', plan.priority];
  if (plan.dueDate) args.push('--due', plan.dueDate);
  const projectId = ctx.projectIdByCategory[plan.category];
  if (projectId) args.push('--project', String(projectId));
  const assigneeId = ctx.memberIdByName[normalizeName(plan.assignee)];
  if (assigneeId) args.push('--assigned-to', String(assigneeId));
  const requesterId = ctx.memberIdByName[normalizeName(plan.requester)];
  if (requesterId) args.push('--requested-by', String(requesterId));
  if (plan.tags.length) args.push('--tags', plan.tags.join(','));
  if (plan.description) args.push('--description', plan.description);
  return args;
}

function cli(cliPath, repo, args) {
  const result = spawnSync(process.execPath, [cliPath, ...args, '--json'], {
    cwd: repo,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 30000,
  });
  const stdout = (result.stdout || '').trim();
  let parsed = null;
  try {
    parsed = stdout ? JSON.parse(stdout) : null;
  } catch {
    parsed = null;
  }
  if (result.status !== 0 || !parsed || parsed.ok !== true) {
    const message = parsed && parsed.error ? parsed.error.message : stdout || result.stderr || 'unknown error';
    throw new Error(`mytasks ${args.join(' ')} failed: ${message}`);
  }
  return parsed.data;
}

function readJsonOrNull(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function buildContext(cliPath, repo) {
  const units = cli(cliPath, repo, ['unit', 'list']);
  const unitIdByName = new Map(units.map((u) => [normalizeName(u.name), u.id]));

  const members = cli(cliPath, repo, ['member', 'list']);
  const memberIdByName = new Map();
  for (const member of members) memberIdByName.set(normalizeName(member.name), member.id);

  const projects = cli(cliPath, repo, ['project', 'list']);
  const projectIdByName = new Map(projects.map((p) => [normalizeName(p.name), p.id]));

  const tasks = cli(cliPath, repo, ['list', '--all']);
  const existingTaskKeys = new Set(
    tasks.map((t) => `${normalizeName(t.title)}|${t.type}`),
  );

  return { unitIdByName, memberIdByName, projectIdByName, existingTaskKeys };
}

export function planImport(pmo, team, ctx) {
  const items = [...pmo.Proyectos, ...pmo.Requerimientos];

  const unitPlans = [];
  for (const name of planUnits(team.groups)) {
    if (!ctx.unitIdByName.has(normalizeName(name))) unitPlans.push({ name });
  }

  const memberPlans = [];
  for (const member of planMembers(team.participants, team.groups)) {
    if (ctx.memberIdByName.has(normalizeName(member.name))) continue;
    memberPlans.push(member);
  }

  const plannedMemberNames = new Set(memberPlans.map((m) => normalizeName(m.name)));

  const projectPlans = [];
  for (const name of planProjects(items)) {
    if (!ctx.projectIdByName.has(normalizeName(name))) projectPlans.push({ name });
  }

  const taskPlans = [];
  const warnings = [];
  for (const plan of planTasks(items)) {
    if (!plan.title) continue;
    const key = `${normalizeName(plan.title)}|${plan.type}`;
    if (ctx.existingTaskKeys.has(key)) continue;
    for (const [field, value] of [['assignee', plan.assignee], ['requester', plan.requester]]) {
      if (!value) continue;
      if (!ctx.memberIdByName.has(normalizeName(value)) && !plannedMemberNames.has(normalizeName(value))) {
        warnings.push(`No member match for ${field} "${value}" (task "${plan.title}")`);
      }
    }
    taskPlans.push(plan);
  }

  return { unitPlans, memberPlans, projectPlans, taskPlans, warnings };
}

function execute(plan, cliPath, repo) {
  const summary = {
    units: { planned: plan.unitPlans.length, created: 0 },
    members: { planned: plan.memberPlans.length, created: 0 },
    projects: { planned: plan.projectPlans.length, created: 0 },
    tasks: { planned: plan.taskPlans.length, created: 0 },
  };

  const unitIdByName = new Map();
  for (const unit of plan.unitPlans) {
    const created = cli(cliPath, repo, ['unit', 'create', unit.name]);
    unitIdByName.set(normalizeName(unit.name), created.id);
    summary.units.created += 1;
  }

  const memberIdByName = new Map();
  for (const member of plan.memberPlans) {
    const args = ['member', 'create', member.name, '--email', member.email];
    if (member.phone) args.push('--phone', member.phone);
    const unitId = unitIdByName.get(normalizeName(member.unitName));
    if (unitId) args.push('--unit', String(unitId));
    const created = cli(cliPath, repo, args);
    memberIdByName.set(normalizeName(member.name), created.id);
    summary.members.created += 1;
  }

  const projectIdByName = new Map();
  for (const project of plan.projectPlans) {
    const created = cli(cliPath, repo, ['project', 'create', project.name]);
    projectIdByName.set(normalizeName(project.name), created.id);
    summary.projects.created += 1;
  }

  const projectIdByCategory = {};
  for (const task of plan.taskPlans) {
    if (!task.category) continue;
    const projectId = projectIdByName.get(normalizeName(task.category));
    if (projectId) projectIdByCategory[task.category] = projectId;
  }

  const ctx = {
    projectIdByCategory,
    memberIdByName,
  };
  const members = cli(cliPath, repo, ['member', 'list']);
  for (const member of members) ctx.memberIdByName[normalizeName(member.name)] = member.id;

  for (const task of plan.taskPlans) {
    const args = buildTaskArgs(task, ctx);
    cli(cliPath, repo, args);
    summary.tasks.created += 1;
  }

  return summary;
}

function main(argv) {
  const args = argv.slice();
  const dryRun = args.includes('--dry-run');
  const apply = args.includes('--apply');
  if (!dryRun && !apply) {
    console.error('Usage: node .opencode/scripts/mytasks-import.js [--dry-run|--apply]');
    process.exit(2);
  }

  const pmo = readJsonOrNull(PMO_PATH);
  const team = readJsonOrNull(TEAM_PATH);
  if (!pmo || !team) {
    console.error('Missing source data. Expected:\n  ' + PMO_PATH + '\n  ' + TEAM_PATH);
    process.exit(1);
  }

  const repo = resolveMytasksRepo();
  const cliPath = buildCliPath(repo);
  if (!existsSync(cliPath)) {
    console.error(`mytasks CLI not found: ${cliPath}\nSet MYTASKS_REPO or build it first (npm run build in ${repo}).`);
    process.exit(1);
  }

  const ctx = buildContext(cliPath, repo);
  const plan = planImport(pmo, team, ctx);

  const counts = {
    units: plan.unitPlans.length,
    members: plan.memberPlans.length,
    projects: plan.projectPlans.length,
    tasks: plan.taskPlans.length,
  };

  if (dryRun) {
    console.log('DRY-RUN — no writes performed');
    console.log(`units to create: ${counts.units}`);
    console.log(`members to create: ${counts.members}`);
    console.log(`projects to create: ${counts.projects}`);
    console.log(`tasks to create: ${counts.tasks}`);
    if (plan.warnings.length) {
      console.log('\nwarnings:');
      for (const w of plan.warnings) console.log(`  - ${w}`);
    }
    return;
  }

  const summary = execute(plan, cliPath, repo);
  console.log(JSON.stringify({ ok: true, data: summary }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
