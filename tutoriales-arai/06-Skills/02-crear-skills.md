---
tags:
  - skills
  - creacion
created: 2026-07-05
---

# Crear skills nuevas

> **Objetivo**: Escribir skills reutilizables con frontmatter YAML válido, instrucciones claras y estructura SKILL.md compatible con opencode.

**⏱ Tiempo estimado**: 10 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[06-Skills/01-usar-skills.md|Usar skills existentes]]

## Resultado esperado

Crear skills personalizadas para tu dominio, con frontmatter `name:`, `description:`, `license: MIT`, y contenido instruccional que los agentes puedan usar.

## Paso 1: Generar el esqueleto

```bash
node .opencode/scripts/create-skill.js mi-skill
```

Esto crea `.opencode/skills/mi-skill/SKILL.md`:

```yaml
---
name: mi-skill
description: Lo que hace esta skill
license: MIT
---
```

## Paso 2: Escribir el contenido

Estructura recomendada:

```markdown
---
name: mi-skill
description: Automatiza la revisión de logs
license: MIT
---

# Skill: mi-skill

## Descripción

Instrucciones para revisar logs de aplicación y detectar patrones de error.

## Pasos

1. Ejecutar `node scripts/analizar-logs.js`
2. Revisar la salida en busca de patrones conocidos
3. Generar resumen de hallazgos

## Referencias

- Script de análisis: `shared/scripts/analizar-logs.js`
- Output: `reports/log-analysis-*.md`
```

## Paso 3: Sincronizar la skill

```bash
arai sync skill mi-skill
```

Esto copia la skill a `.opencode/skills/mi-skill/SKILL.md` y la hace disponible para los agentes.

## Buenas prácticas

- **Nombre corto y descriptivo** en kebab-case
- **Descripción clara** de una línea
- **Instrucciones paso a paso** que un agente pueda seguir
- **Referencias a scripts** o herramientas asociadas
- Un solo propósito por skill

---

**Siguiente**: [[06-Skills/03-sincronizar-skills.md|Sincronizar skills]]
