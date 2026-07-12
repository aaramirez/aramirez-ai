---
name: mcp-creator
description: Create MCP server configurations — local processes, remote APIs, environment variables, and authentication.
license: MIT
scripts:
  - create-mcp.js
  - create-base.js
---

# Creador de MCP

## Tipos de MCP

### Local
Ejecuta un proceso local como servidor MCP. Usa `command` + `args` para definir el ejecutable.

```json
{
  "command": "node",
  "args": ["server.js"]
}
```

### Remote
Conecta a una API remota via URL. Soporta headers personalizados y autenticación.

```json
{
  "url": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer {env:GITHUB_TOKEN}"
  }
}
```

## Variables de entorno
Usa `{env:VARIABLE}` en cualquier string de la configuración para referenciar variables del entorno. OpenCode las resuelve en tiempo de ejecución.

## Autenticación
- **Bearer tokens**: `Authorization=Bearer {env:TOKEN}`
- **API keys**: `X-API-Key={env:API_KEY}`
- **Basic auth**: `Authorization=Basic {env:BASE64_CREDENTIALS}`

## Enable / Disable por workflow
Cada servidor MCP puede habilitarse o deshabilitarse según el workflow activo, permitiendo cargar solo las herramientas necesarias.

## Uso

```bash
node .opencode/scripts/create-mcp.js --name github --type remote --url https://api.github.com/mcp --header "Authorization=Bearer {env:GITHUB_TOKEN}" --output ./mcp.json
```
