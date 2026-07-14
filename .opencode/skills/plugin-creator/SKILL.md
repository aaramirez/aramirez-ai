---
name: plugin-creator
description: Create plugin configurations — npm packages or local plugin directories extending opencode with custom tools and hooks.
license: MIT
scripts:
  - create-plugin.js
  - create-base.js
---

# Creación de plugins para opencode

Los plugins extienden opencode con herramientas personalizadas y hooks. Pueden ser paquetes npm o directorios locales.

## Tipos de plugin

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `local` | Directorio local en `.opencode/plugins/` | Scripts internos, tools propias |
| `npm` | Paquete publicado en npm | Plugin comunitario |

## Sistema de hooks

Los plugins pueden suscribirse a eventos del ciclo de vida de opencode:
- `onInit` — al inicializar el agente
- `onMessage` — al procesar un mensaje
- `onToolCall` — al invocar una herramienta
- `onShutdown` — al finalizar

## Estructura del directorio

```
.opencode/plugins/
└── my-plugin/
    ├── plugin.json    # Configuración
    ├── index.js       # Punto de entrada
    └── tools/         # Herramientas personalizadas
```

## Convenciones de nombres

- Usar kebab-case para el nombre del directorio.
- El nombre en `plugin.json` debe coincidir con el nombre del paquete npm (si aplica).
- Incluir versión semántica y descripción breve.

## Referencia

```bash
node .opencode/skills/plugin-creator/scripts/create-plugin.js \
  --name my-plugin \
  --type local \
  --path ./.opencode/plugins/my-plugin \
  --output ./plugin.json
```
