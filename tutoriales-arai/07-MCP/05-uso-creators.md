---
tags:
  - mcp
  - creator-scripts
created: 2026-07-05
---

# Usar MCP/command/plugin/tool creators

> **Objetivo**: Usar los scripts creator para generar servidores MCP, comandos personalizados, plugins y herramientas desde la línea de comandos.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[07-MCP/01-servidores-mcp.md|Servidores MCP]]

## Resultado esperado

Poder generar cualquier extensión de opencode usando `node .opencode/scripts/create-*.js` con sus opciones correspondientes.

## create-mcp

```bash
# Servidor local
node .opencode/skills/mcp-creator/scripts/create-mcp.js --name mi-servidor --type local --command node --args "server.js"

# Servidor remoto
node .opencode/skills/mcp-creator/scripts/create-mcp.js --name context7 --type remote --url https://context7.com/mcp
```

## create-command

```bash
node .opencode/skills/command-creator/scripts/create-command.js --name test --template "npm test"
node .opencode/skills/command-creator/scripts/create-command.js --name deploy --template "npm run deploy -- $ARGUMENTS"
```

## create-plugin

```bash
# Plugin npm
node .opencode/skills/plugin-creator/scripts/create-plugin.js --name mi-plugin --type npm

# Plugin local
node .opencode/skills/plugin-creator/scripts/create-plugin.js --name mi-plugin --type local
```

## create-tool

```bash
node .opencode/skills/tool-creator/scripts/create-tool.js \
  --name mi-herramienta \
  --description "Descripción" \
  --schema '{"type":"object","properties":{"input":{"type":"string"}}}'
```

## Flags comunes

```bash
--dry-run       # Previsualizar sin escribir
--output <dir>  # Directorio de salida
--help          # Ayuda
```

---

**Siguiente**: [[08-Referencias/Index|Prompts, Reglas y Branding]]
