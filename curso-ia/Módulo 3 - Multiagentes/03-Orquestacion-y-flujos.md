# Orquestación y flujos

## ¿Qué es orquestación?

La **orquestación** es el proceso de coordinar múltiples agentes para completar un objetivo complejo. Cada agente hace su parte y pasa el resultado al siguiente.

> *"Orquestar es coreografiar agentes, no microgestionarlos."*

## Patrones de flujo

### 1. Flujo secuencial

```
Spec → Code → Review → Fix → Test → Docs → Commit
```

Cada paso valida el anterior antes de continuar.

### 2. Flujo paralelo

```
        → Reviewer
Code →  → Tester    → Merge → Deploy
        → Docs
```

Múltiples agentes trabajan simultáneamente.

### 3. Flujo iterativo

```
Code → Review → Fix ← (loop hasta aprobar)
        ↓
      Commit
```

Iteración hasta cumplir criterios.

## Comandos personalizados para flujos

Puedes crear comandos que ejecuten flujos completos:

### Commit con revisión

```bash
# Comando /commit
1. git add -A
2. Analizar cambios
3. Escribir mensaje conventional commit
4. Mostrar resumen
```

### Deploy con tests

```bash
# Comando /deploy
1. Ejecutar tests
2. Si pasan → construir y desplegar
3. Si fallan → reportar errores
```

## Especificaciones como hilo conductor

Las [[Módulo 1 — Fundamentos/05-Especificaciones|specs]] son el contrato entre agentes:

```
Agente Plan   → escribe spec
Agente Build  → lee spec, genera código
Agente Review → verifica código contra spec
Agente Test   → valida que cumple la spec
Agente Docs   → documenta basado en la spec
```

## Control de calidad en el flujo

```
1. Spec revisada por humano
2. Código revisado por agente reviewer
3. Tests automáticos
4. Revisión humana final antes de merge
5. Documentación generada y verificada
```

## Enlaces

- [[02-Subagentes-y-roles|Anterior: Subagentes y roles]]
- [[04-Caso-practico-completo|Siguiente: Caso práctico completo]]
- [[Módulo 1 — Fundamentos/05-Especificaciones|Spec-driven development]]
