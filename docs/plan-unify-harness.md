# Plan: Unificar fuente de verdad — eliminar `platforms/`

## Contexto

aramirez-ai es un **opencode harness que genera nuevos opencode harnesses**. Actualmente tiene tres capas que se solapan:

| Capa | Ruta | Propósito |
|------|------|-----------|
| Runtime | `.opencode/` + `opencode.json` | Lo que opencode lee al ejecutar |
| Template | `platforms/opencode/` | Lo que `arai install` copia a proyectos destino |
| Componentes | `shared/` | Skills, scripts, prompts, rules reutilizables |

Esto causa:
- **Drift**: `platforms/opencode/opencode.json` tiene 1 command + 3 MCP servers que el root no tiene
- **Duplicación**: 4 agents idénticos en `platforms/opencode/agents/` y `.opencode/agents/`
- **Confusión**: 30 skills en `.opencode/skills/` son redundantes (opencode ya carga desde `../shared/skills`)
- **Inconsistencia**: `arai generate command` crea en `platforms/opencode/commands/` pero el runtime es `.opencode/commands/`

## Principio

**Este repo ES el harness.** `.opencode/` + root `opencode.json` son la fuente de verdad. `arai install` copia desde ESTE repo, no desde un directorio paralelo.

## Estructura resultante

```
aramirez-ai/
├── .opencode/              ← FUENTE DE VERDAD (agents, commands, plugins, tui)
│   ├── agents/
│   ├── commands/
│   ├── plugins/
│   └── tui.json
├── opencode.json           ← FUENTE DE VERDAD (config completa para este repo)
├── shared/                 ← BIBLIOTECA DE INSTALACIÓN (componentes para otros proyectos)
│   ├── skills/             ← 30 skills (source of truth para instalación)
│   ├── scripts/
│   ├── prompts/
│   ├── rules/
│   ├── agents/
│   └── templates/
├── bin/arai.js
└── ...
```

**Flujo:**
1. aramirez-ai carga skills desde `shared/skills/` vía `opencode.json` paths
2. `arai install` en destino → copia `.opencode/` + `opencode.json` de ESTE repo
3. `arai install <skill>` → copia desde `shared/skills/` al destino

---

## Pasos de implementación

### Paso 1: Reconciliar `opencode.json` root

Fusionar lo que falta de `platforms/opencode/opencode.json` al root:

- [ ] Agregar command `email` (description + template)
- [ ] Agregar MCP server `email` (node shared/scripts/mcp-email.js, disabled)
- [ ] Agregar MCP server `google-workspace` (npx @google/mcp-workspace, disabled)
- [ ] Agregar MCP server `m365` (npx @softeria/ms-365-mcp-server, disabled)
- [ ] Corregir descripción de `plan-arai`: "Clona Plan, edita solo docs/" → "Modo de Planificación de arai, edita solo docs/"

**Archivo:** `opencode.json`

### Paso 2: Actualizar `install.js`

Cambiar `installPlatform()` para leer desde root + `.opencode/` en vez de `platforms/opencode/`:

```diff
- const source = join(REPO_ROOT, 'platforms', 'opencode');
+ // Root IS the source — this repo IS the harness
+ const dotOpenCodeSrc = join(REPO_ROOT, '.opencode');
```

Cambios específicos:
- [ ] `installPlatform()`: copiar agents desde `.opencode/agents/`
- [ ] `installPlatform()`: copiar commands desde `.opencode/commands/`
- [ ] `installPlatform()`: copiar `opencode.json` desde root
- [ ] `installAgent()`: eliminar fallback `shared/agents/` → `platforms/opencode/agents/`, buscar en `.opencode/agents/`

**Archivo:** `shared/scripts/lib/install.js`

### Paso 3: Actualizar `sync.js`

Cambiar `syncProject()` para leer desde root + `.opencode/`:

```diff
- const source = join(REPO_ROOT, 'platforms', 'opencode');
+ const source = REPO_ROOT;
+ const dotOpenCodeSrc = join(REPO_ROOT, '.opencode');
```

- [ ] `syncProject()`: sync agents desde `.opencode/agents/`
- [ ] `syncProject()`: sync commands desde `.opencode/commands/`
- [ ] `syncProject()`: sync config desde root `opencode.json`

**Archivo:** `shared/scripts/lib/sync.js`

### Paso 4: Eliminar `.opencode/skills/` duplicadas

El `opencode.json` ya carga skills desde `../shared/skills`. Las 30 copias en `.opencode/skills/` son redundantes.

- [ ] Eliminar directorio `.opencode/skills/`
- [ ] Verificar que `opencode.json` paths sigue funcionando (`.opencode/skills` + `../shared/skills`)
- [ ] Opcionalmente agregar `.gitignore` para `.opencode/skills/` si se quiere prevenir recreación accidental

**Archivos:** `.opencode/skills/`, `.gitignore`

### Paso 5: Actualizar `bin/arai.js`

- [ ] `generate command`: crear en `.opencode/commands/` (no `platforms/opencode/commands/`)
- [ ] Eliminar cualquier referencia a `platforms/` en generate commands

**Archivo:** `bin/arai.js`

### Paso 6: Eliminar `platforms/` completo

- [ ] `rm -rf platforms/`
- [ ] Actualizar `.gitignore` si tiene alguna referencia a `platforms/`
- [ ] Verificar que ningún otro script referencia `platforms/`

**Directorio:** `platforms/`

### Paso 7: Actualizar documentación

- [ ] `AGENTS.md`: eliminar menciones a `platforms/`, actualizar estructura de directorios
- [ ] `README.md`: si menciona `platforms/`, actualizar
- [ ] `package.json`: si tiene scripts que referencian `platforms/`

**Archivos:** `AGENTS.md`, `README.md`, `package.json`

### Paso 8: Actualizar tests

- [ ] Verificar que tests de consistencia no validan existencia de `platforms/`
- [ ] Actualizar cualquier test que referencie `platforms/opencode/`
- [ ] Ejecutar `npm test` para validar

**Directorio:** `tests/`

---

## Verificación

1. `node bin/arai.js install` en un directorio temporal → debe crear `.opencode/` + `opencode.json` correctos
2. `npm test` → todos los tests pasan
3. `node -e "import('./shared/scripts/lib/install.js')"` → sin errores de import
4. Verificar que `opencode.json` tiene todos los agents, commands y MCP servers
5. Verificar que no existe `platforms/`

## Riesgos

- **Bajo**: El cambio es mayormente reorganización de rutas. La lógica de copia no cambia, solo la fuente.
- **Medio**: Si hay proyectos destino que ya instalaron con `platforms/opencode/`, el `arai sync` de estos proyectos seguirá funcionando (no dependen de `platforms/` en el repo origen después de la instalación).
