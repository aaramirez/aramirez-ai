---
tags:
  - configuracion
  - runtime
created: 2026-07-05
---

# Configuración del runtime

> **Objetivo**: Configurar el runtime de opencode: tool_output, snapshot, auto-commits, compaction y referencias a proyectos externos.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[03-Configuracion/01-opencode-json.md|opencode.json a fondo]]

## Resultado esperado

Ajustar el comportamiento del runtime de opencode para optimizar el rendimiento, la gestión de memoria y la integración con otros proyectos.

## Compaction

La compactación reduce el contexto cuando se acerca al límite de tokens:

```json
"compaction": {
  "auto": true,
  "prune": false,
  "reserved_tokens_min": 12000
}
```

- `auto: true` — compacta automáticamente cuando es necesario
- `prune: true` — elimina mensajes antiguos (más agresivo)
- `reserved_tokens_min` — tokens mínimos reservados para la respuesta

## Tool output

Controla cuánta salida de herramientas se conserva:

```json
"tool_output": {
  "max_characters": 80000,
  "max_tool_output": 50000
}
```

## Snapshot

Guarda el estado del proyecto para reanudar sesiones:

```json
"snapshot": {
  "enabled": true,
  "paths": ["src/", "shared/"]
}
```

## Watcher

Monitorea cambios en el sistema de archivos:

```json
"watcher": {
  "enabled": true,
  "paths": ["src/", "*.json"]
}
```

## Auto-commits

Configuración de commits automáticos de opencode:

```json
"auto_commits": {
  "enabled": true,
  "message_prefix": "opencode: "
}
```

## Capas de configuración

Las configuraciones se fusionan en este orden (de menor a mayor prioridad):

1. **Remota** — configuración del workspace compartido
2. **Global** — `~/.config/opencode/opencode.json`
3. **Custom** — archivo custom especificado por el usuario
4. **Proyecto** — `opencode.json` en la raíz del proyecto
5. **`.opencode/`** — configuraciones locales del proyecto
6. **Managed** — configuraciones gestionadas por herramientas

---

**Siguiente**: [[03-Configuracion/04-uso-config-creator.md|Usar config-creator]]
