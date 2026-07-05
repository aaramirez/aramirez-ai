---
tags:
  - harness
created: 2026-07-05
---

# ¿Qué es un harness?

> **Objetivo**: Entender el concepto de harness en opencode, su anatomía y ejemplos de harness de la comunidad.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[03-Configuracion/01-opencode-json.md|opencode.json a fondo]]

## Resultado esperado

Saber qué componentes forman un harness y cómo se relacionan entre sí para definir el comportamiento completo de opencode en un proyecto.

## Definición

Un **harness** en opencode es la configuración completa que un proyecto necesita para funcionar con agentes de IA. Incluye:

- **Runtime**: qué modelo usar, cómo ejecutar comandos, cómo formatear código
- **Agentes**: quiénes son, qué pueden hacer, cómo colaboran
- **Skills**: qué conocimientos tienen los agentes
- **Permisos**: qué pueden y no pueden hacer
- **Comandos**: atajos para tareas repetitivas
- **MCP**: servidores de contexto y herramientas externas
- **Referencias**: rutas a scripts, reglas, prompts

## Anatomía de un harness

```
mi-proyecto/
├── opencode.json          ← Configuración principal
├── AGENTS.md              ← Instrucciones y workflow
├── .opencode/
│   ├── agents/            ← Prompts de agentes (archivos .md)
│   ├── skills/            ← Skills instaladas
│   ├── commands/          ← Comandos personalizados (alternativa .md)
│   └── plugins/           ← Plugins instalados
└── shared/
    ├── scripts/           ← Scripts reutilizables
    ├── prompts/           ← Fragmentos de prompt
    └── rules/             ← Reglas de codificación
```

## El harness de arai como referencia

El repositorio `aramirez-ai` es en sí mismo un harness completo. Puedes usarlo como referencia o punto de partida:

```bash
arai init mi-proyecto --template full
```

## Comunidad

- `anthropics/skills` — skills oficiales de ejemplo
- `betta-tech/byo-coding-agent` — construcción de agentes personalizados
- `anthropics/claude-quickstarts` — templates de inicio rápido

---

**Siguiente**: [[05-Harness/02-creator-scripts.md|Los 18 creator scripts]]
