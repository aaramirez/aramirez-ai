---
tags:
  - mcp
  - creator-scripts
created: 2026-07-05
---

# Usar MCP/command/plugin/tool creators

## create-mcp

```bash
# Servidor local
node shared/scripts/create-mcp.js --name mi-servidor --type local --command node --args "server.js"

# Servidor remoto
node shared/scripts/create-mcp.js --name context7 --type remote --url https://context7.com/mcp
```

## create-command

```bash
node shared/scripts/create-command.js --name test --template "npm test"
node shared/scripts/create-command.js --name deploy --template "npm run deploy -- $ARGUMENTS"
```

## create-plugin

```bash
# Plugin npm
node shared/scripts/create-plugin.js --name mi-plugin --type npm

# Plugin local
node shared/scripts/create-plugin.js --name mi-plugin --type local
```

## create-tool

```bash
node shared/scripts/create-tool.js \
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
