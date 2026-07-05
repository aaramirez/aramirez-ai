---
tags:
  - agentes
  - primarios
created: 2026-07-05
---

# Agentes primarios

> **Objetivo**: Conocer los agentes primarios de opencode (build, plan) y cómo crear agentes personalizados con mode primary.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[03-Configuracion/01-opencode-json.md|opencode.json a fondo]]

## Resultado esperado

Entender la diferencia entre agentes primarios y subagentes, y saber cómo definir agentes primarios personalizados en `opencode.json`.

## ¿Qué es un agente primario?

Un agente primario (`mode: primary`) es un agente que aparece en la interfaz de opencode y se selecciona con **Tab**. Cada proyecto puede tener múltiples agentes primarios.

## Agente default (build)

El agente `build` es el predeterminado:

```json
"build": {
  "description": "Default agent for development"
}
```

Sin más configuración, usa el modelo global y tiene acceso completo.

## Agente plan

```json
"plan": {
  "mode": "primary",
  "description": "Planning agent for architecture and design",
  "permission": { "edit": "deny" }
}
```

## Agente plan-arai (solo docs/)

```json
"plan-arai": {
  "mode": "primary",
  "description": "Clona Plan, edita solo docs/",
  "path": ".opencode/agents/plan-arai.md",
  "permission": {
    "edit": { "glob": ["docs/**/*", "allow"], "glob": ["**/*", "deny"] }
  }
}
```

## Campos de un agente primario

| Campo | Descripción |
|-------|-------------|
| `mode` | `primary` o `subagent` |
| `description` | Texto visible en la UI |
| `model` | Modelo específico (opcional, hereda el global) |
| `path` | Ruta al archivo `.md` con el prompt del agente |
| `permission` | Permisos específicos (opcional, hereda global) |
| `temperature` | Temperatura del modelo (opcional) |
| `color` | Color en la UI (opcional, ej: "#ff6b6b") |
| `max_tokens` | Límite de tokens de respuesta (opcional) |
| `steps` | Pasos máximos del agente (opcional) |

## Crear un agente primario

```bash
node shared/scripts/create-agent.js --name mi-agent --mode primary --description "Hace X cosa"
```

Esto genera:
1. `.opencode/agents/mi-agent.md` con el prompt
2. Entrada en `opencode.json`

---

**Siguiente**: [[04-Agentes/02-subagentes.md|Subagentes]]
