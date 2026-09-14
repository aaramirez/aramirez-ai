---
name: modelos
description: Navigation guide for modelos-kb — mental models across disciplines, indexed for both topic lookup and problem-driven retrieval.
---

# Skill: Modelos Mentales — KB Navigation Guide

## Available Knowledge Base

### modelos-kb

| Sección | Modelos planeados | Enfoque |
|---------|--------------------|---------|
| 01-Pensamiento-General | 4 | Inversión, primeros principios, círculo de competencia, mapa≠territorio |
| 02-Numeracia-y-Probabilidad | 4 | Bayes, valor esperado, regresión a la media, tasas base |
| 03-Fisica-Quimica-y-Naturaleza | 4 | Equilibrio, masa crítica, energía de activación, inercia |
| 04-Biologia-y-Evolucion | 4 | Selección natural, Reina Roja, antifragilidad, ecosistemas/nichos |
| 05-Naturaleza-Humana-y-Sesgos | 4 | Incentivos, aversión a la pérdida, sesgo de confirmación, compromiso y consistencia |
| 06-Microeconomia-y-Negocios | 4 | Ventaja comparativa, economías de escala, efectos de red, fosos competitivos |
| 07-Estrategia-y-Competencia | 4 | Ciclo OODA, océano azul, guerra asimétrica, teoría de juegos |
| 08-Sistemas-y-Complejidad | 3 | Puntos de apalancamiento, retroalimentación, efectos de 2do orden (versión ligera — ver `sistemico-kb` para el desarrollo completo) |
| 09-Toma-de-Decisiones | 4 | Costo de oportunidad, margen de seguridad, pre-mortem, matriz Eisenhower |
| 10-Modelos-de-Producto-e-IA | 4 | Build-measure-learn IA, human-in-the-loop, economía del contexto, prompt como interfaz |
| 11-Grandes-Pensadores | 4 | Munger, Kahneman & Tversky, Taleb, Feynman |
| 12-Ruta-Aprendizaje | 4 | Itinerarios básico/intermedio/avanzado, recursos |

El estado real (escrito vs. pendiente) de cada modelo está en el `README.md` de su sección — no asumas que un modelo listado aquí ya tiene una nota completa.

## Dos modos de uso

### Modo 1 — Lookup por tema

Para "¿qué es el modelo X?" o "explícame Y": usa la tabla de arriba para ubicar la sección, luego lee la nota o su README.

### Modo 2 — Retrieval por problema (el modo principal de esta KB)

Para "tengo este problema, ¿cómo lo resuelvo?": **no** navegues sección por sección. Ve directo a `matriz-problema-modelos.md` en la raíz de `modelos-kb`. Esa tabla mapea arquetipos de problema (decisión bajo incertidumbre, priorización con recursos limitados, resistencia al cambio, diseño de un feature de IA, etc.) a los modelos concretos que aplican, ya cruzando disciplinas.

Regla dura: selecciona modelos de **al menos 2 disciplinas distintas** (idealmente 3+ para problemas complejos). Un solo modelo, por bueno que sea, casi siempre produce una recomendación sesgada — ese es justamente el punto del "latticework" de Munger (ver `11-Grandes-Pensadores`).

## Topic → Sección Mapping (para Modo 1)

| Tema | Sección |
|------|---------|
| Pensar al revés, primeros principios, círculo de competencia | 01-Pensamiento-General |
| Probabilidad, Bayes, valor esperado, tasas base | 02-Numeracia-y-Probabilidad |
| Equilibrio, masa crítica, energía de activación | 03-Fisica-Quimica-y-Naturaleza |
| Selección natural, antifragilidad, nichos | 04-Biologia-y-Evolucion |
| Sesgos cognitivos, incentivos, aversión a la pérdida | 05-Naturaleza-Humana-y-Sesgos |
| Ventaja comparativa, escala, efectos de red, fosos | 06-Microeconomia-y-Negocios |
| OODA, océano azul, guerra asimétrica, teoría de juegos | 07-Estrategia-y-Competencia |
| Puntos de apalancamiento, retroalimentación (versión rápida) | 08-Sistemas-y-Complejidad |
| Pensamiento sistémico profundo, arquetipos, dinámica de sistemas | **`sistemico-kb`** (KB distinta, no duplicada aquí) |
| Costo de oportunidad, margen de seguridad, pre-mortem, priorización | 09-Toma-de-Decisiones |
| Diseño de producto/feature de IA, human-in-the-loop | 10-Modelos-de-Producto-e-IA |
| Contexto histórico y autores (Munger, Kahneman, Taleb, Feynman) | 11-Grandes-Pensadores |
| Por dónde empezar / profundizar | 12-Ruta-Aprendizaje |

## Problema → Modelos (para Modo 2)

Ver `matriz-problema-modelos.md` en la raíz de `modelos-kb` para la tabla completa. Arquetipos ya definidos:

- Decisión bajo incertidumbre
- Priorización con recursos limitados
- Diagnóstico de causa raíz
- Diseño de incentivos / comportamiento organizacional
- Evaluar una estrategia competitiva
- Resistencia al cambio organizacional
- Diseñar un producto o feature de IA
- Validar una idea con pocos datos
- Decidir si escalar una iniciativa
- Evaluar si algo es sostenible en el tiempo

Si el problema no encaja en ninguno, no lo fuerces — trátalo como un arquetipo nuevo, elige modelos de ≥2 disciplinas por juicio directo, y sugiere agregar la fila a la matriz.

## Navigation Pattern

1. Empieza en `../modelos-kb/Index.md` para orientarte.
2. Para lookup por tema: sigue el README de la sección correspondiente.
3. Para retrieval por problema: ve directo a `matriz-problema-modelos.md`.
4. Lee las notas individuales seleccionadas; sigue `[[wikilinks]]` a modelos relacionados o en tensión.
5. Revisa el frontmatter `tags` y el campo `related` para conexiones explícitas.

## Frontmatter Schema (notas de modelo mental)

```yaml
---
title: "Nombre del modelo"
tags:
  - modelos/{seccion}          # ej. modelos/pensamiento-general
  - type/modelo-mental
  - disciplina/{origen}         # ej. economia, psicologia, biologia, estrategia, producto-ia
  - difficulty/{nivel}          # principiante, intermedio, avanzado
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Nombre de sección"
related:
  - "[[otro-modelo]]"
---
```

Secciones obligatorias del cuerpo: Definición, Origen/Disciplina, Cuándo aplicarlo, Cómo aplicarlo, Ejemplo aplicado, Modelos relacionados, Riesgos de mal uso/límites.
