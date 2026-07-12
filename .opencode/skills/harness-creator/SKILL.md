---
name: harness-creator
description: Orchestrate the full harness creation process — interactively generate a complete opencode configuration based on project description.
license: MIT
---

# Harness Creator

Skill orquestrador principal para generar configuraciones completas de opencode. Guía al usuario paso a paso para describir su proyecto y produce un harness funcional.

## Proceso

1. **Describe el proyecto** — Pregunta al usuario sobre el tipo de proyecto, lenguaje, stack, y agentes necesarios. Sigue el principio "propón, no interrogues": ofrece opciones concretas.
2. **Propone configuración** — Basado en la descripción, sugiere:
   - Modelo base y pequeño
   - Agentes primarios y subagentes
   - Reglas de permisos
   - Instrucciones del proyecto (AGENTS.md)
   - Skills relevantes
3. **Delega a sub-skills** — Invoca los skills especializados según corresponda:
   - `config-creator` → archivo opencode.json base
   - `agent-creator` → agentes primarios
   - `subagent-creator` → subagentes
   - `permission-creator` → reglas de permisos
   - `instructions-creator` → AGENTS.md
4. **Genera el harness** — Ejecuta el script para producir los archivos finales.

## Script de referencia

```bash
node shared/scripts/harness-generator.js --project ./project.json --output ./my-harness/
```

### Opciones

| Flag | Descripción |
|------|-------------|
| `--project <json>` | Ruta al archivo JSON con la descripción del proyecto |
| `--output <dir>` | Directorio de salida (default: ./harness-output) |
| `--dry-run` | Muestra los archivos sin escribirlos |
| `--help` | Muestra la ayuda |

### Ejemplo de project.json

```json
{
  "name": "mi-app",
  "type": "web",
  "language": "typescript",
  "description": "Aplicación web React con Node.js backend",
  "agents": ["build", "plan", "reviewer", "tester"],
  "skills": ["git", "code-review", "document-generation"],
  "model": "opencode/big-pickle",
  "smallModel": "anthropic/claude-haiku-4-5"
}
```

## Ejemplo de uso

```bash
# 1. Crear archivo de descripción
cat > project.json << 'EOF'
{
  "name": "ecommerce-api",
  "type": "api",
  "language": "typescript",
  "description": "API REST para plataforma e-commerce",
  "agents": ["build", "plan", "reviewer", "tester", "docs"],
  "skills": ["git", "code-review"],
  "model": "opencode/big-pickle"
}
EOF

# 2. Generar harness completo
node shared/scripts/harness-generator.js --project ./project.json --output ./ecommerce-harness/

# 3. Revisar la salida
ls -la ./ecommerce-harness/
```

## Skills relacionados

- [config-creator](../config-creator/SKILL.md) — Configuración base de opencode.json
- [agent-creator](../agent-creator/SKILL.md) — Agentes primarios
- [subagent-creator](../subagent-creator/SKILL.md) — Subagentes especializados
- [permission-creator](../permission-creator/SKILL.md) — Reglas de permisos
- [instructions-creator](../instructions-creator/SKILL.md) — AGENTS.md del proyecto
