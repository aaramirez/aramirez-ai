---
name: reference-creator
description: Create shared reference configurations for scripts, rules, and prompts across projects.
license: MIT
scripts:
  - create-reference.js
  - create-base.js
---

# Creación de referencias compartidas

Las referencias en `opencode.json` (clave `references`) permiten que los agentes accedan a assets compartidos desde directorios externos al proyecto.

## Clave `references`

```json
{
  "references": [
    {
      "name": "shared-scripts",
      "path": "../shared/scripts",
      "description": "Reusable automation scripts"
    }
  ]
}
```

## Resolución de rutas

- Las rutas pueden ser relativas al proyecto o absolutas.
- opencode resuelve las rutas y las expone a los agentes en tiempo de ejecución.
- Convención de nombres: usar kebab-case, descriptivo y único.

## Buenas prácticas

- Agrupar referencias por tipo (scripts, rules, prompts).
- Incluir una descripción clara para que el agente sepa cuándo usarla.
- No duplicar referencias que apunten al mismo directorio.

## Referencia

```bash
node shared/scripts/create-reference.js \
  --name shared-scripts \
  --path ../shared/scripts \
  --description "Reusable scripts" \
  --output ./reference.json
```
