---
tags:
  - caso-de-uso
  - skills
created: 2026-07-05
---

# Crear y compartir skills personalizadas

## Objetivo

Desarrollar una skill para un dominio específico (ej: revisión de logs) y compartirla entre proyectos.

## Paso 1: Identificar la necesidad

Tu equipo revisa logs de aplicación manualmente cada semana. Quieres crear una skill que un agente pueda cargar para automatizar parte del proceso.

## Paso 2: Generar la skill

```bash
node .opencode/scripts/create-skill.js log-review
```

## Paso 3: Escribir la skill

Editar `.opencode/skills/log-review/SKILL.md`:

```markdown
---
name: log-review
description: Revisa logs de aplicación y genera reportes de incidentes
license: MIT
---

# Skill: log-review

## Descripción

Analiza archivos de log en busca de patrones de error conocidos y genera un reporte estructurado.

## Instrucciones

1. Ejecuta `node shared/scripts/analyze-logs.js --input <path>`
2. Revisa la salida JSON en busca de:
   - `ERROR` - requiere acción inmediata
   - `WARN` - monitorear
   - Patrones de recurrencia
3. Genera un reporte en `docs/log-review-<fecha>.md`

## Script asociado

`shared/scripts/analyze-logs.js` debe existir o crearse.
```

## Paso 4: Crear el script asociado

```bash
node .opencode/scripts/create-script.js analyze-logs
```

## Paso 5: Sincronizar

```bash
arai sync skill log-review
```

## Paso 6: Usar en cualquier proyecto

```bash
cd otro-proyecto
arai install skill log-review
```

---

**Siguiente**: [[11-Casos-de-uso/03-automatizar-reportes.md|Automatizar reportes semanales]]
