---
tags:
  - skills
  - sync
created: 2026-07-05
---

# Sincronizar skills

## ¿Por qué sincronizar?

Cuando editas una skill en `shared/skills/<nombre>/SKILL.md`, los cambios no se reflejan automáticamente en `.opencode/skills/`. Hay que sincronizar explícitamente.

## Sincronizar una skill

```bash
arai sync skill mi-skill
```

## Sincronizar todas las skills

```bash
arai sync
```

## Flujo completo

```bash
# 1. Crear o editar la skill
arai generate skill mi-skill
vim shared/skills/mi-skill/SKILL.md

# 2. Sincronizar al proyecto
arai sync skill mi-skill

# 3. Verificar
arai status

# 4. Usar la skill desde un agente
# El agente cargará automáticamente .opencode/skills/mi-skill/SKILL.md
```

## Compartir skills entre proyectos

Como las skills viven en `shared/skills/` del repositorio de arai, cualquier proyecto que use `arai install skill <nombre>` puede obtenerlas. Esto permite mantener un repositorio central de skills reutilizables.

---

**Siguiente**: [[07-MCP/Index|MCP, Comandos y Extensiones]]
