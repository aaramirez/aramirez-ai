# Skills y comandos para gestionar tareas en mytasks

## Objective

Crear un skill `mytasks` y cinco comandos opencode (listar, crear, modificar, follow-ups, notas) en `.opencode/` para operar el CLI de `../mytasks`, documentados en `AGENTS.md` y sin tocar `shared/`.

## Requirements

1. Skill `mytasks` en `.opencode/skills/mytasks/SKILL.md` con la referencia completa del CLI (invocación, envelope JSON, exit codes, enums, normalización y warnings) — priority: high
2. Script wrapper cross-platform `.opencode/scripts/mytasks.js` (Node ESM, sin deps de shell) que resuelve el repo vía `MYTASKS_REPO` o `../mytasks` y hace passthrough de args, stdout/stderr y exit code — priority: high
3. Comando `mytasks-list` — listar tareas con filtros (`--status`, `--project`, `--tag`, `--priority`, `--search`, `--all`, `--sort`, etc.) — priority: high
4. Comando `mytasks-create` — crear tareas resolviendo ids de `project` y `member` antes de asignar — priority: high
5. Comando `mytasks-update` — modificar tareas (status, priority, due, project, tags, assigned-to, requested-by) — priority: high
6. Comando `mytasks-followup` — crear/cerrar/consultar follow-ups — priority: medium
7. Comando `mytasks-note` — añadir y consultar notas — priority: medium
8. Todos los comandos invocan con `--json` y reportan el resultado `{ok, data}` o el error `{ok, error}` — priority: high
9. Disponibilidad en `AGENTS.md`: tablas *Available skills*, *Available scripts* y nueva tabla *Available commands* — priority: medium
10. Solo `.opencode/`, nada en `shared/` — priority: high
11. Tests `node --test` que fallen antes de implementar (red-green-refactor) — priority: high

## Architecture

### Nota clave (corrección de invocación)

El `AGENTS.md` de mytasks documenta `task list`, `task create`, … pero `task` es el **nombre del binario** (`program.name('task')`). Al invocar con `node <cli>/dist/index.js` no se pasa el prefijo `task`; los comandos top-level son `list`, `create`, `show`, `update`, `done`, `delete`, `tags`, `suggest`, `member`, `followup`, `note`, `project`, `unit` (verificado: `node …/dist/index.js list --json` → `{"ok":true,"data":[…]}`).

### Files to create

```
.opencode/skills/mytasks/SKILL.md          # skill canónico con referencia del CLI
.opencode/scripts/mytasks.js               # wrapper (importable + CLI entry, guard import.meta.url)
.opencode/commands/mytasks-list.md         # comando: listar tareas
.opencode/commands/mytasks-create.md       # comando: crear tareas
.opencode/commands/mytasks-update.md       # comando: modificar tareas
.opencode/commands/mytasks-followup.md     # comando: follow-ups
.opencode/commands/mytasks-note.md         # comando: notas
tests/scripts/mytasks-wrapper.test.js      # tests unit/integración del wrapper
tests/consistency/mytasks-skill.test.js    # tests de estructura (skill, comandos, AGENTS.md)
```

### Files to modify

```
AGENTS.md   # + fila mytasks en Available skills, + fila mytasks.js en Available scripts, + tabla Available commands
```

### Decisions

- **Invocación canónica**: `node .opencode/scripts/mytasks.js <command> [args] --json` desde el repo root. Sin prefijo `task`.
- **Wrapper** (`.opencode/scripts/mytasks.js`, ESM como el resto de scripts):
  - `resolveMytasksRepo(env, repoRoot)`: devuelve `env.MYTASKS_REPO` o `path.resolve(repoRoot, '..', 'mytasks')`.
  - `buildCliPath(repo)`: `join(repo, 'packages', 'cli', 'dist', 'index.js')`.
  - `run(argv, env, repoRoot)`: si `dist/index.js` no existe → `{status:1, message}` con instrucción `npm run build`; si existe → `spawnSync(process.execPath, [cli, ...argv], {stdio:'inherit'})` y devuelve el exit code.
  - Funciones exportadas + guard `if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)` para que solo ejecute `main()` como CLI, permitiendo unit tests.
- **Un único skill `mytasks`** (patrón `lean`/`kb-management`): el skill es la referencia canónica; los comandos son accesos rápidos por operación. Contenido: invocación, envelope JSON y exit codes, enums (`status`, `priority`, `type`), normalización de tags/project/member/unit, warnings (delete irreversible, `list` oculta `done`, resolver ids), cheat-sheet de comandos y ejemplos con `--json`.
- **Frontmatter del skill** cumple el schema que valida `tests/harness/schema-validation.test.js`: `name: mytasks`, `description` (10–200 chars, con triggers "mytasks, task, followup, note, list, create, update"), `license: MIT`.
- **Comandos .md** en `.opencode/commands/` (patrón `kb.md`): frontmatter `description` + cuerpo = template con `$ARGUMENTS`. **No** se registran en `opencode.json` (evita duplicados; `kb.md` tampoco está ahí).
- **Cross-platform**: solo Node; `path.resolve`/`join` manejan rutas Windows y macOS; el wrapper usa `process.execPath` en vez de `node` del PATH.
- **No shared/**: skill, comandos y script viven únicamente en `.opencode/`.
- **Testabilidad**: el wrapper exporta funciones puras para unit tests; el test de integración invoca el wrapper como subproceso contra el CLI real (skip si `dist/` no existe).

## TDD Flow

1. **Write tests → FAIL** (los archivos aún no existen):
   - `tests/scripts/mytasks-wrapper.test.js`:
     - `resolveMytasksRepo({})` → `<repoRoot>/../mytasks`.
     - `resolveMytasksRepo({MYTASKS_REPO:'/x'})` → `/x`.
     - `run()` con `MYTASKS_REPO` apuntando a un dir sin `dist/index.js` → `status 1` y mensaje con "npm run build".
     - Integración: `spawnSync` del wrapper con `list --json` → exit 0 y stdout parseable `{ok:true}` (skip si no hay CLI).
   - `tests/consistency/mytasks-skill.test.js`:
     - `SKILL.md` existe con frontmatter `name: mytasks`, `description` no vacía, `license: MIT`.
     - Existen los 5 comandos `.opencode/commands/mytasks-*.md` con frontmatter `description`.
     - `AGENTS.md` menciona `mytasks` (skills), `.opencode/scripts/mytasks.js` (scripts) y los comandos.
2. **Implement → PASS**: crear wrapper, skill, comandos; actualizar `AGENTS.md`.
3. **Refactor → still PASS**: revisar nombres/flags y re-ejecutar `npm test`.

## Verification

- [ ] `npm test` (node --test) pasa completo, incluidos los tests existentes que escanean `.opencode/skills` (schema-validation, reference-integrity, creator-skills).
- [ ] `node .opencode/scripts/mytasks.js list --json` devuelve `{"ok":true,"data":[…]}`.
- [ ] `node .opencode/scripts/mytasks.js followup list --json` y `note list <taskId> --json` funcionan.
- [ ] Wrapper sin dist (env falso) falla con exit 1 y mensaje útil.
- [ ] `AGENTS.md` documenta el skill, el script y los comandos.
- [ ] Reiniciar opencode para cargar skill/comandos nuevos.
- [ ] Preguntar al usuario si desea commit + push.
