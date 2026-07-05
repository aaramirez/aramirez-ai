---
tags:
  - instalacion
  - existente
created: 2026-07-05
---

# Instalar en proyecto existente

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
