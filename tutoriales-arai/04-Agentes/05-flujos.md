---
tags:
  - agentes
  - flujos
created: 2026-07-05
---

# Flujos de trabajo

> **Objetivo**: Configurar flujos de trabajo (workflows) en opencode: plan-first, TDD, hotfix y flujos personalizados.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[04-Agentes/04-arquitecturas.md|Arquitecturas multi-agente]]

## Resultado esperado

Definir flujos de trabajo personalizados que orquesten la secuencia de agentes y herramientas para tareas específicas.

## ¿Qué es un flujo?

Un flujo define la secuencia de pasos que siguen los agentes para completar una tarea. Incluye qué agente ejecuta cada paso, las transiciones entre pasos y las reglas de validación.

## Flujo Plan-First

1. **Plan** analiza el requerimiento y diseña la solución
2. **Build** implementa según el plan
3. **Reviewer** revisa el código
4. **Tester** ejecuta tests

```bash
node .opencode/scripts/create-flow.js --name plan-first --stages "plan,build,review,test"
```

## Flujo TDD

1. **Tester** escribe tests que fallan
2. **Build** implementa hasta que pasen
3. **Reviewer** verifica cobertura y calidad

```bash
node .opencode/scripts/create-flow.js --name tdd --stages "test,build,review"
```

## Flujo Hotfix

1. **Build** aplica el fix
2. **Reviewer** revisa el cambio
3. **Tester** ejecuta tests rápidos
4. **Deploy** (comando manual)

```bash
node .opencode/scripts/create-flow.js --name hotfix --stages "fix,review,test"
```

## Personalizado

```bash
node .opencode/scripts/create-flow.js \
  --name audit \
  --stages "security,build,document"
```

## Buenas prácticas

- Define flujos cortos y específicos
- Cada etapa debe tener un criterio de salida claro
- Usa subagentes con modelos más baratos para etapas de verificación
- Documenta los flujos en `AGENTS.md`

---

**Siguiente**: [[04-Agentes/06-uso-creators.md|Usar agent/subagent/specialized-agent/architecture/flow creators]]
