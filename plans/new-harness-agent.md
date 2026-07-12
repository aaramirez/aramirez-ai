# Plan: Agente New-Harness + Skill harness-generator

## Resumen

Crear un agente primario llamado **new-harness** que interactúa conversacionalmente con el usuario para recopilar toda la información necesaria y generar un harness completo de opencode ejecutando comandos CLI de arai. Acompañado de un skill **harness-generator** que define las instrucciones y workflow del agente.

## Archivos a crear/modificar

| # | Archivo | Acción | Propósito |
|---|---------|--------|-----------|
| 1 | `shared/skills/harness-generator/SKILL.md` | **Crear** | Skill con instrucciones del workflow de generación |
| 2 | `shared/agents/new-harness.md` | **Crear** | Agent definition (source of truth) |
| 3 | `.opencode/agents/new-harness.md` | **Crear** | Agent definition (installed copy) |
| 4 | `opencode.json` | **Modificar** | Registrar agente como primary |
| 5 | `AGENTS.md` | **Modificar** | Actualizar tabla de agentes |

---

## 1. Skill: `harness-generator`

**Ruta:** `shared/skills/harness-generator/SKILL.md`

### Frontmatter

```yaml
---
name: harness-generator
description: Generate complete opencode harness configurations interactively via CLI commands.
license: MIT
---
```

### Contenido del skill

El skill debe definir:

**a) Flujo conversacional (7 pasos):**

1. **Nombre del proyecto** — Pide nombre, verifica que no exista directorio con ese nombre
2. **Tipo de proyecto** — Ofrece opciones: `web`, `api`, `cli`, `library`, `mobile`, `desktop`, `data`, `ai/ml`, `fullstack`
3. **Lenguaje/Stack** — Ofrece opciones según tipo: `typescript`, `javascript`, `python`, `go`, `rust`, `java`, `ruby`, `php`
4. **Descripción** — Pide descripción breve del proyecto (1-2 oraciones)
5. **Agentes** — Lista los disponibles (`build`, `plan`, `reviewer`, `tester`, `docs`) y pregunta cuáles incluir. Ofrece perfiles predefinidos:
   - `minimal`: solo `build`
   - `standard`: `build` + `plan` + `reviewer`
   - `full`: `build` + `plan` + `reviewer` + `tester` + `docs`
6. **Skills** — Lista skills disponibles ejecutando `arai list skills` y pregunta cuáles incluir. Ofrece recomendaciones basadas en el tipo de proyecto
7. **Configuración avanzada** (opcional) — Pregunta sobre:
   - Nivel de estrictitud: `strict`, `balanced`, `relaxed`
   - Workflow: `plan-first`, `code-first`
   - MCP servers adicionales
   - Template: `minimal` o `full`

**b) Comandos CLI a ejecutar:**

```bash
# Opción A: Usar arai init (para proyectos nuevos desde cero)
arai init <nombre-proyecto> --template <minimal|full> --description "<descripcion>"

# Opción B: Usar harness-generator.js (para generar config sin scaffold)
node shared/scripts/harness-generator.js --project <project.json> --output <dir>

# Opción C: Instalar componentes individuales
arai install skill <nombre>
arai install agent <nombre>
arai generate agent <nombre> --description "<desc>"
```

**c) Lógica de decisión:**

| Escenario | Comando recomendado |
|-----------|-------------------|
| Proyecto nuevo desde cero | `arai init <dir> --template full` |
| Solo generar configuración | `harness-generator.js --project spec.json` |
| Agregar componente a proyecto existente | `arai install <type> <name>` |
| Crear agente personalizado | `arai generate agent <name>` |

**d) Estructura de salida esperada:**

El skill debe documentar qué archivos genera el harness:
- `opencode.json` — Configuración completa
- `AGENTS.md` — Instrucciones para agentes
- `.opencode/agents/*.md` — Definiciones de agentes
- `.opencode/skills/*/SKILL.md` — Skills instalados
- `shared/` — Scripts y prompts compartidos

---

## 2. Agente: `new-harness`

**Ruta:** `shared/agents/new-harness.md` (source of truth) + `.opencode/agents/new-harness.md` (installed)

### Frontmatter

```yaml
---
description: Generador interactivo de harnesses de opencode — pregunta todo lo necesario y ejecuta comandos CLI para crear la configuración completa.
mode: primary
model: opencode/big-pickle
permission:
  edit: allow
  bash: allow
  read: allow
---
```

### System prompt (cuerpo del agente)

El prompt debe incluir:

1. **Identidad:** Eres el agente New-Harness, especializado en generar configuraciones completas de opencode para nuevos proyectos.

2. **Principio rector:** "Propón, no interrogues" — ofrece opciones concretas al usuario en lugar de preguntas abiertas. Presenta 3-5 opciones numeradas para cada decisión.

3. **Workflow obligatorio:**
   - SIEMPRE carga el skill `harness-generator` al inicio
   - Sigue los 7 pasos del skill secuencialmente
   - Muestra un resumen ANTES de ejecutar cualquier comando
   - Espera confirmación del usuario antes de generar

4. **Comandos CLI disponibles:**
   - `arai init <dir> --template <name> --description <desc>`
   - `arai list skills|agents|scripts|templates|commands|mcp`
   - `arai install <type> <name> --project <dir>`
   - `arai generate agent|skill|script|command <name>`
   - `node shared/scripts/harness-generator.js --project <json> --output <dir>`

5. **Reglas de comportamiento:**
   - Nunca ejecutes comandos destructivos sin confirmación
   - Muestra el resultado de cada comando ejecutado
   - Si un comando falla, explica el error y sugiere solución
   - Al finalizar, muestra resumen de archivos creados y próximos pasos

---

## 3. Registro en `opencode.json`

Agregar entrada en la sección `agent`:

```json
"new-harness": {
  "description": "Generador interactivo de harnesses de opencode",
  "mode": "primary",
  "path": ".opencode/agents/new-harness.md"
}
```

---

## 4. Actualización de `AGENTS.md`

Agregar fila a la tabla de agentes:

```
| **new-harness** | primary | edit: allow, bash: allow, read: allow |
```

---

## 5. Verificación

### Pruebas manuales

1. **Carga del agente:** Cambiar a agente `new-harness` con Tab en opencode
2. **Skill loading:** Verificar que el agente carga `harness-generator` automáticamente
3. **Flujo completo:** Responder todas las preguntas y verificar que se genera el harness
4. **Comandos CLI:** Verificar que `arai init`, `arai list`, `arai install` ejecutan correctamente

### Pruebas automatizadas

```bash
# Verificar que el archivo del agente existe y tiene frontmatter válido
node --test tests/consistency/

# Verificar que opencode.json es válido
node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8'))"

# Verificar que el skill tiene frontmatter válido
head -5 shared/skills/harness-generator/SKILL.md
```

---

## Orden de implementación

1. Crear `shared/skills/harness-generator/SKILL.md`
2. Crear `shared/agents/new-harness.md`
3. Copiar a `.opencode/agents/new-harness.md`
4. Modificar `opencode.json` — agregar registro del agente
5. Modificar `AGENTS.md` — actualizar tabla
6. Ejecutar `npm test` para verificar consistencia
