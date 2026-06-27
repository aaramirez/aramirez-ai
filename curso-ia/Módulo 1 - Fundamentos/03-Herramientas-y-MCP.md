# Herramientas y MCP

## ¿Qué son las herramientas (tools)?

Las **tools** son capacidades que le damos a la IA para que pueda interactuar con el mundo real: leer archivos, ejecutar comandos, hacer peticiones HTTP, etc.

> *"Las herramientas son lo que transforma a la IA de un chat a un agente."*

## Tipos de herramientas

| Herramienta | Descripción | Ejemplo |
|-------------|-------------|---------|
| **Lectura** | Leer archivos del proyecto | `Read file`, `Grep` |
| **Escritura** | Crear o modificar archivos | `Write`, `Edit` |
| **Ejecución** | Correr comandos en terminal | `Bash`, `Node` |
| **Navegación** | Explorar el proyecto | `Glob`, `Directory` |
| **Web** | Acceder a internet | `WebFetch`, `WebSearch` |

## MCP — Model Context Protocol

**MCP** es un protocolo estándar para conectar agentes de IA con herramientas externas. Piensa en ello como el "USB-C" de las IA:s permite conectar cualquier herramienta con cualquier agente.

### Cómo funciona

```
Agente IA ←→ MCP Client ←→ MCP Server ←→ Herramienta externa
```

### Ejemplos de MCP Servers

| Server | Función |
|--------|---------|
| **Playwright** | Navegación web automatizada |
| **GitHub** | Interactuar con repositorios, issues, PRs |
| **Filesystem** | Acceso controlado al sistema de archivos |

### Configuración en opencode

```json
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp"],
      "enabled": false
    },
    "github": {
      "type": "remote",
      "url": "https://api.github.com/mcp",
      "enabled": false,
      "headers": {
        "Authorization": "Bearer {env:GITHUB_TOKEN}"
      }
    }
  }
}
```

## Herramientas vs MCP

| Tools nativas | MCP Servers |
|---------------|-------------|
| Vienen con el agente | Se instalan por separado |
| Limitadas al entorno del agente | Acceso a servicios externos |
| No requieren configuración | Requieren configurar servidores |

## Buenas prácticas

1. **Habilitar herramientas gradualmente**: empieza con lectura/escritura, añade ejecución cuando confíes.
2. **Usar MCP para tareas específicas**: no actives Playwright si solo estás editando texto.
3. **Limitar permisos**: configura la IA para que pregunte antes de ejecutar comandos destructivos.

## Enlaces

- [[02-Prompts-efectivos|Anterior: Prompts efectivos]]
- [[04-Criterio-y-buenas-practicas|Siguiente: Criterio y buenas prácticas]]
- [[Módulo 2 — Agentes/01-Que-es-un-agente|¿Qué es un agente?]]
