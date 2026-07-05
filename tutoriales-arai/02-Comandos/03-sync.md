---
tags:
  - comandos
  - sync
created: 2026-07-05
---

# arai sync — Sincronizar configuraciones

## Uso básico

```bash
arai sync                        # Re-sincroniza todo el proyecto
arai sync skill youtube          # Sincroniza una skill específica
arai sync agent build            # Sincroniza un agente específico
```

## ¿Qué hace sync?

Lee los archivos fuente en `shared/` y `platforms/` y los copia a las ubicaciones de destino en el proyecto. Es útil después de:

1. Editar una skill (`shared/skills/<nombre>/SKILL.md`)
2. Modificar un agente (`platforms/opencode/agents/<nombre>.md`)
3. Cambiar la configuración de opencode (`platforms/opencode/opencode.json`)

## Flujo de trabajo típico

```bash
# 1. Editas una skill
vim shared/skills/mi-skill/SKILL.md

# 2. Sincronizas al proyecto
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
