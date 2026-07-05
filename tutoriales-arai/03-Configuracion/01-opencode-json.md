---
tags:
  - configuracion
  - opencode-json
created: 2026-07-05
---

# opencode.json a fondo

## Estructura general

```json
{
  "model": "opencode/big-pickle",
  "small_model": "opencode/big-pickle",
  "shell": { "command": "zsh" },
  "formatter": { "command": "prettier" },
  "lsp": { "language_server": "typescript-language-server" },
  "compaction": { "auto": true, "prune": false, "reserved_tokens_min": 12000 },
  "tool_output": { "max_characters": 80000, "max_tool_output": 50000 },
  "snapshot": { "enabled": true, "paths": ["src/"] },
  "permission": { ... },
  "agents": { ... },
  "mcp_servers": { ... },
  "commands": { ... },
  "plugins": { ... },
  "references": { ... },
  "instructions": ["AGENTS.md"]
}
```

## Campos principales

| Campo | Descripción |
|-------|-------------|
| `model` | Modelo principal del agente default |
| `small_model` | Modelo para tareas livianas (subagentes) |
| `shell` | Shell y flags para comandos bash |
| `formatter` | Formateador de código |
| `lsp` | Servidor de lenguaje para autocompletado |
| `compaction` | Estrategia de compresión de contexto |
| `tool_output` | Límites de salida de herramientas |
| `permission` | Permisos globales y por agente |
| `agents` | Definición de agentes |
| `mcp_servers` | Configuración de servidores MCP |
| `commands` | Comandos personalizados |
| `plugins` | Extensiones del runtime |
| `references` | Rutas compartidas a scripts/reglas/prompts |
| `instructions` | Archivos de instrucciones (AGENTS.md) |

## Estrategia de configuración

Anthropic recomienda: **empieza permisivo, ajusta lo que necesites**. No gates todo desde el inicio — deja que el flujo de trabajo revele qué necesita restricciones.

## Generar desde arai

```bash
# Generar configuración base
node shared/scripts/create-config.js --model opencode/big-pickle

# Con permisos específicos
node shared/scripts/create-config.js --model opencode/big-pickle --permissions balanced
```

---

**Siguiente**: [[03-Configuracion/02-permisos.md|Modelo de permisos]]
