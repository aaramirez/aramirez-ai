import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { REPO_ROOT } from '../helpers.js';

const IMPORT_SCRIPT = join(REPO_ROOT, '.opencode', 'scripts', 'mytasks-import.js');
const PMO_JSON = resolve(REPO_ROOT, '..', 'gda-ai', 'docs', 'PMO', 'proyectos_requerimientos_completo.json');
const TEAM_JSON = resolve(REPO_ROOT, '..', 'gda-ai', 'team.json');

const FIXTURE_GROUPS = {
  gerencia: { name: 'Gerencia', members: ['P1'] },
  'coordinacion-ingenieria': {
    name: 'Coordinación de Ingeniería',
    subgroups: {
      'ciclo-negocio': { name: 'Supervisión — Ciclo de Negocio', members: ['P2'] },
      fibex: { name: 'Supervisión — Fibex', members: ['P3'] },
    },
  },
  'coordinacion-proyectos': { name: 'Coordinación de Proyectos', members: ['P4'] },
  'personal-sin-cargo': { name: 'Personal sin cargo en la estructura formal', members: ['P5'] },
};

const FIXTURE_PARTICIPANTS = {
  P1: { id: 'P1', name: 'Alexander Ramírez', email: 'aramirez@grupoconex.net', phone: '+584122417152' },
  P2: { id: 'P2', name: 'Ana María Moreno', email: 'ammoreno@grupoconex.net', phone: '+584121571880' },
  P3: { id: 'P3', name: 'Rodolfo Suarez', email: 'rsuarez@grupoconex.net', phone: '+584245864013' },
  P4: { id: 'P4', name: 'Martín Moreno', email: 'mmoreno@grupoconex.net', phone: '+584142058959' },
  P5: { id: 'P5', name: 'Belkis Molina', email: 'bmolina@grupoconex.net', phone: '+584127387867' },
  P6: { id: 'P6', name: 'Gabriel Marcano', email: 'gamarcano@grupoconex.net', phone: '+584127765827' },
  P7: { id: 'P7', name: 'Gabriel Marcano', email: 'gamarcano@grupoconex.net', phone: '+584127765827' },
};

const FIXTURE_ITEMS = [
  {
    'Proyecto': 'Plataforma de comunicación y cobranzas (Whatsapp)',
    'Solicitado por ': 'Jean Sánchez',
    'Descripción': '<span style="font-size&#58;11pt;">Implementar\nuna plataforma</span>',
    'Categoría ': 'Integración',
    'Grupo': '["Fibex"]',
    'Etapa': 'Ejecución',
    'Clasificación': 'Proyecto',
    'Prioridad': 'Crítico',
    'Fecha de inicio': '20/03/2026',
    'Fecha fin': '',
    'Asignado a': 'Gabriel Marcano',
  },
  {
    'Proyecto': 'Reporte de indicadores',
    'Solicitado por ': 'Ana María Moreno',
    'Descripción': 'Crear dashboard de indicadores',
    'Categoría ': 'Datos y analítica',
    'Grupo': '["Corporativo"]',
    'Etapa': 'Levantamiento',
    'Clasificación': 'Requerimiento',
    'Prioridad': 'Media',
    'Fecha de inicio': '',
    'Fecha fin': '31/12/2026',
    'Asignado a': 'David Giménez',
  },
];

describe('mytasks-import pure functions', () => {
  let mod;
  test('script exists and exports pure functions', async () => {
    assert.ok(existsSync(IMPORT_SCRIPT), `Script not found: ${IMPORT_SCRIPT}`);
    mod = await import(pathToFileURL(IMPORT_SCRIPT).href);
    for (const fn of [
      'sanitizeDescription',
      'parseDate',
      'mapPriority',
      'normalizeName',
      'findMemberId',
      'pickDue',
      'planUnits',
      'planMembers',
      'planProjects',
      'planTasks',
      'buildTaskArgs',
    ]) {
      assert.equal(typeof mod[fn], 'function', `Missing export: ${fn}`);
    }
  });

  test('sanitizeDescription strips tags, decodes entities, collapses whitespace', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    const input = '<span style="font-size&#58;11pt;">Implementar\nuna plataforma</span>&#160;para&nbsp;cobros &amp; más';
    const out = mod.sanitizeDescription(input);
    assert.equal(out, 'Implementar una plataforma para cobros & más');
    assert.ok(!out.includes('<'));
    assert.ok(!out.includes('&#'));
  });

  test('sanitizeDescription truncates to 500 chars', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    const out = mod.sanitizeDescription('x'.repeat(600));
    assert.equal(out.length, 500);
  });

  test('parseDate converts DD/MM/YYYY to YYYY-MM-DD', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    assert.equal(mod.parseDate('20/03/2026'), '2026-03-20');
    assert.equal(mod.parseDate('1/3/2026'), '2026-03-01');
  });

  test('parseDate returns null for empty or invalid', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    assert.equal(mod.parseDate(''), null);
    assert.equal(mod.parseDate('   '), null);
    assert.equal(mod.parseDate('31/13/2026'), null);
    assert.equal(mod.parseDate('not a date'), null);
  });

  test('mapPriority maps Crítico/Alto→high, Media→med, Baja→low, unknown→med', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    assert.equal(mod.mapPriority('Crítico'), 'high');
    assert.equal(mod.mapPriority('Alto'), 'high');
    assert.equal(mod.mapPriority('Media'), 'med');
    assert.equal(mod.mapPriority('Baja'), 'low');
    assert.equal(mod.mapPriority(''), 'med');
    assert.equal(mod.mapPriority('Raro'), 'med');
  });

  test('normalizeName lowercases, strips accents and collapses spaces', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    assert.equal(mod.normalizeName('David Giménez'), 'david gimenez');
    assert.equal(mod.normalizeName('  María  Caserio '), 'maria caserio');
  });

  test('findMemberId matches exact name (case/accent-insensitive) and last-name fallback', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    const members = [
      { id: 1, name: 'Alexander Ramírez' },
      { id: 2, name: 'Gabriel Marcano' },
      { id: 3, name: 'David Giménez' },
    ];
    assert.equal(mod.findMemberId('Gabriel Marcano', members), 2);
    assert.equal(mod.findMemberId('gabriel marcano', members), 2);
    assert.equal(mod.findMemberId('David Gimenez', members), 3);
    assert.equal(mod.findMemberId('Giménez', members), 3);
    assert.equal(mod.findMemberId('Desconocido', members), null);
  });

  test('pickDue prefers end date, falls back to start date', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    assert.equal(mod.pickDue('', '20/03/2026'), '2026-03-20');
    assert.equal(mod.pickDue('01/01/2026', ''), '2026-01-01');
    assert.equal(mod.pickDue('01/01/2026', '20/03/2026'), '2026-03-20');
    assert.equal(mod.pickDue('', ''), null);
  });

  test('planUnits flattens groups into ordered unit names', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    assert.deepEqual(mod.planUnits(FIXTURE_GROUPS), [
      'Gerencia',
      'Coordinación de Ingeniería',
      'Supervisión — Ciclo de Negocio',
      'Supervisión — Fibex',
      'Coordinación de Proyectos',
      'Personal sin cargo en la estructura formal',
    ]);
  });

  test('planMembers maps participants to units and dedupes by email', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    const members = mod.planMembers(FIXTURE_PARTICIPANTS, FIXTURE_GROUPS);
    assert.equal(members.length, 6);
    assert.deepEqual(members[0], {
      name: 'Alexander Ramírez',
      email: 'aramirez@grupoconex.net',
      phone: '+584122417152',
      unitName: 'Gerencia',
    });
    assert.equal(members[1].unitName, 'Supervisión — Ciclo de Negocio');
    assert.equal(members[2].unitName, 'Supervisión — Fibex');
    assert.equal(members[3].unitName, 'Coordinación de Proyectos');
    assert.equal(members[5].unitName, null);
    const emails = members.map((m) => m.email);
    assert.equal(new Set(emails).size, emails.length, 'duplicate emails should be deduped');
  });

  test('planProjects returns sorted unique categories', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    assert.deepEqual(mod.planProjects(FIXTURE_ITEMS), ['Datos y analítica', 'Integración']);
  });

  test('planTasks maps items to task plans', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    const plans = mod.planTasks(FIXTURE_ITEMS);
    assert.equal(plans.length, 2);
    assert.deepEqual(plans[0], {
      title: 'Plataforma de comunicación y cobranzas (Whatsapp)',
      description: 'Implementar una plataforma',
      type: 'project',
      priority: 'high',
      dueDate: '2026-03-20',
      category: 'Integración',
      tags: ['Fibex', 'Integración', 'Ejecución'],
      requester: 'Jean Sánchez',
      assignee: 'Gabriel Marcano',
    });
    assert.deepEqual(plans[1], {
      title: 'Reporte de indicadores',
      description: 'Crear dashboard de indicadores',
      type: 'requirement',
      priority: 'med',
      dueDate: '2026-12-31',
      category: 'Datos y analítica',
      tags: ['Corporativo', 'Datos y analítica', 'Levantamiento'],
      requester: 'Ana María Moreno',
      assignee: 'David Giménez',
    });
  });

  test('buildTaskArgs produces expected CLI args', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    const ctx = {
      projectIdByCategory: { 'Integración': 1, 'Datos y analítica': 2 },
      memberIdByName: { 'gabriel marcano': 2, 'david gimenez': 5, 'jean sanchez': null, 'ana maria moreno': null },
    };
    const plans = mod.planTasks(FIXTURE_ITEMS);
    assert.deepEqual(mod.buildTaskArgs(plans[0], ctx), [
      'create',
      'Plataforma de comunicación y cobranzas (Whatsapp)',
      '--type', 'project',
      '--priority', 'high',
      '--due', '2026-03-20',
      '--project', '1',
      '--assigned-to', '2',
      '--tags', 'Fibex,Integración,Ejecución',
      '--description', 'Implementar una plataforma',
    ]);
    assert.deepEqual(mod.buildTaskArgs(plans[1], ctx), [
      'create',
      'Reporte de indicadores',
      '--type', 'requirement',
      '--priority', 'med',
      '--due', '2026-12-31',
      '--project', '2',
      '--assigned-to', '5',
      '--tags', 'Corporativo,Datos y analítica,Levantamiento',
      '--description', 'Crear dashboard de indicadores',
    ]);
  });

  test('buildTaskArgs omits unknown member ids gracefully', async () => {
    mod = mod || (await import(pathToFileURL(IMPORT_SCRIPT).href));
    const ctx = { projectIdByCategory: {}, memberIdByName: {} };
    const args = mod.buildTaskArgs(mod.planTasks([FIXTURE_ITEMS[0]])[0], ctx);
    assert.ok(!args.includes('--assigned-to'));
    assert.ok(!args.includes('--requested-by'));
    assert.ok(!args.includes('--project'));
  });
});

describe('mytasks-import real data (integration)', {
  skip: !existsSync(PMO_JSON) || !existsSync(TEAM_JSON),
}, () => {
  test('loads and plans the real gda-ai portfolio without errors', async () => {
    const mod = await import(pathToFileURL(IMPORT_SCRIPT).href);
    const { readFileSync } = await import('fs');
    const pmo = JSON.parse(readFileSync(PMO_JSON, 'utf8'));
    const team = JSON.parse(readFileSync(TEAM_JSON, 'utf8'));

    const items = [...pmo.Proyectos, ...pmo.Requerimientos];
    assert.equal(items.length, 64);

    const plans = mod.planTasks(items);
    assert.equal(plans.length, 64);
    assert.ok(plans.every((p) => p.title && ['project', 'requirement'].includes(p.type)));
    assert.ok(plans.every((p) => ['high', 'med', 'low'].includes(p.priority)));

    const categories = mod.planProjects(items);
    assert.equal(categories.length, 7);

    const units = mod.planUnits(team.groups);
    assert.ok(units.length >= 6);

    const members = mod.planMembers(team.participants, team.groups);
    assert.ok(members.length >= 30);
    assert.ok(members.every((m) => m.name && m.email.includes('@')));
  });
});
