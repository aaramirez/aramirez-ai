---
tags: [introduccion, extension, personalizacion]
created: 2026-07-05
---

# Cómo extender arai

arai está diseñado para ser **extensible en múltiples niveles**. Aquí están las vías disponibles, ordenadas de la más simple a la más avanzada.

## 1. Skills personalizadas

Las skills son el mecanismo más directo para agregar capacidades. Una skill es un archivo `SKILL.md` con frontmatter YAML que contiene instrucciones especializadas para que los agentes las usen.

```bash
arai generate skill mi-skill         # Crear skill desde CLI
arai sync skill mi-skill             # Sincronizar al proyecto
```

Las skills se almacenan en `.opencode/skills/<nombre>/SKILL.md` y opencode las lee nativamente.

**Cuándo usarlas**: cuando necesitas que los agentes sigan un procedimiento específico (revisión de código, formato, análisis, etc.).

## 2. Agentes personalizados

Puedes crear agentes con roles, prompts y permisos específicos:

```bash
arai generate agent mi-agente --mode primary
```

O subagentes para tareas especializadas:

```bash
arai generate agent revisor-seguridad --subagent
```

**Cuándo usarlos**: cuando necesitas un agente con un perfil y restricciones distintas al agente por defecto.

## 3. Arquitecturas multi-agente

Para flujos de trabajo complejos, puedes definir arquitecturas que orquestan múltiples agentes:

- **Orquestador**: un agente principal delega en subagentes
- **Peer**: agentes colaboran entre sí
- **Chain**: agentes trabajan en secuencia

```bash
arai generate flow flujo-personalizado
```

## 4. Scripts reutilizables

Los scripts en `shared/scripts/` son ejecutables (Node.js ESM, Python o Bash) que pueden ser invocados por los agentes:

```bash
arai generate script mi-utilidad
node shared/scripts/mi-utilidad.js
```

**Cuándo usarlos**: cuando necesitas lógica que va más allá de instrucciones declarativas (procesamiento de datos, APIs, automatización).

## 5. Servidores MCP

Puedes integrar herramientas externas mediante el [Model Context Protocol (MCP)](https://modelcontextprotocol.io):

```bash
arai generate mcp mi-api --type remote --url https://api.mi-servicio.com
```

**Cuándo usarlos**: cuando necesitas que los agentes accedan a APIs, bases de datos o servicios externos.

## 6. Comandos personalizados de opencode

Comandos reutilizables que ejecutan tareas frecuentes con un solo nombre:

```bash
arai generate command revisar-pr
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
node .opencode/scripts/create-config.js (individual scripts) --project spec.json
```

Esto genera 18 tipos de componentes en un solo paso.

## 9. Branding personalizado

Puedes configurar la identidad visual de los documentos generados:

```bash
arai generate brand --primary "#1a365d" --name "Mi Organización"
```

Los colores y logos se inyectan en todos los PDFs, HTML y presentaciones.

---

**Siguiente**: [[00-Introduccion/03-arquitectura|Arquitectura del ecosistema]]
