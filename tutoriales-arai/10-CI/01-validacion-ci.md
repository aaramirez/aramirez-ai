---
tags:
  - ci
  - validacion
created: 2026-07-05
---

# CI Validation

## Descripción

`ci-validate.js` verifica la estructura, consistencia y buenas prácticas del proyecto. Corre en CI y localmente.

## Uso

```bash
# Validación estándar
node shared/scripts/ci-validate.js

# Modo estricto (warnings fallan también)
node shared/scripts/ci-validate.js --strict

# Modo verbose (muestra todas las revisiones)
node shared/scripts/ci-validate.js --verbose
```

## Qué verifica

- Estructura de directorios
- Existencia de archivos requeridos
- Formato de skills (SKILL.md con frontmatter)
- Consistencia de configuración
- Referencias válidas

## Integración en CI

```yaml
# GitHub Actions
- name: Validate project
  run: node shared/scripts/ci-validate.js --strict
```

---

**Siguiente**: [[10-CI/02-tests.md|Tests]]
