---
name: config-creator
description: Create base opencode.json configuration with model, shell, compaction, and runtime settings.
license: MIT
scripts:
  - create-config.js
  - create-base.js
---

# Config Creator

Crea la configuración base de opencode.json con las opciones fundamentales del agente: modelo, shell, formato, LSP y compactación.

## Estructura de opencode.json

El archivo `opencode.json` soporta múltiples capas de configuración que se fusionan en orden de precedencia:

| Capa | Prioridad | Descripción |
|------|-----------|-------------|
| Remota | Baja | Configuraciones del repositorio remoto |
| Global | Media | `~/.config/opencode/opencode.json` |
| Custom | Alta | `.opencode/opencode.json` local |
| Proyecto | Máxima | `opencode.json` en la raíz del proyecto |

## Campos principales

| Campo | Descripción |
|-------|-------------|
| `model` | Modelo principal del agente por defecto |
| `smallModel` | Modelo pequeño para tareas ligeras |
| `shell` | Shell a usar para comandos bash |
| `formatter` | Habilitar formateo automático de código |
| `lsp` | Habilitar servidores de lenguaje LSP |
| `autoCompact` | Compactación automática del historial |
| `tailTurns` | Turns a mantener tras compactación |
| `instructions` | Array de instrucciones del proyecto |

## Script de referencia

```bash
node .opencode/scripts/create-config.js --model opencode/big-pickle --output ./opencode.json
```

### Opciones

| Flag | Descripción | Default |
|------|-------------|---------|
| `--model <name>` | Modelo principal | `opencode/big-pickle` |
| `--small-model <name>` | Modelo pequeño | `anthropic/claude-haiku-4-5` |
| `--shell <path>` | Shell del sistema | `/bin/zsh` |
| `--default-agent <name>` | Agente por defecto | `build` |
| `--formatter` | Habilitar formateo | `true` |
| `--lsp` | Habilitar LSP | `true` |
| `--auto-compact` | Compactación automática | `true` |
| `--tail-turns <n>` | Turns a conservar | `10` |
| `--output <file>` | Archivo de salida | `./opencode.json` |
| `--dry-run` | Vista previa sin escribir | — |

## Ejemplo de uso

```bash
# Generar configuración básica
node .opencode/scripts/create-config.js \
  --model opencode/big-pickle \
  --small-model anthropic/claude-haiku-4-5 \
  --shell /bin/zsh \
  --default-agent build \
  --formatter \
  --lsp \
  --auto-compact \
  --tail-turns 10 \
  --output ./opencode.json

# Vista previa
node .opencode/scripts/create-config.js --dry-run
```
