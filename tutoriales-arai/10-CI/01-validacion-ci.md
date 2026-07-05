---
tags:
  - ci
  - validacion
created: 2026-07-05
---

# CI Validation

> **Objetivo**: Verificar la estructura, consistencia y buenas prácticas del proyecto usando `ci-validate.js`.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: Node.js 18+, proyecto arai

## Resultado esperado

Poder ejecutar validaciones CI locales con diferentes niveles de estrictez y entender qué verifica cada chequeo.

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
