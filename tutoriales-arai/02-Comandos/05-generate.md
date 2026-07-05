---
tags:
  - comandos
  - generate
created: 2026-07-05
---

# arai generate — Crear componentes

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
| `generate skill <nombre>` | Crea una skill en `shared/skills/<nombre>/SKILL.md` |
| `generate agent <nombre>` | Crea un agente + lo registra en opencode.json |
| `generate script <nombre>` | Crea un script reutilizable en `shared/scripts/` |
| `generate command <nombre>` | Crea un comando opencode personalizado |
| `generate brand` | Configura colores, logos y tipografía de la marca |
| `generate kb [dir]` | Crea un vault de Obsidian con estructura base |

## Ejemplo: Crear una skill

```bash
arai generate skill mi-skill
```

Genera `shared/skills/mi-skill/SKILL.md`:

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

Crea `platforms/opencode/agents/mi-agent.md` y agrega la entrada en `opencode.json`.

## Ejemplo: Crear un vault de Obsidian

```bash
arai generate kb tutoriales-arai --force
```

Crea un vault listo para usar en Obsidian con estructura de carpetas y configuración.

---

**Siguiente**: [[02-Comandos/06-update.md|arai update]]
