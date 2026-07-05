---
tags:
  - referencias
  - references
created: 2026-07-05
---

# Referencias compartidas

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
node shared/scripts/create-reference.js --name scripts --path shared/scripts --description "Scripts reutilizables"
```

## Skill asociada

`reference-creator` guía la creación de referencias desde un agente de opencode.

---

**Siguiente**: [[08-Referencias/03-branding.md|Branding]]
