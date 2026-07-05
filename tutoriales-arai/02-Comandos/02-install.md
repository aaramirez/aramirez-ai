---
tags:
  - comandos
  - install
created: 2026-07-05
---

# arai install — Instalar componentes

> **Objetivo**: Aprender a instalar la plataforma opencode y componentes individuales (skills, agents, scripts) en cualquier proyecto.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: Node.js 18+, proyecto con `opencode.json`

## Resultado esperado

Poder ejecutar `arai install` para configurar opencode en un proyecto, e `arai install <type> <name>` para agregar componentes específicos.

## Uso básico

```bash
arai install                    # Instala opencode en el proyecto actual
arai install skill youtube      # Instala una skill específica
arai install agent build       # Instala un agente específico
```

## Instalar por tipo

| Comando | Descripción |
|---------|-------------|
| `arai install` | Instala la plataforma opencode completa |
| `arai install skill <nombre>` | Instala una skill específica |
| `arai install agent <nombre>` | Instala un agente y lo registra en opencode.json |
| `arai install script <nombre>` | Copia un script reutilizable |
| `arai install prompt <nombre>` | Copia un fragmento de prompt |
| `arai install rule <nombre>` | Copia una regla de estilo/arquitectura |

## Instalar en otro directorio

```bash
arai install --project /ruta/al/proyecto
```

## Caso de uso: Agregar una skill a un proyecto existente

```bash
cd mi-proyecto
arai install skill youtube
```

Esto copia `shared/skills/youtube/SKILL.md` a `.opencode/skills/youtube/SKILL.md`.

---

**Siguiente**: [[02-Comandos/03-sync.md|arai sync]]
