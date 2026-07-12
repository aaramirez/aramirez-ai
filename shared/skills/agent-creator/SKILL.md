---
name: agent-creator
description: Create primary agent definitions with custom prompts, permissions, and model overrides.
license: MIT
scripts:
  - create-agent.js
  - create-base.js
---

# Agent Creator

Crea definiciones de agentes primarios para opencode. Los agentes primarios son los que se ciclan con Tab en la interfaz — cada uno tiene su propio prompt, permisos y configuración de modelo.

## Agentes primarios vs subagentes

| | Agente primario | Subagente |
|--|----------------|-----------|
| **Selección** | Tab-cycling en la UI | Auto-invocado o @-mencionado |
| **Modo** | `primary` | `subagent` |
| **Permisos** | Completo (configurable) | Restringido por diseño |
| **Propósito** | Flujo de trabajo principal | Tareas especializadas |

## Campos YAML frontmatter

```yaml
---
description: Descripción del agente
mode: primary
model: opencode/big-pickle     # opcional, override del modelo default
temperature: 0.3               # opcional
color: "#4A90D9"                # opcional, color del tema
permission:
  edit: allow
  bash: allow
  read: allow
---
```

## Config JSON vs Markdown

Los agentes se definen en archivos `.md` individuales dentro de `.opencode/agents/` y se registran en `opencode.json`:

```json
{
  "agents": {
    "build": {
      "path": ".opencode/agents/build.md",
      "description": "Primary builder agent"
    }
  }
}
```

Los prompts pueden referenciar archivos externos con la sintaxis `{file:ruta}`:

```yaml
---
prompt: {file:.opencode/prompts/build-prompt.md}
---
```

## Script de referencia

```bash
node shared/scripts/create-agent.js --name orchestrator --description "Main orchestrator" --output ./.opencode/agents/orchestrator.md
```

### Opciones

| Flag | Descripción | Default |
|------|-------------|---------|
| `--name <name>` | Nombre del agente (requerido) | — |
| `--description <desc>` | Descripción (requerido) | — |
| `--mode <mode>` | `primary` o `all` | `primary` |
| `--model <name>` | Modelo específico | — |
| `--temperature <n>` | Temperatura del modelo | `0.3` |
| `--prompt <text>` | Prompt del sistema | — |
| `--color <color>` | Color del tema | — |
| `--edit <perm>` | `allow`, `ask`, `deny` | `allow` |
| `--bash <perm>` | `allow`, `ask`, `deny` | `allow` |
| `--read <perm>` | `allow`, `ask`, `deny` | `allow` |
| `--output <file>` | Archivo de salida (requerido) | — |
| `--dry-run` | Vista previa sin escribir | — |

## Ejemplo de uso

```bash
# Crear agente auditor con permisos restrictivos
node shared/scripts/create-agent.js \
  --name auditor \
  --description "Auditor de código y seguridad" \
  --mode primary \
  --edit deny \
  --bash deny \
  --read allow \
  --color "#E74C3C" \
  --temperature 0.2 \
  --output ./.opencode/agents/auditor.md

# Registrar en opencode.json
# Añadir: "auditor": { "path": ".opencode/agents/auditor.md", "description": "Auditor de código y seguridad" }
```
