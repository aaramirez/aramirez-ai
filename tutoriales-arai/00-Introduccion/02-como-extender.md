---
tags: [introduccion, extension, personalizacion]
created: 2026-07-05
---

# Cómo extender arai

arai está diseñado para ser **extensible en múltiples niveles**. Aquí están las vías disponibles, ordenadas de la más simple a la más avanzada.

## 1. Skills personalizadas

Las skills son el mecanismo más directo para agregar capacidades. Una skill es un archivo `SKILL.md` con frontmatter YAML que contiene instrucciones especializadas para que los agentes las usen.

```bash
node .opencode/skills/skill-creator/scripts/create-skill.js mi-skill  # Crear skill desde script
arai sync skill mi-skill                         # Sincronizar al proyecto
```

Las skills se almacenan en `.opencode/skills/<nombre>/SKILL.md` y opencode las lee nativamente.

**Cuándo usarlas**: cuando necesitas que los agentes sigan un procedimiento específico (revisión de código, formato, análisis, etc.).

## 2. Agentes personalizados

Puedes crear agentes con roles, prompts y permisos específicos:

```bash
node .opencode/skills/agent-creator/scripts/create-agent.js mi-agente --mode primary
```

O subagentes para tareas especializadas:

```bash
node .opencode/skills/agent-creator/scripts/create-agent.js revisor-seguridad --mode subagent
```

**Cuándo usarlos**: cuando necesitas un agente con un perfil y restricciones distintas al agente por defecto.

## 3. Arquitecturas multi-agente

Para flujos de trabajo complejos, puedes definir arquitecturas que orquestan múltiples agentes:

- **Orquestador**: un agente principal delega en subagentes
- **Peer**: agentes colaboran entre sí
- **Chain**: agentes trabajan en secuencia

```bash
node .opencode/skills/flow-creator/scripts/create-flow.js flujo-personalizado
```

## 4. Scripts reutilizables

Los scripts en `shared/scripts/` son ejecutables (Node.js ESM, Python o Bash) que pueden ser invocados por los agentes:

```bash
node .opencode/skills/script-creator/scripts/create-script.js mi-utilidad
node shared/scripts/mi-utilidad.js
```

**Cuándo usarlos**: cuando necesitas lógica que va más allá de instrucciones declarativas (procesamiento de datos, APIs, automatización).

## 5. Servidores MCP

Puedes integrar herramientas externas mediante el [Model Context Protocol (MCP)](https://modelcontextprotocol.io):

```bash
node .opencode/skills/mcp-creator/scripts/create-mcp.js mi-api --type remote --url https://api.mi-servicio.com
```

**Cuándo usarlos**: cuando necesitas que los agentes accedan a APIs, bases de datos o servicios externos.

## 6. Comandos personalizados de opencode

Comandos reutilizables que ejecutan tareas frecuentes con un solo nombre:

```bash
node .opencode/skills/command-creator/scripts/create-command.js revisar-pr
# Luego en opencode: @command revisar-pr
```

## 7. Plugins

Plugins npm que extienden opencode con herramientas y hooks personalizados:

```bash
arai install plugin mi-plugin
```

## 8. Harness completo

Para proyectos grandes, el **harness generator** crea una configuración completa de agentes, skills, MCP y flujos a partir de una especificación JSON:

```bash
node .opencode/skills/config-creator/scripts/create-config.js (individual scripts) --project spec.json
```

Esto genera 18 tipos de componentes en un solo paso.

## 9. Branding personalizado

Puedes configurar la identidad visual de los documentos generados:

Edita `shared/brand.json` directamente para configurar colores, logos y tipografía:

```json
{
  "name": "Mi Organización",
  "primary": "#1a365d"
}
```

Los colores y logos se inyectan en todos los PDFs, HTML y presentaciones.

---

**Siguiente**: [[00-Introduccion/03-arquitectura|Arquitectura del ecosistema]]
