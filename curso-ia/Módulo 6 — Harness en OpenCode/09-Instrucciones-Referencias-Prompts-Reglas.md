# Módulo 9: Instrucciones, Referencias, Prompts y Reglas

## El Key `instructions`

El key `instructions` en `opencode.json` es un array de paths a archivos que contienen instrucciones adicionales para el agente. Se cargan en cada solicitud como parte del system prompt.

```json
{
  "instructions": [
    "./AGENTS.md",
    "./shared/rules/code-style.md",
    "./.opencode/instructions/project.md"
  ]
}
```

Los archivos pueden ser:

- **AGENTS.md**: instrucciones generales del proyecto
- **Reglas**: archivos en `shared/rules/` con estándares específicos
- **Guías**: documentos de arquitectura, convenciones, flujos
- **Contexto del proyecto**: descripción del dominio, equipo, objetivos

El orden en el array importa: los archivos se concatenan en ese orden en el prompt.

## El Key `references`

El key `references` permite compartir paths desde el repositorio central (`aramirez-ai`) hacia cualquier proyecto que instale el harness. Hace que scripts, reglas y prompts estén disponibles sin copiar archivos duplicados.

```json
{
  "references": [
    {
      "name": "shared-scripts",
      "path": "../shared/scripts",
      "description": "Scripts reutilizables de automatización"
    },
    {
      "name": "shared-rules",
      "path": "../shared/rules",
      "description": "Estándares de codificación y documentación"
    },
    {
      "name": "shared-prompts",
      "path": "../shared/prompts",
      "description": "Fragmentos de prompt reutilizables"
    }
  ]
}
```

Las referencias son **solo lectura**: el agente puede usar los archivos como guía pero debe copiarlos al proyecto para modificarlos.

## Prompt Fragments

Los archivos en `shared/prompts/` son fragmentos markdown simples **sin frontmatter**. Sirven para patrones que se repiten en múltiples contextos:

```markdown
# shared/prompts/commit-msg.md

Escribe mensajes de commit siguiendo Conventional Commits:

<tipo>(<alcance>): <descripción>

Tipos: feat, fix, chore, docs, refactor, test, style
```

No tienen frontmatter porque no se cargan bajo demanda como los skills — se incluyen directamente en templates o instrucciones.

## Reglas de Codificación

Los archivos en `shared/rules/` definen estándares que aplican a **todos los agentes** del proyecto:

```markdown
# shared/rules/code-style.md

- Usar TypeScript estricto
- 2 espacios de indentación
- Nombres en camelCase para variables, PascalCase para clases
- Tests obligatorios para toda lógica nueva
```

Las reglas se incluyen vía `instructions` en `opencode.json` y aplican globalmente.

## Diferencia entre Skills, Prompts y Reglas

| Tipo | Frontmatter | Carga | Ámbito | Uso |
|------|-------------|-------|--------|-----|
| **Skill** | Sí (`name`, `description`, `license`) | Bajo demanda vía skill tool | Agente individual | Instrucciones especializadas reutilizables |
| **Prompt** | No | Inline en templates/instrucciones | Template o contexto específico | Fragmentos reutilizables para patrones de interacción |
| **Rule** | No | Via `instructions` en opencode.json | Todos los agentes del proyecto | Estándares y convenciones del equipo |

## Scripts de Creación

### instructions-creator

```bash
node .opencode/scripts/create-instructions.js \
  --type api \
  --language typescript \
  --description "API REST con Express" \
  --output ./AGENTS.md
```

Genera un `AGENTS.md` con instrucciones adaptadas al tipo de proyecto.

### reference-creator

```bash
node .opencode/scripts/create-reference.js \
  --name shared-rules \
  --path ../shared/rules \
  --description "Estándares de código del equipo"
```

Registra una referencia en `opencode.json`.

### prompt-creator

```bash
node .opencode/scripts/create-prompt.js \
  --name commit-msg \
  --content "Escribe un mensaje conventional commit"
```

Crea un archivo en `shared/prompts/` con el contenido especificado.

### rule-creator

```bash
node .opencode/scripts/create-rule.js \
  --name code-style \
  --content "# Code style\n\n## General\n- Sigue patrones existentes\n- Usa TypeScript estricto"
```

Crea un archivo en `shared/rules/` con el contenido especificado.

## Práctica

1. Crea un `AGENTS.md` para tu proyecto usando `create-instructions.js`
2. Agrega 2 referencias: `shared-scripts` y `shared-rules`
3. Crea 2 prompts: `commit-msg` y `review-checklist`
4. Crea 1 regla: `code-style`
5. Verifica que `opencode debug config` muestra todo correctamente

## Resumen

Los mecanismos de instrucciones, referencias, prompts y reglas forman la capa de conocimiento del harness. Las instrucciones definen el comportamiento del agente vía `AGENTS.md` y archivos incluidos. Las referencias exponen recursos del repositorio central sin duplicación. Los prompts proporcionan fragmentos reutilizables para patrones de interacción. Las reglas establecen estándares que aplican a todos los agentes. A diferencia de los skills (carga bajo demanda con frontmatter), prompts y reglas son contenido inline sin frontmatter que se inyecta directamente en el contexto.
