---
tags:
  - mcp
  - plugins
created: 2026-07-05
---

# Plugins

## ¿Qué son los plugins?

Los plugins extienden el runtime de opencode con herramientas y hooks personalizados. Pueden ser paquetes npm o directorios locales.

## Plugin npm

```json
"plugins": [
  {
    "type": "npm",
    "name": "opencode-plugin-stats",
    "version": "^1.0.0"
  }
]
```

## Plugin local

```json
"plugins": [
  {
    "type": "local",
    "path": ".opencode/plugins/mi-plugin/"
  }
]
```

## Estructura de un plugin local

```
.opencode/plugins/mi-plugin/
├── index.js       ← Handler principal
├── tools/         ← Herramientas del plugin
├── hooks/         ← Hooks del runtime
└── package.json   ← Dependencias del plugin
```

## Crear un plugin

```bash
node shared/scripts/create-plugin.js --name mi-plugin --type local
```

Con `--dry-run` para previsualizar la estructura:

```bash
node shared/scripts/create-plugin.js --name mi-plugin --type local --dry-run
```

---

**Siguiente**: [[07-MCP/04-herramientas-personalizadas.md|Herramientas personalizadas]]
