---
name: mytasks
description: Manage mytasks tasks via the CLI (list, create, update, follow-ups, notes). Use when the user mentions mytasks, tasks, follow-ups, notes, or asks to list/create/modify tasks.
license: MIT
---

# mytasks — Gestión de tareas

Skill para operar el CLI de **mytasks** (`../mytasks`, base de datos SQLite compartida con la app desktop). No hay API HTTP; todo se hace por CLI con salida JSON.

## Invocación

Siempre usar el wrapper, nunca llamar el CLI directamente con rutas quemadas:

```sh
node .opencode/scripts/mytasks.js <command> [args] [options]
```

- El wrapper resuelve el repo vía `MYTASKS_REPO` o por defecto `../mytasks` relativo al repo root.
- **Siempre pasar `--json`**: cada comando imprime exactamente un objeto JSON y usa el exit code 0/1.
- No usar el prefijo `task` (es el nombre del binario). Al invocar con `node`, los comandos top-level son: `list`, `create`, `show`, `update`, `done`, `delete`, `tags`, `suggest`, `member`, `followup`, `note`, `project`, `unit`.
- Si `packages/cli/dist/index.js` no existe, ejecutar `npm run build` en el repo de mytasks.

## Envelope JSON y exit codes

```jsonc
// éxito — exit 0
{"ok": true, "data": <payload>}

// fallo — exit 1
{"ok": false, "error": {"code": "<ErrorClassName>", "message": "<mensaje>"}}
```

`error.code` comunes: `TaskNotFoundError`, `MemberNotFoundError`, `FollowupNotFoundError`, `ProjectNotFoundError`, `UnitNotFoundError`, o `Error` con el mensaje de restricción de SQLite (status/priority/type inválidos, nombre/email duplicado).

## Enums

- `status`: `backlog` | `todo` | `in_progress` | `blocked` | `done` (default en create: `todo`)
- `priority`: `low` | `med` | `high` (default: `med`)
- `type`: `requirement` | `project` (default: `requirement`) — **no** es lo mismo que el `project` de agrupación

## Normalización y warnings

- `--tags` es un único valor separado por comas (`--tags bug,urgent`); los tags se comparan case-insensitive.
- `--project`, `--assigned-to`, `--unit` y `--contact` toman **ids numéricos, nunca nombres**. Resolver antes: `project list`, `member list`, `unit list` (todos `--json`).
- **`list` oculta las tareas `done` por defecto** — usar `--all` para incluirlas.
- **`delete` es inmediato e irreversible** — no hay confirmación ni undo.
- `--status`/`--tag`/`--priority` en `list` aceptan listas separadas por comas.
- `--tags` en `update` **reemplaza** todo el conjunto de tags.
- En `update` pasar `none` para limpiar `--project`/`--assigned-to`/`--requested-by`.
- `type` y `project` son campos no relacionados que comparten palabra.

## Cheat-sheet de comandos

| Operación | Comando |
|-----------|---------|
| Listar tareas (filtros: `--status`, `--project`, `--tag`, `--priority`, `--search`, `--due-before/after`, `--sort`, `--all`) | `list --json` |
| Crear tarea (`--title` posicional, `--description`, `--project <id>`, `--priority`, `--type`, `--due`, `--tags`, `--assigned-to`, `--requested-by`) | `create "<título>" [opciones] --json` |
| Ver tarea | `show <id> --json` |
| Modificar (solo cambia campos pasados) | `update <id> [opciones] --json` |
| Marcar hecha | `done <id> --json` |
| Tags en uso | `tags --json` |
| Tareas que necesitan atención | `suggest --json` |
| Crear follow-up | `followup create <taskId> --date YYYY-MM-DD [--note "<texto>"] --json` |
| Cerrar follow-up | `followup done <followupId> --json` |
| Listar follow-ups (historial de una tarea, o pendientes globales sin id) | `followup list [<taskId>] --json` |
| Añadir nota | `note create <taskId> --text "<contenido>" --json` |
| Listar notas de una tarea (más recientes primero) | `note list <taskId> --json` |

## Ejemplo de flujo

```sh
# Resolver ids antes de asignar
node .opencode/scripts/mytasks.js project list --json
node .opencode/scripts/mytasks.js member list --json

# Crear tarea
node .opencode/scripts/mytasks.js create "Fix login bug" --project 3 --priority high --due 2026-08-01 --tags bug,urgent --assigned-to 1 --json

# Follow-up y nota
node .opencode/scripts/mytasks.js followup create 7 --date 2026-08-05 --note "Revisar avance" --json
node .opencode/scripts/mytasks.js note create 7 --text "Conversado con el equipo" --json
```

Para operaciones específicas, usar los comandos opencode `/mytasks-list`, `/mytasks-create`, `/mytasks-update`, `/mytasks-followup` y `/mytasks-note`.
