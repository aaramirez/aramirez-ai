---
name: harness-generator
description: Generate complete opencode harness configurations interactively via CLI commands.
license: MIT
---

# Harness Generator

Skill que guía al agente para generar configuraciones completas de opencode de forma interactiva. El agente pregunta al usuario todo lo necesario y ejecuta comandos CLI de arai para producir el harness.

**Nota:** Este es un skill LOCAL de aramirez-ai, no se distribuye a otros proyectos.

## Principio rector

**"Propón, no interrogues"** — Ofrece opciones concretas (3-5 alternativas numeradas) en lugar de preguntas abiertas. El usuario solo debe seleccionar, no escribir desde cero.

## Workflow de 7 pasos

### Paso 1: Nombre del proyecto

Pide al usuario el nombre del proyecto. Debe ser un identificador válido (kebab-case, sin espacios).

```
¿Cómo se llama tu proyecto?
1. mi-app-web
2. mi-api-rest
3. mi-libreria
4. (Escribir otro nombre)
```

**Validaciones:**
- Sin espacios ni caracteres especiales (solo lowercase, números, guiones)
- Longitud máxima 64 caracteres
- Verificar que no exista un directorio con ese nombre

### Paso 2: Tipo de proyecto

Ofrece categorías predefinidas:

```
¿Qué tipo de proyecto es?
1. web       — Aplicación web (React, Vue, Angular, Next.js)
2. api       — API REST/GraphQL (Express, FastAPI, Spring)
3. cli       — Herramienta de línea de comandos
4. library   — Librería/paquete reutilizable
5. mobile    — Aplicación móvil (React Native, Flutter)
6. desktop   — Aplicación de escritorio (Electron, Tauri)
7. data      — Pipeline de datos / ETL / analytics
8. ai/ml     — Proyecto de inteligencia artificial / machine learning
9. fullstack — Aplicación full-stack (frontend + backend)
```

### Paso 3: Lenguaje/Stack

Según el tipo seleccionado, ofrece opciones relevantes:

| Tipo | Lenguajes sugeridos |
|------|-------------------|
| web | typescript, javascript |
| api | typescript, python, go, java |
| cli | typescript, python, go, rust |
| library | typescript, javascript, python |
| mobile | typescript (React Native), dart (Flutter) |
| desktop | typescript (Electron), rust (Tauri) |
| data | python, sql, typescript |
| ai/ml | python, typescript |
| fullstack | typescript, javascript |

### Paso 4: Descripción

Pide una descripción breve (1-2 oraciones) del proyecto. Ofrece ejemplos según el tipo:

```
Describe brevemente tu proyecto (1-2 oraciones):
Ejemplo para "web": "Aplicación de gestión de inventarios con dashboard en tiempo real"
```

### Paso 5: Agentes

Lista los agentes disponibles y ofrece perfiles predefinidos:

```
¿Qué agentes quieres incluir?

Agentes disponibles:
  build   — Agente principal de implementación
  plan    — Agente de planificación estratégica
  reviewer — Especialista en revisión de código
  tester  — Especialista en testing y TDD
  docs    — Especialista en documentación

Perfiles predefinidos:
1. minimal  — Solo build
2. standard — build + plan + reviewer
3. full     — build + plan + reviewer + tester + docs
4. personalizado (seleccionar agentes uno a uno)
```

### Paso 6: Skills

Ejecuta `arai list skills` para mostrar skills disponibles y recomienda según el tipo de proyecto:

| Tipo de proyecto | Skills recomendados |
|-----------------|-------------------|
| web | git, code-review, document-generation |
| api | git, code-review, document-generation |
| cli | git, code-review |
| library | git, code-review, document-generation |
| ai/ml | git, code-review, document-generation, youtube |
| fullstack | git, code-review, document-generation |

```
¿Qué skills quieres incluir?
(recomendados según tu tipo de proyecto: <lista>)

1. git — Gestión de ramas, commits, y flujos de trabajo
2. code-review — Revisión automática de código
3. document-generation — Generación de PDFs, decks, reportes
4. (Escribir otro skill)
5. Ninguno adicional
```

### Paso 7: Configuración avanzada (opcional)

```
¿Quieres configurar opciones avanzadas?
1. Sí, configurar todo
2. No, usar valores por defecto

Opciones avanzadas:
- Estrictitud: strict | balanced (default) | relaxed
- Workflow: plan-first (default) | code-first
- Template: minimal | full (default)
- MCP servers adicionales
```

## Ejecución de comandos CLI

### Generación completa (recomendado para proyectos nuevos)

```bash
arai init <nombre-proyecto> --template <minimal|full> --description "<descripcion>"
```

### Generación solo de configuración (sin scaffold)

Crear archivo temporal `project.json` y ejecutar:

```bash
node shared/scripts/harness-generator.js --project project.json --output <nombre-proyecto>
```

### Componentes individuales

```bash
# Listar opciones disponibles
arai list skills
arai list agents
arai list templates

# Instalar componentes específicos
arai install skill <nombre> --project <dir>
arai install agent <nombre> --project <dir>

# Generar agentes personalizados
arai generate agent <nombre> --description "<desc>"
arai generate skill <nombre> --description "<desc>"
```

## Resumen previo a ejecución

**SIEMPRE** muestra un resumen ANTES de ejecutar cualquier comando:

```
═══════════════════════════════════════════════════════
  RESUMEN DE CONFIGURACIÓN
═══════════════════════════════════════════════════════

  Proyecto:    mi-app-web
  Tipo:        web
  Lenguaje:    typescript
  Descripción: Aplicación de gestión de inventarios
  Perfil:      standard (build + plan + reviewer)
  Skills:      git, code-review, document-generation
  Template:    full
  Estrictitud: balanced

  Comando a ejecutar:
  arai init mi-app-web --template full --description "Aplicación de gestión de inventarios"

═══════════════════════════════════════════════════════
```

**Espera confirmación** del usuario antes de ejecutar.

## Manejo de errores

- Si `arai init` falla porque el directorio ya existe → Preguntar si quiere sobrescribir o usar otro nombre
- Si un skill no existe → Mostrar skills disponibles y pedir selección nueva
- Si el comando falla por permisos → Explicar y sugerir solución

## Al finalizar

Muestra:
1. Lista de archivos creados
2. Estructura de directorios generada
3. Próximos pasos recomendados:
   - `cd <nombre-proyecto>`
   - Abrir en opencode
   - Personalizar AGENTS.md si es necesario

## Skills relacionados (en shared)

- [harness-creator](../../../shared/skills/harness-creator/SKILL.md) — Orquestador de generación con sub-skills
- [config-creator](../../../shared/skills/config-creator/SKILL.md) — Configuración base de opencode.json
- [agent-creator](../../../shared/skills/agent-creator/SKILL.md) — Agentes primarios
- [subagent-creator](../../../shared/skills/subagent-creator/SKILL.md) — Subagentes especializados
- [skill-creator](../../../shared/skills/skill-creator/SKILL.md) — Creación de skills
