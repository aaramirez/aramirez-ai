# Agents y agents.md

## Idea central

El archivo `agents.md` (o `AGENTS.md`) es el **cerebro de tu proyecto** para OpenCode. Define cómo deben comportarse los agentes, qué reglas seguir y qué contexto conocer.

> *"El agents.md es lo que transforma a OpenCode de un asistente genérico a un experto en tu proyecto."* — Midudev

## ¿Qué es agents.md?

Es un archivo en la raíz del proyecto que contiene **instrucciones permanentes** para el agente. Cada vez que interactúas con OpenCode, este archivo se carga como contexto.

```markdown
# Project: Running App

## Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + SQLite
- Tests: Vitest

## Convenciones
- Nomenclatura: camelCase para funciones, PascalCase para componentes
- Tests junto al código: `Component.test.tsx`
- Commits en español con formato convencional

## Reglas
- No usar librerías externas sin aprobación
- Mantener cobertura de tests > 80%
- Documentar APIs con JSDoc
```

## Estructura recomendada

```
AGENTS.md (o agents.md)
├── Descripción del proyecto
├── Stack tecnológico
├── Convenciones de código
├── Reglas y restricciones
├── Arquitectura / estructura de carpetas
└── Enlaces a documentación relevante
```

## Configuración de agentes en opencode.json

Junto con `agents.md`, puedes definir agentes específicos en la configuración:

```json
{
  "agent": {
    "build": {
      "mode": "primary",
      "description": "Agente principal de desarrollo"
    },
    "reviewer": {
      "mode": "subagent",
      "description": "Revisor de código",
      "permission": {
        "edit": "deny"
      }
    },
    "tester": {
      "mode": "subagent",
      "description": "Ejecuta tests",
      "permission": {
        "bash": "allow"
      }
    }
  }
}
```

### Tipos de agente

| Agente | Modo | Rol |
|--------|------|-----|
| **build** | primary | Construye y modifica el proyecto |
| **plan** | primary | Solo planifica (sin editar) |
| **reviewer** | subagent | Revisa código sin modificarlo |
| **tester** | subagent | Ejecuta tests y reporta |
| **docs** | subagent | Genera documentación |

## Buenas prácticas para agents.md

1. **Sé específico**: cuanto más detalle, mejores respuestas
2. **Actualiza con el proyecto**: el agents.md debe evolucionar
3. **Incluye ejemplos**: muestra cómo quieres el código
4. **Define lo que NO hacer**: tan importante como lo que sí

## El agents.md como documentación viva

El `agents.md` sirve también como documentación para otros desarrolladores:

- Nuevos miembros del equipo lo leen para entender el proyecto
- Define el estándar de calidad del proyecto
- Se puede versionar en git

## Enlaces

- [[06-Modelos-y-suscripciones|Anterior: Modelos y suscripciones]]
- [[08-Skills-personalizadas|Siguiente: Skills personalizadas]]
- [[Módulo 2 — Agentes/02-Configuracion-de-agentes|Configuración de agentes]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 5
