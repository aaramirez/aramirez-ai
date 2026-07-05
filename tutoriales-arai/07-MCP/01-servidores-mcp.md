---
tags:
  - mcp
  - servidores
created: 2026-07-05
---

# Servidores MCP

> **Objetivo**: Configurar servidores MCP (Model Context Protocol) locales y remotos para que los agentes accedan a contexto y herramientas externas.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[03-Configuracion/01-opencode-json.md|opencode.json a fondo]]

## Resultado esperado

Poder conectar opencode a APIs externas, bases de datos o servicios mediante servidores MCP, configurando autenticación y variables de entorno.

## ¿Qué es MCP?

Model Context Protocol (MCP) permite que opencode se conecte a fuentes externas de contexto y herramientas. Los servidores MCP pueden ser locales (procesos) o remotos (APIs).

## Tipos de servidores

### Local (proceso)

Ejecuta un proceso local que provee herramientas al agente:

```json
"mcp_servers": {
  "context7": {
    "type": "local",
    "command": "node",
    "args": ["mcp-servers/context7.js"]
  }
}
```

### Remoto (URL)

Conecta a una API remota:

```json
"mcp_servers": {
  "context7": {
    "type": "remote",
    "url": "https://context7.com/mcp",
    "headers": {
      "Authorization": "Bearer ${CONTEXT7_API_KEY}"
    }
  }
}
```

## Variables de entorno

```json
"mcp_servers": {
  "api-tools": {
    "type": "remote",
    "url": "https://api.example.com/mcp",
    "headers": {
      "X-API-Key": "${API_KEY}"
    }
  }
}
```

## Crear un servidor MCP

```bash
node shared/scripts/create-mcp.js --name context7 --type remote --url https://context7.com/mcp
```

## Skills relacionadas

Las skills `mcp-creator` y `tool-creator` guían la creación de servidores MCP desde agentes de opencode.

---

**Siguiente**: [[07-MCP/02-comandos-personalizados.md|Comandos personalizados]]
