# Configuración de agentes

## opencode.json

El archivo principal de configuración. Define modelos, agentes, comandos, permisos y tools.

```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "agent": {
    "build": { "mode": "primary" },
    "reviewer": { "mode": "subagent" }
  },
  "permission": {
    "bash": { "git *": "allow", "*": "ask" },
    "edit": "ask",
    "read": "allow"
  }
}
```

## Permisos

| Nivel | Significado |
|-------|-------------|
| `allow` | Ejecuta sin preguntar |
| `ask` | Pregunta antes de ejecutar |
| `deny` | Bloquea la acción |

La clave está en encontrar el balance: demasiados `allow` es riesgoso, demasiados `ask` hace lento el flujo.

## Skills

Las **skills** son instrucciones especializadas que se cargan según la tarea. Viven en `shared/skills/` en formato SKILL.md.

```yaml
---
name: git
description: Use for git operations
license: MIT
---
```

### ¿Cómo se cargan?

```json
{
  "skills": {
    "paths": [
      ".opencode/skills",
      "~/.config/opencode/skills"
    ]
  }
}
```

## Comandos personalizados

Puedes definir comandos slash para tareas frecuentes:

```json
{
  "command": {
    "test": {
      "description": "Run test suite",
      "template": "Run the test suite and report results."
    },
    "deploy": {
      "description": "Deploy project",
      "template": "Deploy the current project."
    },
    "commit": {
      "description": "Conventional commit",
      "template": "Create a conventional commit based on changes."
    }
  }
}
```

## MCP Servers

Configura servidores externos para extender capacidades:

```json
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp"],
      "enabled": false
    }
  }
}
```

## Herencia de configuración

```
Remote (.well-known/opencode)
  └── Global (~/.config/opencode/)
       └── Proyecto (opencode.json)
```

Cada nivel hereda y sobrescribe al anterior.

## Enlaces

- [[01-Que-es-un-agente|Anterior: ¿Qué es un agente?]]
- [[03-Planificacion-con-agentes|Siguiente: Planificación con agentes]]
- [[Módulo 1 — Fundamentos/03-Herramientas-y-MCP|MCP y herramientas]]
