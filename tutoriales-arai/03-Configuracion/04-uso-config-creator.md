---
tags:
  - configuracion
  - config-creator
  - creator-scripts
created: 2026-07-05
---

# Usar config-creator

## Descripción

`create-config.js` genera un archivo `opencode.json` completo con la configuración base del proyecto.

## Uso

```bash
node shared/scripts/create-config.js --model opencode/big-pickle
```

## Opciones

| Flag | Descripción | Default |
|------|-------------|---------|
| `--model` | Modelo principal | `opencode/big-pickle` |
| `--small-model` | Modelo para tareas livianas | (usa el mismo) |
| `--shell` | Comando del shell | `zsh` (o `cmd` en Windows) |
| `--output` | Directorio de salida | `.` |
| `--dry-run` | Previsualizar sin escribir | — |

## Ejemplo con permisos

```bash
node shared/scripts/create-config.js \
  --model anthropic/claude-sonnet-4-6 \
  --small-model anthropic/claude-haiku-4-6 \
  --shell zsh \
  --output mi-proyecto/
```

## Skill asociada

La skill [[../../06-Skills/04-creator-skills.md|config-creator]] describe el uso desde un agente de opencode.

---

**Siguiente**: [[04-Agentes/Index|Arquitectura de agentes]]
