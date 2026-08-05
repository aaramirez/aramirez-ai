# Importar proyectos de ../gda-ai a mytasks

## Objective

Importar la cartera de proyectos y requerimientos de `../gda-ai` a mytasks creando Unidades, Miembros y Proyectos/Requerimientos, usando exclusivamente los comandos del CLI de mytasks (`unit`, `member`, `project`, `task`), de forma idempotente y sin acceso directo a la base de datos.

## Requirements

1. Script Node.js (ESM) `.opencode/scripts/mytasks-import.js` que orquesta la importación llamando **solo comandos del CLI** de mytasks con `--json` — priority: high
2. Leer la lista de proyectos desde `../gda-ai/docs/PMO/proyectos_requerimientos_completo.json` (46 "Proyecto" + 18 "Requerimiento", claves con espacios finales) — priority: high
3. Leer el equipo y grupos desde `../gda-ai/team.json` (40 participantes + grupos jerárquicos) — priority: high
4. Crear **Unidades** a partir de los grupos del team.json (aplanados), idempotente por nombre — priority: high
5. Crear **Miembros** a partir de team.json con `member create <name> --email <e> --phone <p> --unit <unitId>`, idempotente por email (skip si ya existe) — priority: high
6. Crear agrupaciones **project** a partir de las categorías del JSON de PMO (Integración, Sistemas, Página web, Automatización, Optimización, Datos y analítica, Seguridad), idempotente por nombre — priority: high
7. Crear **tareas**: `Clasificación == "Proyecto"` → `--type project`; `"Requerimiento"` → `--type requirement`; asignar `--project <idCategoría>`, `--priority` mapeado, `--due` (Fecha fin o inicio), `--assigned-to`/`--requested-by` resueltos por nombre contra los miembros (fuzzy), `--tags` (grupo, categoría, etapa), descripción saneada (sin HTML) — priority: high
8. Idempotencia por clave natural: unidades/proyectos por nombre, miembros por email, tareas por (título normalizado + type) — priority: high
9. Modo `--dry-run` (previsualizar sin escribir) y `--apply` (ejecutar), con reporte de resumen (created/skipped/failed) — priority: high
10. Tests TDD sobre funciones puras de mapeo (sin tocar la BD real) — priority: high
11. Documentar el script en `AGENTS.md` (tabla *Available scripts*) — priority: medium
12. Cross-platform: Node.js únicamente, cero dependencias de shell — priority: high

## Architecture

### Files to create

```
.opencode/scripts/mytasks-import.js      # script de importación (orquesta CLI)
tests/scripts/mytasks-import.test.js     # tests de funciones puras (RED → GREEN)
plans/060-import-gda-projects-mytasks-2026-07-31.md  # este plan
```

### Files to modify

```
AGENTS.md   # + fila .opencode/scripts/mytasks-import.js en Available scripts
```

### Decisions

- **Solo CLI, nunca la BD**: toda operación de escritura se ejecuta como `node <cli> <sub> <cmd> ... --json` vía `spawnSync` con `stdio: pipe`, parseando el envelope `{ok,data}`. No se usa `MYTASKS_DB_PATH` ni lectura directa del SQLite.
- **Reuso del wrapper**: `mytasks-import.js` importa `resolveMytasksRepo` y `buildCliPath` desde `./mytasks.js` (ya exportados) para localizar el CLI (`../mytasks/packages/cli/dist/index.js` o `MYTASKS_REPO`). Implementa su propia función `cli(args)` que captura stdout JSON (a diferencia de `run()`, que usa `stdio: inherit`).
- **Orden de importación**: 1) Units → 2) Members → 3) Projects (agrupación) → 4) Tasks. Cada fase resuelve ids vía `list --json` antes de crear.
- **Unidades (units)** desde `team.json.groups`, aplanando la jerarquía (subgrupos como unidades independientes): Gerencia, Coordinación de Ingeniería, Supervisión — Ciclo de Negocio, Supervisión — Fibex, Supervisión — Corporativo, Coordinación de Proyectos, Nodo de Innovación, Personal sin cargo en la estructura formal. Skip si el nombre ya existe (`unit list`).
- **Miembros (members)** desde `team.json.participants` con `--email`, `--phone`, `--unit <id>` del grupo al que pertenecen (primera coincidencia en la jerarquía). Idempotencia por email (case-insensitive, `member list`): si existe → skip (registra en resumen). Miembros ya presentes en mytasks (Alexander Ramírez, Gabriel Marcano, Ana María Moreno, Victor Moncada) se saltan automáticamente.
- **Agrupaciones (project)** desde las 7 categorías del PMO: la `Categoría` es el criterio de agrupación del portafolio. *(Alternativa descartada: agrupar por `Grupo` — redundante con las unidades; un único proyecto "GDA" — menos granular.)*
- **Tareas (tasks)** desde `Proyectos` + `Requerimientos`:
  - `--type`: `proyecto`→`project`, `requerimiento`→`requirement` (Clasificación).
  - `--priority`: Crítico→`high`, Alto→`high`, Media→`med`, Baja→`low` (default `med`).
  - `--due`: `Fecha fin` si no vacía; si no `Fecha de inicio`. Formato `DD/MM/YYYY` → `YYYY-MM-DD`; vacío → omitido.
  - `--assigned-to` / `--requested-by`: resolver el nombre (normalizado, sin acentos, trim) contra los miembros importados/existentes con coincidencia exacta y fallback por apellido; si no hay match → se omite el flag (queda null) y se registra warning. Claves del JSON con espacio final: `"Solicitado por "`, `"Categoría "` (siempre `trim()`).
  - `--tags`: [grupo, categoría, etapa] limpios (ej. `Fibex`, `Sistemas`, `Ejecución`). Los tags se comparan case-insensitive en mytasks.
  - `--description`: strip de etiquetas HTML y entidades (`<span…>`, `<br>`, `&#58;`, `&amp;`, `&#160;`), colapsar whitespace, truncar a ~500 caracteres.
  - `--status`: por defecto `todo`. La `Etapa` se conserva como tag, no como status (decisión conservadora).
  - Idempotencia por (título normalizado + type) contra `task list --all --json`: si ya existe → skip.
- **Modo dry-run**: `--dry-run` imprime el plan por fases (units/members/projects/tasks a crear) sin ejecutar ningún comando de escritura; `--apply` ejecuta y emite resumen `{units: {created, skipped}, members: {...}, projects: {...}, tasks: {...}}`. Sin flags → muestra ayuda.
- **Funciones puras exportadas** (testeables): `sanitizeDescription`, `parseDate`, `mapPriority`, `normalizeName`, `findMemberId`, `pickDue`, `planUnits`, `planMembers`, `planProjects`, `planTasks`, `buildTaskArgs`. La orquestación (`cli()`) queda delgada.
- **Cross-platform**: `spawnSync(process.execPath, …)`, `path.join/resolve`, ESM (`type: module` en package.json root). Sin dependencias nuevas.
- No se modifica `shared/` ni `opencode.json`.

## TDD Flow

1. **Write tests → FAIL** (`tests/scripts/mytasks-import.test.js`, importa el script que aún no existe):
   - `sanitizeDescription('<span>Texto</span><br>línea&#58;dos')` → `'Texto línea: dos'`; sin HTML → igual; truncado a 500.
   - `parseDate('20/03/2026')` → `'2026-03-20'`; `''` → `null`; inválido → `null`.
   - `mapPriority('Crítico')/('Alto')/('Media')/('Baja')` → `high/high/med/low`; desconocido → `med`.
   - `normalizeName('David Giménez')` → `'david gimenez'`; `findMemberId(nombre, members)` con exacto y fallback apellido.
   - `pickDue(inicio, fin)` → `fin` o `inicio` o `null`.
   - `planUnits(groups)` → lista plana de unidades; `planMembers(participants, groups)` → miembros con email/phone/unitId y dedupe por email; `planProjects(items)` → categorías únicas.
   - `planTasks(items, ctx)` / `buildTaskArgs(item, ctx)` → args CLI esperados (type, priority, due, project, assigned-to, requested-by, tags, description saneada).
   - Fixtures pequeños inline (1 proyecto + 1 requerimiento + 2 participantes) en el test.
2. **Implement → PASS**: crear `mytasks-import.js` con las funciones puras + orquestación; actualizar `AGENTS.md`.
3. **Refactor → still PASS**: re-ejecutar tests y `npm test`.

## Verification

- [ ] `node --test tests/scripts/mytasks-import.test.js` → verde (TDD).
- [ ] `node .opencode/scripts/mytasks-import.js --dry-run` muestra el plan sin escribir.
- [ ] `node .opencode/scripts/mytasks-import.js --apply` ejecuta y reporta resumen.
- [ ] Verificar con el CLI: `unit list --json`, `member list --json`, `project list --json`, `task list --all --json` (64 tareas nuevas, prioridades/due/assignments correctos).
- [ ] Re-ejecutar `--apply` → todo `skipped` (idempotente).
- [ ] `npm test` no introduce fallos nuevos (los 553 pre-existentes de CRLF se ignoran; los artefactos nuevos cumplen schema).
- [ ] `AGENTS.md` documenta `mytasks-import.js`.
- [ ] Preguntar al usuario si desea commit + push.
