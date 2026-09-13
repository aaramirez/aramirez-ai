# Plan: modelos-kb — Base de Conocimiento de Modelos Mentales para Resolución de Problemas

## Objective

Crear `modelos-kb` (repo standalone en `../modelos-kb`, hermano de `aramirez-ai`, igual que `gda-kb`/`corpfibex-kb`) documentando modelos mentales multidisciplinarios de forma que la IA no solo pueda "consultarlos" sino **aplicarlos activamente** para proponer soluciones a problemas concretos. Esto requiere, además de la KB, un paquete distribuible en `shared/` (agente + subagente + skill + comando) que formalice el flujo "problema → modelos relevantes → recomendación sintetizada", siguiendo el patrón ya usado por `lean`/`lean-expert`.

## Requirements

1. Estructura estándar de KB en `../modelos-kb` vía `kb-init.js` (Index, glosario, timeline, secciones numeradas, `references/`) — priority: high
2. Taxonomía combinada: multidisciplinaria amplia (Farnam Street/Munger) **+** enfocada en negocio/consultoría/IA, sin elegir una sobre la otra — priority: high
3. Template de nota de "modelo mental" extendido más allá del genérico de KB: debe incluir señales de cuándo se activa, cómo aplicarlo paso a paso, y riesgos de mal uso — esto es lo que lo hace accionable, no solo informativo — priority: high
4. Nota-índice cruzada `matriz-problema-modelos.md`: mapea arquetipos de problema → modelos recomendados, para que la IA no tenga que leer todo el vault — priority: high
5. Contenido semilla: modelos ya redactados (no stubs) para las categorías iniciales — priority: high
6. Paquete distribuible en `aramirez-ai/shared/`: agente primario `modelos`, subagente `modelos-expert`, skill `modelos-mentales`, comando `/modelos` — priority: high
7. Registro en `repos.json` y en las tablas de `AGENTS.md` (agentes + skills) — priority: medium
8. No duplicar `sistemico-kb` (pensamiento sistémico ya cubierto ahí): la sección de sistemas en `modelos-kb` queda ligera y cruza-referencia en vez de repetir — priority: medium

## Architecture

### Taxonomía combinada (12 secciones)

| # | Sección | Origen de la propuesta | Enfoque |
|---|---------|------------------------|---------|
| 01 | Pensamiento-General | Amplia (Munger) | Inversión, primeros principios, círculo de competencia, mapa≠territorio |
| 02 | Numeracia-y-Probabilidad | Amplia | Bayes, valor esperado, regresión a la media, tasas base |
| 03 | Fisica-Quimica-y-Naturaleza | Amplia | Equilibrio, masa crítica, energía de activación, inercia |
| 04 | Biologia-y-Evolucion | Amplia | Selección natural, efecto Reina Roja, antifragilidad, ecosistemas/nichos |
| 05 | Naturaleza-Humana-y-Sesgos | Amplia | Incentivos, aversión a la pérdida, sesgo de confirmación, compromiso y consistencia |
| 06 | Microeconomia-y-Negocios | Ambas | Ventaja comparativa, economías de escala, efectos de red, fosos competitivos |
| 07 | Estrategia-y-Competencia | Ambas | Ciclo OODA, océano azul, guerra asimétrica, teoría de juegos |
| 08 | Sistemas-y-Complejidad (ligera) | Ambas | Puntos de apalancamiento, retroalimentación, efectos de 2do orden — cruza a `sistemico-kb` |
| 09 | Toma-de-Decisiones | Enfocada | Costo de oportunidad, margen de seguridad, pre-mortem, matriz Eisenhower |
| 10 | Modelos-de-Producto-e-IA | Enfocada (propia) | Build-measure-learn para IA, human-in-the-loop, economía del contexto, prompt como interfaz |
| 11 | Grandes-Pensadores | Ambas | Munger, Kahneman & Tversky, Taleb, Feynman |
| 12 | Ruta-Aprendizaje | Estándar KB | Itinerarios básico/intermedio/avanzado, recursos |

Cada sección lleva su `README.md` (igual que `sistemico-kb`/`mgmt3-kb`).

### Template de nota de modelo mental (extiende el estándar de `kb-management`)

```yaml
---
title: "Nombre del modelo"
tags:
  - modelos/<seccion>
  - type/modelo-mental
  - disciplina/<origen>       # ej. economia, psicologia, biologia
  - difficulty/<nivel>
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Nombre de sección"
related:
  - "[[otro-modelo]]"
---

# Nombre del modelo

## Definición
## Origen / Disciplina
## Cuándo aplicarlo          <- señales de activación (lo que la IA usa para "engancharlo" a un problema)
## Cómo aplicarlo             <- pasos concretos
## Ejemplo aplicado
## Modelos relacionados       <- complementarios y en tensión (wikilinks)
## Riesgos de mal uso / límites
```

### `matriz-problema-modelos.md` — backbone de recuperación

Tabla con filas = arquetipos de problema, columnas = modelos recomendados (wikilinks) + sección. Arquetipos iniciales:

- Decisión bajo incertidumbre → Pensamiento Bayesiano, Valor Esperado, Margen de Seguridad
- Priorización con recursos limitados → Costo de Oportunidad, Matriz Eisenhower, Ventaja Comparativa
- Diagnóstico de causa raíz → Primeros Principios, Efectos de 2do Orden, Puntos de Apalancamiento
- Diseño de incentivos / comportamiento organizacional → Incentivos, Aversión a la Pérdida, Compromiso y Consistencia
- Evaluar una estrategia competitiva → Océano Azul, Ciclo OODA, Fosos Competitivos, Teoría de Juegos
- Resistencia al cambio → Incentivos, Compromiso y Consistencia, Efecto Reina Roja
- Diseñar un producto/feature de IA → Build-Measure-Learn IA, Human-in-the-loop, Economía del Contexto
- Validar una idea con pocos datos → Tasas Base, Regresión a la Media, Antifragilidad

Este archivo crece con el tiempo; el diseño es que cada fila apunte a modelos que ya existen (no promesas).

### Paquete distribuible en `shared/` (mismo patrón que `lean`/`lean-expert`)

| Archivo | Rol | Notas |
|---------|-----|-------|
| `shared/agents/modelos.md` | primary | Responde preguntas directas sobre un modelo; para problemas, aplica el flujo de abajo |
| `shared/agents/modelos-expert.md` | subagent | Se delega cuando el problema cruza ≥3 disciplinas o hay modelos en tensión que requieren síntesis |
| `shared/skills/modelos-mentales/SKILL.md` | skill | Guía de navegación de la KB + la matriz problema→modelos (equivalente al "Topic → KB Mapping" de `lean`) |
| `shared/commands/modelos.md` | command | `/modelos <problema>` — dispara el flujo de aplicación |

### Flujo de aplicación (lo que hace accionable la KB)

1. Recibe el problema planteado por el usuario.
2. Consulta `matriz-problema-modelos.md` (vía skill) para identificar arquetipo(s) y modelos candidatos.
3. Selecciona 3–6 modelos de **al menos 2 disciplinas distintas** (principio de latticework de Munger: nunca un solo modelo).
4. Por cada modelo: por qué aplica a este caso + qué sugiere concretamente.
5. Sintetiza en una recomendación única; si los modelos sugieren cosas contradictorias, lo señala explícitamente en vez de ocultarlo.
6. Cita los modelos usados (wikilink + sección) para que el usuario pueda profundizar.
7. Si la pregunta es solo "explícame el modelo X" (no un problema a resolver), responde directo sin forzar el flujo completo — igual que `lean` distingue consulta simple vs. delegación a `lean-expert`.

## Decisions

1. **Repo standalone**, no anidado en `P/kb` — el usuario lo pidió explícitamente en `P/modelos-kb`; sigue el patrón de `gda-kb`/`corpfibex-kb`, no el monorepo de `kb/`.
2. **Fusionar ambas taxonomías** en vez de elegir una — confirmado por el usuario.
3. **Sección de Sistemas ligera**: solo 3–4 notas de aplicación rápida, cruzando a `sistemico-kb` para el desarrollo profundo — evita mantener dos versiones del mismo contenido.
4. **Contenido semilla completo, no stubs**: cada nota de la Fase 2 se escribe con el template completo; una KB de títulos vacíos no sirve para que la IA proponga nada.
5. **Replicar el patrón de 4 capas de `lean`** (agent/subagent/skill/command) para consistencia con lo ya establecido en `aramirez-ai/shared/`, en vez de inventar un mecanismo nuevo.
6. **Contenido en español**, igual que el resto de las KBs y agentes existentes.
7. **Ejecución en fases** (ver abajo) para poder revisar la estructura antes de invertir el esfuerzo de redactar ~50 notas.

## Phases

- **Fase 1 — Fundación** (scaffolding + esqueleto navegable, sin contenido de modelos aún):
  - `kb-init.js modelos-kb --prefix modelos --description "..."`
  - 12 `README.md` de sección con la lista de modelos planeados (aún sin nota propia)
  - `matriz-problema-modelos.md` con los arquetipos definidos (links pendientes se marcan)
  - Paquete `shared/` completo (agent, subagent, skill, command)
  - Registro en `repos.json` + `AGENTS.md`
- **Fase 2 — Contenido semilla**: ~4 modelos por sección (secciones 01–07, 09–11) + 3–4 en la sección 08 (sistemas, ligera) + 3–4 notas de ruta de aprendizaje ≈ **48–52 notas** con el template completo, enlazadas desde la matriz.
- **Fase 3 — Expansión continua**: agregar modelos nuevos según necesidad real de casos de uso (no se planifica de antemano; sigue las convenciones de `kb-management`).

## File Changes

### New
- `../modelos-kb/` — Index.md, como-usar-este-kb.md, modelos-glossary.md, modelos-timeline.md, `references/`, 12 secciones numeradas con README + notas, `matriz-problema-modelos.md`
- `shared/agents/modelos.md`
- `shared/agents/modelos-expert.md`
- `shared/skills/modelos-mentales/SKILL.md`
- `shared/commands/modelos.md`

### Modified
- `repos.json` — nueva entrada `aaramirez/modelos-kb`
- `AGENTS.md` — filas para `modelos`/`modelos-expert` en tabla de agentes, `modelos-mentales` en tabla de skills

## Verification

- [ ] `node shared/skills/kb-management/scripts/kb-init.js modelos-kb --prefix modelos --description "..."` crea la estructura estándar en `../modelos-kb`
- [ ] `kb-sync.js --validate ../modelos-kb` sin wikilinks rotos
- [ ] Cada nota de modelo (Fase 2) tiene las 7 secciones del template y al menos un `related`
- [ ] Cada fila de `matriz-problema-modelos.md` enlaza a notas que existen
- [ ] `shared/agents/modelos.md`, `modelos-expert.md`, skill y command replican la estructura de `lean` (frontmatter, permisos, secciones)
- [ ] `repos.json` y `AGENTS.md` actualizados
- [ ] Prueba de humo: invocar el flujo con un problema real de ejemplo y confirmar que cita ≥3 modelos de ≥2 disciplinas y produce una recomendación sintetizada

## Estimated Effort

- Fase 1 (fundación + paquete shared + registro): ~45–60 min
- Fase 2 (48–52 notas con contenido real): ~3–4 h (redacción es el costo dominante, no la mecánica)
- Fase 3: continuo, sin estimado fijo
