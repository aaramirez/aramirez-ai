---
tags:
  - comandos
  - sync
created: 2026-07-05
---

# arai sync — Sincronizar configuraciones

> **Objetivo**: Sincronizar skills, agentes y configuraciones entre el repositorio central de arai y los proyectos destino.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[02-Comandos/02-install.md|arai install]] completado

## Resultado esperado

Saber usar `arai sync` para actualizar componentes específicos o toda la configuración del proyecto.

## Uso básico

```bash
arai sync                        # Re-sincroniza todo el proyecto
arai sync skill youtube          # Sincroniza una skill específica
arai sync agent build            # Sincroniza un agente específico
```

## ¿Qué hace sync?

Lee los archivos fuente del repositorio arai (`shared/`, `.opencode/`) y los copia a `.opencode/` en tu proyecto. Es útil después de:

1. Editar una skill en el repositorio fuente (`shared/skills/<nombre>/SKILL.md`)
2. Modificar un agente en el repositorio fuente (`.opencode/agents/<nombre>.md`)
3. Actualizar la configuración de opencode (`opencode.json` en la raíz del proyecto)

## Flujo de trabajo típico

```bash
# 1. Editas una skill en el repositorio fuente
vim shared/skills/mi-skill/SKILL.md

# 2. Sincronizas al proyecto (.opencode/skills/mi-skill/)
arai sync skill mi-skill

# 3. Verificas
arai status
```

## Sincronizar todo

```bash
arai sync
```

Re-aplica toda la configuración de opencode al proyecto, incluyendo agentes, skills, comandos y permisos.

---

**Siguiente**: [[02-Comandos/04-status.md|arai status]]
