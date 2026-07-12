---
tags:
  - instalacion
  - init
  - primer-proyecto
created: 2026-07-05
---

# Crear tu primer proyecto

> **Objetivo**: Usar `arai init` para escafoldar un proyecto nuevo con opencode y estructura de agente AI desde cero.

**⏱ Tiempo estimado**: 10 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: [[01-Instalacion/01-instalar-arai.md|Instalar arai]] completado

## Resultado esperado

Un nuevo directorio con la estructura completa de arai: `shared/`, `platforms/`, `AGENTS.md` y `opencode.json` listos para usar.



## Paso 1: Escafoldar un proyecto nuevo

```bash
arai init mi-proyecto
```

Esto crea el directorio `mi-proyecto/` con la estructura mínima:

```
mi-proyecto/
├── shared/
│   ├── prompts/
│   ├── rules/
│   └── scripts/
├── platforms/
│   └── opencode/
├── assets/
├── AGENTS.md
└── README.md
```

## Paso 2: Usar una plantilla completa

Si prefieres empezar con todo incluido:

```bash
arai init mi-proyecto-completo --template full
```

Esto agrega agents, commands, plugins, prompts, rules, scripts, skills, templates, brand.json, tui.json and also assets visuales.

## Paso 3: Agregar opencode al proyecto

Si ya tienes un proyecto existente:

```bash
cd mi-proyecto
arai install
```

## Paso 4: Ver el estado

```bash
arai status
```

Muestra qué componentes están instalados y sus versiones.

---

**Siguiente**: [[02-Comandos/Index|Comandos esenciales]]
