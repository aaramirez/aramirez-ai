---
tags:
  - ci
  - docgen
created: 2026-07-05
---

# DocGen Validate

## Descripción

Valida el pipeline de documentación: verifica que los specs JSON/MD, templates y builders estén correctos.

## Uso

```bash
# Validación completa
node shared/scripts/docgen/validate.js

# Validación rápida (solo sintaxis + templates)
node shared/scripts/docgen/validate.js --quick
```

## Qué verifica

- Archivos spec JSON: sintaxis, campos requeridos, tipos
- Archivos spec MD: frontmatter, formato
- Templates: todos los layouts y secciones
- Builders: exports de funciones requeridas
- Charts: tipos de gráficos soportados

## Integración en CI

```bash
npm run docgen:validate
```

---

**Siguiente**: [[10-CI/04-outcome-validation.md|Outcome Validation]]
