---
tags:
  - ci
  - validacion
created: 2026-07-05
---

# Outcome Validation

> **Objetivo**: Conocer el plan de validación de resultados en 5 fases que garantiza que los comandos de arai generan la salida correcta.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[10-CI/02-tests.md|Tests]]

## Resultado esperado

Entender cómo se valida cada comando de arai (init, install, sync) y cómo contribuir nuevos tests de validación.

## Plan de 5 fases

El plan completo está en `docs/outcome-validation-plan.md`. Resume:

| Fase | Descripción | Automatizable |
|------|-------------|:---:|
| **Fase 1** | Estructura de archivos: directorios, skills, scripts existen | ✅ CI |
| **Fase 2** | Contenido y formato: SKILL.md con frontmatter, scripts sin errores | ✅ CI |
| **Fase 3** | Comandos CLI: init, install, sync | ✅ CI |
| **Fase 4** | Pipeline docgen: builders, charts, validación | ✅ CI |
| **Fase 5** | Sesiones de IA reales: verificación con `TEST_AI=true` | ⛔ Gated |

## Ejecutar

```bash
# Fases 1-4 (CI)
npm test
node shared/scripts/ci-validate.js
node shared/scripts/docgen/validate.js

# Fase 5 (requiere TEST_AI=true)
TEST_AI=true npm test
```

---

**Siguiente**: [[11-Casos-de-uso/Index|Casos de uso]]
