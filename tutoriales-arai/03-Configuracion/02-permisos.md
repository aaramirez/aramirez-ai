---
tags:
  - configuracion
  - permisos
created: 2026-07-05
---

# Modelo de permisos

## Permisos globales vs por agente

Los permisos se definen a dos niveles:

1. **Global** (`permission`): aplica a todos los agentes por defecto
2. **Por agente** (`agents.<name>.permission`): sobreescribe el global para un agente específico

## Claves de permiso

| Clave | Descripción |
|-------|-------------|
| `read` | Lectura de archivos |
| `edit` | Escritura/modificación de archivos |
| `glob` | Búsqueda de archivos por patrón |
| `grep` | Búsqueda de contenido |
| `list` | Listado de directorios |
| `bash` | Ejecución de comandos |
| `task` | Invocación de subagentes |
| `skill` | Carga de skills |
| `webfetch` | Peticiones HTTP/URL |
| `websearch` | Búsqueda web |

## Patrones glob para bash

Control fino sobre qué comandos puede ejecutar un agente:

```json
"permission": {
  "bash": "deny",
  "glob": ["git push", "ask"],
  "glob": ["npm *", "allow"],
  "glob": ["rm -rf", "deny"]
}
```

## Ejemplo: agente plan (solo lectura)

```json
"plan": {
  "mode": "primary",
  "permission": {
    "edit": "deny",
    "bash": "deny"
  }
}
```

## Ejemplo: agente build (acceso completo)

```json
"build": {
  "mode": "primary",
  "description": "Default agent for development"
}
```

Sin bloque `permission`, hereda los permisos globales (que por defecto permiten todo).

## Generar permisos

```bash
node shared/scripts/create-permission.js --strictness balanced
node shared/scripts/create-permission.js --strictness strict
node shared/scripts/create-permission.js --strictness permissive
```

---

**Siguiente**: [[03-Configuracion/03-runtime.md|Configuración del runtime]]
