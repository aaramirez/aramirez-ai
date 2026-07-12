# Módulo 6: Diseño de Superficie de Herramientas

## Principio Anthropic

El modelo emite *tool calls*; el *harness* las maneja. El modelo no ejecuta nada directamente — propone una llamada con argumentos, y el runtime del harness la intercepta, la ejecuta, y devuelve el resultado al modelo. Esta separación es fundamental para la seguridad y control.

## Bash vs Herramientas Dedicadas

| Aspecto | Bash | Herramienta dedicada |
|---------|------|----------------------|
| Flexibilidad | Total | Acotada |
| Seguridad | Mínima (shell directo) | Validación + permisos |
| Rendimiento | Genérico | Optimizado |
| Auditoría | Traza del comando | Schema + resultado |

Usa Bash para tareas exploratorias; promueve a herramienta dedicada cuando el patrón se repite.

## Cuándo Promover una Acción a Herramienta Dedicada

- **Security boundary**: acciones difíciles de revertir (API calls, DELETE, escrituras críticas) deben pasar por herramientas con validación explícita.
- **Staleness checks**: la herramienta `edit` puede verificar que el archivo no cambió desde la última lectura, evitando condiciones de carrera.
- **Rendering**: algunas acciones (vistas previas, gráficos) se benefician de UI personalizada en lugar de texto plano.
- **Scheduling**: herramientas *read-only* (`glob`, `grep`) son *parallel-safe*; las escrituras deben serializarse para evitar corrupción.

## MCP Servers

Los servidores MCP (Model Context Protocol) extienden las capacidades del harness conectando servidores externos. Se configuran en `opencode.json`:

```json
{
  "mcp": {
    "github": {
      "type": "remote",
      "url": "https://api.github.com/mcp"
    }
  }
}
```

## Plugins

Plugins aportan hooks y herramientas personalizadas escritas en JavaScript. Se alojan en `.opencode/plugins/` y se registran en `opencode.json`.

## Custom Tools

Las herramientas personalizadas se definen con JSON Schema en `opencode.json`:

```json
{
  "customTools": {
    "buscador": {
      "description": "Busca en la base de datos",
      "schema": { "type": "object", "properties": { "q": { "type": "string" } } }
    }
  }
}
```

## Scripts de Creación

```bash
# MCP server remoto
node .opencode/scripts/create-mcp.js --name github --type remote --url https://api.github.com/mcp

# Plugin local
node .opencode/scripts/create-plugin.js --name local-plugin --type local --path ./.opencode/plugins/mi-plugin

# Custom tool
node .opencode/scripts/create-tool.js --name buscador --description "Busca en la base de datos" --schema '{"type":"object"}'
```

## Práctica

Configura un MCP server de GitHub en `opencode.json` y verifica que opencode pueda listar las herramientas disponibles con `opencode list tools`.
