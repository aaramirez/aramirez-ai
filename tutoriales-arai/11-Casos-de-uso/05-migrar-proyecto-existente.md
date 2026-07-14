---
tags:
  - caso-de-uso
  - migracion
created: 2026-07-05
---

# Migrar un proyecto existente a opencode

## Objetivo

Agregar opencode + arai a un proyecto que ya existe (sin perder historial git ni configuración existente).

## Paso 1: Instalar opencode

```bash
cd mi-proyecto-existente
arai install
```

## Paso 2: Ver estado

```bash
arai status
```

Muestra qué se instaló y qué falta configurar.

## Paso 3: Configurar agentes

```bash
# Agente build (default para el proyecto)
node /path/to/arai/.opencode/skills/agent-creator/scripts/create-agent.js \
  --name build --mode primary --description "Agente de desarrollo"
```

## Paso 4: Agregar comandos del proyecto

```bash
node /path/to/arai/.opencode/skills/command-creator/scripts/create-command.js \
  --name build --template "npm run build"

node /path/to/arai/.opencode/skills/command-creator/scripts/create-command.js \
  --name lint --template "npm run lint"

node /path/to/arai/.opencode/skills/command-creator/scripts/create-command.js \
  --name test --template "npm test"
```

## Paso 5: Sincronizar

```bash
arai sync
```

## Paso 6: Commit

```bash
git add -A
git commit -m "feat: add opencode harness"
```

## Consideraciones

- `arai install` no modifica archivos existentes del proyecto
- Solo agrega `opencode.json`, `.opencode/`, y `shared/`
- Todo es configurable y reversible (`arai uninstall`)

---

**Volver**: [[11-Casos-de-uso/Index|Casos de uso]]
