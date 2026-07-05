---
tags:
  - instalacion
  - existente
created: 2026-07-05
---

# Instalar en proyecto existente

> **Objetivo**: Agregar opencode y la configuración de arai a un proyecto que ya tienes en desarrollo, sin perder la configuración existente.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: Node.js 18+, Git, proyecto existente

## Resultado esperado

Tu proyecto existente tendrá `opencode.json` y `.opencode/` configurados, con la misma estructura de agentes que un proyecto creado con `arai init`.

## Paso 1: Posicionarse en el proyecto

```bash
cd mi-proyecto-existente
```

## Paso 2: Instalar opencode + arai

```bash
arai install
```

Esto copia:
- `opencode.json` → raíz del proyecto
- `.opencode/agents/` → prompts de agentes
- `.opencode/skills/` → skills instaladas
- `shared/` → scripts, prompts, rules
- `AGENTS.md` → instrucciones del proyecto

## Paso 3: Instalar componentes adicionales

```bash
arai install skill youtube
arai install agent build
arai install script mi-script
arai install prompt commit-msg
arai install rule code-style
```

## Paso 4: Verificar

```bash
arai status
```

## Flags útiles

```bash
arai install --project /ruta/al/proyecto   # Instalar en otro directorio
```

---

**Siguiente**: [[01-Instalacion/04-solucion-problemas.md|Solución de problemas comunes]]
