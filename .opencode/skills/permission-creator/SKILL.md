---
name: permission-creator
description: Create permission rules for agents and tools — global defaults and per-agent overrides with glob patterns.
license: MIT
scripts:
  - create-permission.js
  - create-base.js
---

# Permission Creator

Define las reglas de permisos para agentes y herramientas en opencode. Soporta defaults globales y sobrescritura por agente con patrones glob para comandos bash.

## Claves de permiso

| Clave | Controla | Valores |
|-------|----------|---------|
| `edit` | Edición de archivos | `allow`, `ask`, `deny` |
| `bash` | Ejecución de comandos | `allow`, `ask`, `deny`, o mapa de patrones |
| `read` | Lectura de archivos | `allow`, `ask`, `deny` |
| `glob` | Búsqueda de archivos por patrón | `allow`, `ask`, `deny` |
| `grep` | Búsqueda en contenido | `allow`, `ask`, `deny` |
| `task` | Delegación a subagentes | `allow`, `ask`, `deny` |
| `skill` | Carga de skills | `allow`, `ask`, `deny` |
| `webfetch` | Fetching de URLs | `allow`, `ask`, `deny` |
| `websearch` | Búsqueda web | `allow`, `ask`, `deny` |

## Niveles de strictness

El script ofrece tres perfiles predefinidos:

| Perfil | bash | edit | read | Uso recomendado |
|--------|------|------|------|-----------------|
| `relaxed` | `allow` | `ask` | `allow` | Proyectos personales, prototyping |
| `balanced` | Glob por comando | `ask` | `allow` | Equipos, proyecto estándar |
| `strict` | `ask` | `deny` | `ask` | Producción, revisión manual |

### Perfil balanced (default)

```json
{
  "bash": {
    "git *": "allow",
    "npm *": "allow",
    "npx *": "ask",
    "*": "ask"
  },
  "edit": "ask",
  "read": "allow"
}
```

## Script de referencia

```bash
node .opencode/skills/permission-creator/scripts/create-permission.js --strictness balanced --output ./permission.json
```

### Opciones

| Flag | Descripción | Default |
|------|-------------|---------|
| `--strictness <perfil>` | `relaxed`, `balanced`, o `strict` | `balanced` |
| `--output <file>` | Archivo de salida | `./permission.json` |
| `--dry-run` | Vista previa sin escribir | — |
| `--help` | Muestra la ayuda | — |

## Ejemplo de uso

```bash
# Generar permisos balanced
node .opencode/skills/permission-creator/scripts/create-permission.js --strictness balanced --output ./permission.json

# Generar permisos strict para producción
node .opencode/skills/permission-creator/scripts/create-permission.js --strictness strict --output ./prod-permission.json

# Integrar en opencode.json manualmente
# Copia la sección "permission" generada en tu archivo opencode.json
```
