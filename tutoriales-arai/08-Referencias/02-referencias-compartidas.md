---
tags:
  - referencias
  - references
created: 2026-07-05
---

# Referencias compartidas

> **Objetivo**: Configurar rutas globales a scripts, reglas y prompts compartidos entre múltiples proyectos de opencode.

**⏱ Tiempo estimado**: 4 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[08-Referencias/01-prompt-y-reglas.md|Prompts y reglas]]

## Resultado esperado

Poner referencias compartidas en `opencode.json` para que todos los proyectos de una organización usen las mismas reglas y scripts.

## ¿Qué son?

Las referencias (`references` en `opencode.json`) definen rutas compartidas a scripts, reglas y prompts que los agentes pueden usar.

## Configuración

```json
"references": [
  {
    "name": "scripts",
    "path": "shared/scripts"
  },
  {
    "name": "rules",
    "path": "shared/rules"
  },
  {
    "name": "prompts",
    "path": "shared/prompts"
  }
]
```

## Beneficios

- Los agentes conocen dónde encontrar recursos compartidos
- Centraliza la configuración de rutas
- Facilita la reutilización entre proyectos

## Crear una referencia

```bash
node .opencode/skills/reference-creator/scripts/create-reference.js --name scripts --path shared/scripts --description "Scripts reutilizables"
```

## Skill asociada

`reference-creator` guía la creación de referencias desde un agente de opencode.

---

**Siguiente**: [[08-Referencias/03-branding.md|Branding]]
