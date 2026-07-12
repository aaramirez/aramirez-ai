# Plan: Eliminar referencias restantes a `platforms/opencode`

## Archivos a modificar (3 archivos activos)

### 1. `README.md` — 4 referencias (líneas 37, 42-44)

**Línea 37** — actualizar descripción de estructura:
```diff
- La estructura de aramirez-ai (`shared/skills/`, `platforms/opencode/`) es interna al generador.
+ La estructura de aramirez-ai (`shared/skills/`, `.opencode/`) es interna al generador.
```

**Líneas 42-44** — actualizar tabla de mapeo:
```diff
- | Agents | `platforms/opencode/agents/<name>.md` | `.opencode/agents/<name>.md` |
- | Commands | `platforms/opencode/commands/<name>.md` | `.opencode/commands/<name>.md` |
- | Config | `platforms/opencode/opencode.json` | `opencode.json` (raíz) |
+ | Agents | `.opencode/agents/<name>.md` | `.opencode/agents/<name>.md` |
+ | Commands | `.opencode/commands/<name>.md` | `.opencode/commands/<name>.md` |
+ | Config | `opencode.json` (raíz) | `opencode.json` (raíz) |
```

### 2. `tutoriales-arai/02-Comandos/03-sync.md` — 1 referencia (línea 33)

**Línea 33** — actualizar ruta de ejemplo:
```diff
- 2. Modificar un agente en el repositorio fuente (`platforms/opencode/agents/<nombre>.md`)
+ 2. Modificar un agente en el repositorio fuente (`.opencode/agents/<nombre>.md`)
```

### 3. `tests/commands/init-harness.test.js` — 1 referencia (línea 36)

**Línea 36** — actualizar descripción del test (la aserción `!existsSync` ya es correcta):
```diff
- test('NO existe platforms/opencode/', () => {
+ test('NO existe platforms/ en el harness generado', () => {
```

## Verificación

```bash
grep -r "platforms/opencode" --include="*.js" --include="*.md" --include="*.json" --include="*.ts" --include="*.tsx" .
```

Debe retornar solo matches en `docs/` (archivos históricos) y cero en archivos activos.

## Riesgo

Ninguno. Solo se actualizan texto en docs, tutorial y descripción de test.
