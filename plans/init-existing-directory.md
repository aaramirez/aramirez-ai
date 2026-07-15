# arai init — Soporte para directorios existentes

## Objective

Hacer que `arai init <proyecto> --template full` funcione en directorios existentes (no vacíos), añadiendo la configuración arai sin tocar los archivos del usuario.

## Requirements

1. `arai init` debe detectar si el directorio ya existe y tiene contenido — prioridad: **high**
2. Los archivos del usuario (`src/`, `README.md`, etc.) **nunca** deben ser modificados o eliminados — prioridad: **high**
3. `package.json` existente debe ser **fusionado** (preservar dependencias, scripts, version) — prioridad: **high**
4. `.gitignore` existente debe ser **fusionado** (append + dedup, no sobrescribir) — prioridad: **high**
5. `repos.json` existente debe ser **preservado** (no sobrescribir) — prioridad: **medium**
6. `assets/` existentes deben ser **preservados** (no sobrescribir logos custom) — prioridad: **medium**
7. `opencode.json`, `AGENTS.md`, `.opencode/**` deben ser **sobrescritos** (son arai-managed) — prioridad: **high**
8. El comportamiento para directorios nuevos/no-existentes **no debe cambiar** — prioridad: **high**
9. `--template minimal` también debe funcionar en directorios existentes — prioridad: **medium**
10. Re-init (ejecutar init dos veces) debe ser idempotente — prioridad: **medium**

## Architecture

### Estrategia: Detect-and-Adapt (modo aditivo)

No se necesita flag `--force`. El comando detecta automáticamente si el directorio tiene contenido y cambia a "modo aditivo".

**Rationale**: La intención del usuario con `arai init my-project` es siempre "configurar arai en este proyecto". Un flag añadiría fricción innecesaria. Ya existe un patrón similar en `installPlatform()` que detecta si opencode ya está instalado.

### Estrategia de conflicto por archivo

| Archivo | Estrategia | Razón |
|---------|-----------|-------|
| `.opencode/**` (skills, scripts, agents, commands) | **Sobrescribir** | Son arai-managed |
| `.opencode/package.json` | **Merge** | Ya manejado por `ensureOpenCodePackageJson()` |
| `opencode.json` | **Sobrescribir** | Es LA config de arai |
| `AGENTS.md` | **Sobrescribir** | Auto-generated, no es del usuario |
| `.gitignore` | **Merge** (append + dedup) | Archivo del usuario, preservar |
| `package.json` | **Merge** (agregar campos arai, preservar campos usuario) | CRITICAL — usuario puede tener deps |
| `repos.json` | **Skip si existe** | Usuario puede haber editado |
| `assets/**` | **Skip archivos existentes** | Usuario puede tener assets custom |
| `transforms/` | **Skip si existe** | Solo un `.gitkeep` |
| Archivos del usuario (`src/`, `lib/`, etc.) | **Nunca tocar** | No están en la lista de scaffold |

### Funciones helper nuevas en `scaffold.js`

1. **`appendGitignore(targetPath, newContent)`** — Fusiona líneas de .gitignore sin duplicar
2. **`mergePackageJson(targetPath, templateVars)`** — Fusiona campos arai en package.json existente

## File Changes

### Modificar: `shared/scripts/lib/scaffold.js`

**A. Añadir función `appendGitignore()`** (antes de `scaffoldProject`):
- Lee el `.gitignore` existente
- Parsea líneas existentes en un Set
- Agrega solo líneas nuevas del template
- Escribe el resultado

**B. Añadir función `mergePackageJson()`** (antes de `scaffoldProject`):
- Lee `package.json` existente
- Fusiona: `name` (solo si falta), `type: "module"` (forzar), `engines` (merge), `scripts` (add sin overwrite)
- Si JSON inválido → sobrescribe con warning

**C. Reemplazar guard de directorio no-vacío** (líneas 25-28):
```js
// ANTES:
if (existsSync(absTarget) && readdirSync(absTarget).length > 0) {
  log(`Directory ${absTarget} already exists and is not empty`, 'err');
  return false;
}

// DESPUÉS:
const isExistingProject = existsSync(absTarget) && readdirSync(absTarget).length > 0;
if (isExistingProject) {
  log(`Existing project detected — adding arai configuration to ${absTarget}`, 'info');
}
```

**D. Modificar escritura de `.gitignore`** (líneas 33-36):
- Usar `appendGitignore()` en vez de `writeFileSync()` directo

**E. Modificar escritura de `package.json`** (líneas 136-141):
- Si `isExistingProject` → usar `mergePackageJson()`
- Si no → comportamiento actual

**F. Modificar escritura de `repos.json`** (líneas 143-148):
- Si `isExistingProject && existsSync(repos.json)` → skip con log
- Si no → comportamiento actual

**G. Modificar escritura de `assets/`** (líneas 162-188):
- Para cada archivo de asset: si `isExistingProject && existsSync(dst)` → skip con log
- Si no → comportamiento actual

**H. Añadir log de resumen** (antes del "Done"):
```js
if (isExistingProject) {
  log('Existing project files preserved — only arai configuration added/updated', 'info');
}
```

### Modificar: `tests/commands/init.test.js`

- Cambiar test "fails gracefully if directory already exists and is not empty" → "succeeds on existing non-empty directory"
- Añadir ~9 tests nuevos para comportamiento aditivo

### Modificar: `tests/commands/init-harness.test.js`

- Añadir `describe` block "arai init — existing project (additive mode)" con ~4 tests

### No modificar: `bin/arai.js`

No se necesitan cambios en el CLI. El `scaffoldProject()` maneja todo internamente.

## TDD Flow

1. **Escribir tests** → FALLAN (el guard actual rechaza directorios no-vacíos)
2. **Implementar** → PASAN (guard eliminado + helpers de merge)
3. **Refactorizar** → siguen PASANDO

### Tests a escribir (antes de implementar):

```js
// init.test.js — tests que FALLAN con el código actual:
1. 'succeeds on existing non-empty directory (additive mode)'
2. 'merges .gitignore on existing directory'
3. 'merges package.json on existing directory'
4. 'skips repos.json if it already exists'
5. 'does not overwrite existing assets'
6. 'overwrites opencode.json (arai-managed)'
7. 'overwrites AGENTS.md (auto-generated)'
8. 'preserves arbitrary user directories'
9. 'sets type:module even when existing package.json has no type'

// init-harness.test.js — tests que FALLAN:
10. 'full template creates all .opencode/ dirs on existing project'
11. 'existing user files are not deleted'
12. 'opencode.json is correct after init on existing project'
13. 'AGENTS.md references .opencode/skills (not shared/skills)'
```

## Verification

- [ ] `node --test tests/commands/init.test.js` — todos los tests pasan
- [ ] `node --test tests/commands/init-harness.test.js` — todos los tests pasan
- [ ] `node --test` — suite completa pasa (no hay regressions)
- [ ] Smoke test fresh dir: `mkdir /tmp/test-fresh && arai init /tmp/test-fresh --template full`
- [ ] Smoke test existing dir: crear dir con src/ + package.json, ejecutar init, verificar archivos preservados
- [ ] Re-init idempotente: ejecutar init dos veces, verificar sin duplicados en .gitignore
- [ ] Cross-platform: Node.js only, zero shell dependencies (ya garantizado por la arquitectura existente)
