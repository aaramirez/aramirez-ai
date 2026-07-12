---
tags:
  - comandos
  - generate
created: 2026-07-05
---

# arai generate — Crear componentes

> **Objetivo**: Usar `arai generate` para crear skills, agentes scripts, commands, brand y vaults de Obsidian desde la línea de comandos.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[01-Instalacion/01-instalar-arai.md|Instalar arai]] completado

## Resultado esperado

Conocer todos los subcomandos de `arai generate` y poder crear cualquier tipo de componente sin escribir archivos manualmente.

## Uso básico

```bash
arai generate skill <nombre>
arai generate agent <nombre>
arai generate script <nombre>
arai generate command <nombre>
arai generate brand
arai generate kb [directorio]
```

## Subcomandos

| Comando | Descripción |
|---------|-------------|
| `generate skill <nombre>` | Crea una skill en `.opencode/skills/<nombre>/SKILL.md` |
| `generate agent <nombre>` | Crea un agente + lo registra en opencode.json |
| `generate script <nombre>` | Crea un script reutilizable en `shared/scripts/` |
| `generate command <nombre>` | Crea un comando opencode personalizado |
| `generate brand` | Configura colores, logos y tipografía de la marca |
| `generate kb [dir]` | Crea un vault de Obsidian con estructura base |

## Ejemplo: Crear una skill

```bash
arai generate skill mi-skill
```

Genera `.opencode/skills/mi-skill/SKILL.md`:

```yaml
---
name: mi-skill
description: Lo que hace esta skill
license: MIT
---
```

## Ejemplo: Crear un agente

```bash
arai generate agent mi-agent
```

Crea `.opencode/agents/mi-agent.md` y agrega la entrada en `opencode.json` (en la raíz del proyecto).

## Ejemplo: Crear un vault de Obsidian

```bash
arai generate kb tutoriales-arai --force
```

Crea un vault listo para usar en Obsidian con estructura de carpetas y configuración.

---

**Siguiente**: [[02-Comandos/06-update.md|arai update]]
