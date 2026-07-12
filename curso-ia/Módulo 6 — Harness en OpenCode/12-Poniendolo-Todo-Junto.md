# Módulo 12: Poniéndolo Todo Junto

## Caso Práctico: Harness "full-dev"

Construiremos un harness completo desde cero para un proyecto web hipotético llamado **TaskFlow** — un gestor de tareas colaborativo.

### Paso 1: Describir el Proyecto

Creamos `project.json` con la configuración inicial:

```json
{
  "name": "taskflow",
  "type": "web",
  "language": "typescript",
  "framework": "nextjs",
  "workflow": "plan-first",
  "features": ["authentication", "realtime", "api-rest"],
  "team": {
    "size": "small",
    "roles": ["fullstack"]
  }
}
```

### Paso 2: Generar Configuración Base

Usamos el agente `new-harness` para crear el harness de forma interactiva (workflow de 7 pasos):

> En opencode, selecciona el agente `new-harness` (tab-cycling) y responde las preguntas interactivas. El agente genera todo el harness: opencode.json, agentes, skills, permisos y comandos.

Esto genera:

```
mi-harness/
├── opencode.json
├── .opencode/
│   ├── agents/
│   │   ├── orchestrator.md
│   │   ├── developer.md
│   │   ├── reviewer.md
│   │   └── tester.md
│   └── skills/
└── AGENTS.md
```

### Paso 3: Revisar y Ajustar los Agentes

El generador produce una configuración inicial. Hay que ajustarla:

- **Orchestrator**: definir el flujo `plan-first` y los subagentes permitidos
- **Developer**: habilitar herramientas `read`, `write`, `edit`, `bash`
- **Reviewer**: restringir `edit: deny`
- **Tester**: habilitar solo `bash` (para ejecutar tests)

Abrimos cada archivo `.md` y refinamos las instrucciones según las necesidades del proyecto.

### Paso 4: Configurar Permisos

Elegimos el perfil **balanced**:

```json
{
  "agent": "orchestrator",
  "allowedTools": ["read", "bash"],
  "edit": "deny",
  "subagents": {
    "developer": {
      "allowedTools": ["read", "write", "edit", "bash"],
      "edit": "allow"
    },
    "reviewer": {
      "allowedTools": ["read", "bash"],
      "edit": "deny"
    },
    "tester": {
      "allowedTools": ["bash"],
      "edit": "deny"
    }
  }
}
```

### Paso 5: Agregar MCP Servers

Conectamos herramientas externas vía MCP (Model Context Protocol):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-playwright"]
    }
  }
}
```

### Paso 6: Crear Comandos Personalizados

Comandos para tareas frecuentes:

```json
{
  "commands": {
    "test": {
      "description": "Ejecutar tests",
      "command": "npm test",
      "agent": "tester"
    },
    "deploy": {
      "description": "Desplegar a producción",
      "command": "npm run deploy",
      "agent": "developer",
      "permission": "approval"
    },
    "lint": {
      "description": "Ejecutar linter",
      "command": "npm run lint",
      "agent": "reviewer"
    }
  }
}
```

### Paso 7: Agregar Skills

Cargamos skills útiles para el equipo:

```bash
arai install skill git
arai install skill code-review
```

Esto copia los `SKILL.md` a `.opencode/skills/` y registra las descripciones en el contexto permanente.

### Paso 8: Probar la Configuración

Validamos que todo esté correctamente configurado:

```bash
opencode debug config
```

Este comando muestra el árbol completo de agentes, herramientas, permisos y MCP servers. Si hay errores de sintaxis o referencias rotas, se reportan aquí.

## Principio Anthropic: "Propose, Don't Interrogate"

El harness no debe bombardear al usuario con preguntas. En lugar de preguntar "¿Qué framework usas?", el harness propone configuración sensata basada en el `project.json` y el usuario ajusta. Esto acelera la puesta en marcha y reduce fricción.

```
❌ "¿Qué framework quieres usar?"
✅ "Configuré Next.js como framework. Cámbialo en project.json si usas otro."
```

## Silent Viability Gate

Antes de presentar cualquier resultado al usuario, el harness ejecuta una verificación silenciosa:

1. ¿Existe `opencode.json`? Sí/No
2. ¿Todos los agentes referenciados existen? Sí/No
3. ¿Las rutas de instrucciones existen? Sí/No
4. ¿Los MCP servers son ejecutables? Sí/No
5. ¿Los permisos son válidos? Sí/No

Si algo falla, el harness lo corrige automáticamente o reporta el error específico.

## Validación CI

Para integración continua:

```bash
node shared/scripts/ci-validate.js
node shared/scripts/ci-validate.js --strict   # warnings como errores
node shared/scripts/ci-validate.js --verbose  # salida detallada
```

Esto asegura que el harness siempre está en estado válido antes de cada commit o despliegue.

## Siguientes Pasos

1. **Contribuir skills a la comunidad**: compartir skills reutilizables en el repositorio central
2. **Explorar plugins**: extender el harness con funcionalidades adicionales vía plugins de opencode
3. **Compartir harness**: exportar la configuración como template para nuevos proyectos con `arai init`
4. **Iterar**: ajustar agentes, permisos y flujos basándose en la experiencia del equipo

## Resumen de los 18 Skills Creadores

A lo largo del curso hemos visto 18 scripts generadores que forman el ecosistema del harness:

| # | Script | Propósito |
|---|--------|-----------|
| 1 | `harness-generator` | Generar harness completo desde `project.json` |
| 2 | `init-generator` | Inicializar proyecto con plantilla |
| 3 | `create-agent` | Crear agente individual |
| 4 | `create-skill` | Crear skill con frontmatter |
| 5 | `create-command` | Crear comando personalizado |
| 6 | `create-instructions` | Generar AGENTS.md |
| 7 | `create-reference` | Registrar referencia compartida |
| 8 | `create-prompt` | Crear fragmento de prompt |
| 9 | `create-rule` | Crear regla de codificación |
| 10 | `create-architecture` | Generar arquitectura multi-agente |
| 11 | `create-flow` | Crear flujo de trabajo |
| 12 | `create-mcp-server` | Configurar servidor MCP |
| 13 | `create-template` | Crear template de proyecto |
| 14 | `create-brand` | Configurar identidad visual |
| 15 | `create-script` | Crear script reutilizable |
| 16 | `sync-component` | Sincronizar componente al proyecto |
| 17 | `ci-validate` | Validar configuración en CI |
| 18 | `docgen-builder` | Generar documentación desde especificaciones |

Cada script se complementa con los demás: `harness-generator` llama internamente a `create-agent`, `create-skill`, etc. La filosofía es **composición sobre configuración** — scripts pequeños y enfocados que se combinan para construir harnesses complejos.

## Resumen

Construir un harness completo implica describir el proyecto, generar la base, ajustar agentes, configurar permisos, conectar MCP servers, crear comandos, agregar skills y validar el resultado. El principio "propose, don't interrogate" guía la experiencia de usuario: el harness propone configuraciones sensatas y el usuario ajusta. La validación silenciosa (`silent viability gate`) y la validación CI aseguran que el harness siempre está operativo. Los 18 scripts creadores del curso proporcionan las piezas modulares para construir cualquier configuración, desde un proyecto personal hasta un equipo multi-agente completo.
