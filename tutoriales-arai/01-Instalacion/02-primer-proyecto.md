---
tags:
  - instalacion
  - init
  - primer-proyecto
created: 2026-07-05
---

# Crear tu primer proyecto

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

Esto agrega branding, assets visuales, y todas las skills pre-configuradas.

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
