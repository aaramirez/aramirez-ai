---
name: soev
description: Navigation guide for the SOEV knowledge base (Sistema Organizacional de Entrega de Valor) — principles, leadership, operating model, governance, value delivery, measurement, learning and adoption, indexed for topic lookup and problem-driven retrieval.
license: MIT
---

# Skill: SOEV — KB Navigation Guide

## Available Knowledge Base

### soev (`../soev/`)

Repo standalone [`aaramirez/soev`](https://github.com/aaramirez/soev) (privado). Cuerpo de conocimiento del **SOEV — Sistema Organizacional de Entrega de Valor**: un sistema organizacional basado en principios para convertir estrategia en valor de forma continua. No es una metodología: define las condiciones para que distintas metodologías coexistan.

**Ciclo central:** Estrategia → Decisión → Ejecución → Valor → Medición → Aprendizaje → Adaptación → Estrategia.

Archivos raíz: `Index.md`, `matriz-problema-conocimiento.md`, `soev-glossary.md`, `soev-timeline.md`, `como-usar-este-kb.md`. Plantillas en `Templates/`.

## El campo `estado` (léelo siempre)

| `estado` | Qué es | Cómo tratarlo |
|----------|--------|---------------|
| `canonico` | Texto literal de los documentos fundacionales: `carta-fundacional-manifiesto`, `carta-fundacional-desarrollada`, `principios-organizacionales` | Máxima autoridad; cítalo textual |
| `reconstruido` | La sección **Enunciado SOEV** es el texto de la v0.3 reconstruida; el resto de la nota es desarrollo de la KB | El enunciado manda; presenta el desarrollo como interpretación |
| `antecedente` | `antecedentes-ideal-operativo`: modelo previo de una gerencia de tecnología concreta | Contexto, no doctrina SOEV |

## Dos modos de uso

### Modo 1 — Lookup por tema

Para "¿qué dice el SOEV sobre X?": usa la tabla de secciones de abajo y lee la nota; empieza por su Enunciado SOEV.

### Modo 2 — Retrieval por problema (el modo principal)

Para "tengo este problema en mi organización, ¿cómo lo aborda el SOEV?": ve a `matriz-problema-conocimiento.md`, que mapea problemas (transformación ágil sin resultados, roles confusos, todo es prioridad 1, dependencia de personas clave, retrospectivas que no cambian nada…) a las notas que aplican.

## Secciones → notas

| Sección (tag) | Notas |
|---------------|-------|
| `00-Fundamentos` (`soev/fundamentos`) | que-es-el-soev, carta-fundacional-manifiesto, carta-fundacional-desarrollada, principios-filosoficos, principios-organizacionales, principios-operativos, preguntas-del-compromiso, arquitectura-conceptual, historia-del-soev, antecedentes-ideal-operativo |
| `01-Liderazgo-y-Cultura` (`soev/liderazgo`) | liderazgo-soev, cultura-organizacional, management-3-0 |
| `02-Modelo-Operativo` (`soev/modelo-operativo`) | modelo-operativo-soev, flujo-de-valor, modelo-hibrido, roles-y-responsabilidades |
| `03-Gobierno` (`soev/gobierno`) | gobierno-soev, sistema-de-decisiones, portfolio, priorizacion |
| `04-Entrega-de-Valor` (`soev/entrega-de-valor`) | producto, proyectos, arquitectura, ingenieria, qa, operaciones |
| `05-Medicion` (`soev/medicion`) | sistema-de-medicion, metricas-de-flujo, metricas-de-valor |
| `06-Aprendizaje` (`soev/aprendizaje`) | aprendizaje-organizacional, gestion-del-conocimiento, mejora-continua |
| `07-Implementacion` (`soev/implementacion`) | metodo-de-implementacion, roadmap-de-adopcion, modelo-de-madurez, plan-de-entrenamiento |
| `Templates/` | plantilla-hipotesis-de-valor, plantilla-iniciativa, plantilla-decision-record, plantilla-retrospectiva, plantilla-assessment |

## Los principios como criterio de decisión

Toda recomendación debe poder rastrearse a un principio. Los seis organizacionales (canónicos): **1** Sistema antes que partes · **2** Valor antes que actividad · **3** Simplicidad como ventaja · **4** Autonomía con contexto · **5** Decisiones explícitas · **6** Conocimiento compartido. Y el filtro de las **preguntas del compromiso** antes de proponer cualquier práctica nueva: ¿qué problema resuelve?, ¿qué valor genera?, ¿qué costo introduce?, ¿cómo sabremos que funciona?

## Navigation Pattern

1. Empieza en `../soev/Index.md` para orientarte.
2. Lookup por tema: sección → nota → Enunciado SOEV.
3. Retrieval por problema: `matriz-problema-conocimiento.md` → notas.
4. Si el problema no encaja en ninguna fila, no lo fuerces: elige notas por sección y sugiere agregar la fila a la matriz.
5. Si el SOEV no cubre algo (capacidades, tecnología/IA, patrones: ver `ROADMAP.md`), dilo; no lo inventes como doctrina SOEV.
