# Módulo 10: Skills y Aprendizaje Bajo Demanda

## Anatomía de SKILL.md

Cada skill es un archivo `SKILL.md` con frontmatter YAML y contenido Markdown:

```yaml
---
name: mi-skill
description: Hace algo útil
license: MIT
---

# Mi Skill

Instrucciones detalladas para el agente...
```

### name

- Solo minúsculas y guiones: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Longitud: 1-64 caracteres
- Ejemplos válidos: `code-review`, `git`, `pdf-extraction`
- Ejemplos inválidos: `Code Review`, `mi_skill`, `Mi Skill`

### description

- 1-1024 caracteres
- Debe ser específica para que el agente elija correctamente cuándo cargar el skill
- Mala: "Ayuda con código"
- Buena: "Revisa pull requests, realiza auditorías de código y aplica estándares de calidad"

## Paths de Descubrimiento

El harness busca skills en este orden:

1. `.opencode/skills/` — proyecto local
2. `~/.config/opencode/skills/` — usuario global
3. `.claude/skills/` — compatibilidad legacy

## Carga Bajo Demanda

La `description` del skill está **siempre en contexto**. El contenido completo se carga **solo cuando el agente lo invoca explícitamente** mediante la skill tool. Esto mantiene el contexto limpio y permite tener muchos skills disponibles sin saturar la ventana.

```
Contexto permanente: descripciones de todos los skills
Carga solo cuando se necesita: contenido completo del skill seleccionado
```

## Permisos por Skill

Cada skill puede definir patrones glob para restringir qué archivos puede leer/escribir:

```yaml
---
name: code-review
permissions:
  read: ["**/*.ts", "**/*.js"]
  write: []
---
```

Los permisos pueden ser override por agente en `opencode.json`.

## Deshabilitar Skill Tool

Para deshabilitar completamente la skill tool (y evitar que se cargue cualquier skill):

```json
{
  "tools": {
    "skill": false
  }
}
```

## Script de Creación

```bash
node .opencode/scripts/create-skill.js \
  --name mi-skill \
  --description "Hace algo útil" \
  --content "# Mi skill\n\nInstrucciones..." \
  --output ./.opencode/skills/mi-skill/SKILL.md
```

## Sincronización

Después de crear o editar un skill, sincronízalo al proyecto:

```bash
arai sync skill mi-skill
```

## Práctica

1. Crea un skill llamado `mi-skill` con una descripción específica y contenido útil.
2. Sincronízalo con `arai sync skill mi-skill`.
3. Verifica que aparece en la lista de opencode con `opencode list skills`.
4. En una sesión, observa cómo la descripción está presente pero el contenido completo solo se carga cuando el agente invoca la skill tool.
