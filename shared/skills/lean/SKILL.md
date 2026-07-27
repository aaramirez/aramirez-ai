---
name: lean
description: Navigation guide for Lean knowledge bases — lean-kb, leanc-kb, mgmt3-kb.
---

# Skill: Lean — KB Navigation Guide

## Available Knowledge Bases

### lean-kb (208 files)

| Section | Files | Topics |
|---------|-------|--------|
| 01-Fundamentos | 16 | What is Lean, TPS, Toyota Way, 5 principles, value, flow |
| 02-Pilares | 9 | Just-in-Time, Jidoka, Kaizen, House of Lean |
| 03-Desperdicios | 15 | 3M (Muda/Mura/Muri), 8 wastes, identification |
| 04-Herramientas | 36 | 5S, Andon, PDCA, Gemba, Kanban, Poka-Yoke, SMED, VSM |
| 05-Vertientes | 89 | 13 branches: Manufacturing, Six Sigma, Startup, Software, Healthcare, Construction, IT, Government, Education, Agile-Lean, Lean 4.0, **Lean Change**, Lean Coffee |
| 06-Complementarias | 12 | Six Sigma, Theory of Constraints, TQM, FMEA |
| 07-Implementacion | 20 | Transformation, Shingo model, maturity, Hoshin Kanri, KPIs |
| 08-Ruta-Aprendizaje | 7 | Learning paths, certifications, self-assessment |

### leanc-kb (52 files)

| Section | Files | Topics |
|---------|-------|--------|
| 01-Fundamentos | 6 | What is LCM, evolution, lean thinking for change |
| 02-Modelos | 6 | Kotter 8-step, Lean Change Framework (Little), Change Agility (Lohse), ADKAR |
| 03-Herramientas | 9 | Change experiments, change canvas, resistance map, Gemba for change |
| 04-Resistencia | 5 | Types, sources, strategies, resistance as signal |
| 05-Agente-Cambio | 5 | Role, profile, guiding coalition, change leadership |
| 06-Implementacion | 6 | Kotter steps, Lean Change cycle, adoption metrics |
| 07-Casos-Ejemplos | 5 | Agile transformation, SaaS adoption, restructuring |
| 08-Ruta-Aprendizaje | 5 | Learning paths |

### mgmt3-kb (124 files)

| Section | Files | Topics |
|---------|-------|--------|
| 01-Fundamentos | 13 | What is M3.0, evolution, 5 principles, Cynefin |
| 02-Seis-Vistas | 8 | Energize, empower, align, develop, grow, improve |
| 03-Motivacion | 15 | Drive model, Champfrogs, Happiness Index, Kudo Cards |
| 04-Delegacion | 13 | 7 levels of authority, Delegation Poker, self-organization |
| 05-Objetivos | 11 | OKRs, health metrics, feedback |
| 06-Competencia | 11 | Competence trees, skill assessment |
| 07-Estructura | 11 | Team topology, communities of practice, guilds |
| 08-Gestion-Cambio | 13 | Change Management Game, celebration grids, experimentation |
| 09-Implementacion | 11 | M3.0 implementation, transformation roadmap |
| 10-Ruta-Aprendizaje | 7 | Learning paths, certifications |
| 11-Libros-Recursos | 7 | Book reviews, podcasts |

## Topic → KB Mapping

Use this table to find which KB to search:

| Topic | Primary KB | Section |
|-------|-----------|---------|
| ¿Qué es Lean? | lean-kb | 01-Fundamentos |
| Pilares del Sistema Toyota | lean-kb | 02-Pilares |
| Los 8 desperdicios | lean-kb | 03-Desperdicios |
| Kanban, 5S, VSM, PDCA, Gemba | lean-kb | 04-Herramientas |
| Lean Six Sigma | lean-kb | 05-Vertientes/5b |
| Lean Startup | lean-kb | 05-Vertientes/5c |
| Lean Software | lean-kb | 05-Vertientes/5d |
| SAFe, Scrum & Lean | lean-kb | 05-Vertientes/5j |
| Lean Change Management | leanc-kb | 01-06 (primary) |
| Change Agility | leanc-kb | 02-Modelos |
| Resistencia al cambio | leanc-kb | 04-Resistencia |
| Agente de cambio | leanc-kb | 05-Agente-Cambio |
| Management 3.0 | mgmt3-kb | 01-Fundamentos |
| Motivación y engagement | mgmt3-kb | 03-Motivacion |
| Delegación y empoderamiento | mgmt3-kb | 04-Delegacion |
| OKRs y métricas | mgmt3-kb | 05-Objetivos |
| Estructura organizacional | mgmt3-kb | 07-Estructura |
| Gestión del cambio (M3.0) | mgmt3-kb | 08-Gestion-Cambio |
| Implementación Lean | lean-kb/07, leanc-kb/06, mgmt3-kb/09 |

## Navigation Pattern

1. Start from `../kb/{kb-name}/Index.md` for overview
2. Follow section READMEs for structure
3. Read individual notes for detailed content
4. Follow `[[wikilinks]]` for related topics
5. Check frontmatter `tags` for categorization
6. Check `related` field for explicit connections

## Frontmatter Schema

All KB files use this structure:

```yaml
---
title: "Human-readable title"
tags:
  - {kb-name}/{section}    # e.g., lean/fundamentos
  - type/{type}             # concepto, herramienta, indice, guia
  - difficulty/{level}      # principiante, intermedio, avanzado
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Section Name"
related:
  - "[[note-wikilink]]"
---
```
