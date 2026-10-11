---
name: arnes
description: Navigation guide for arnes-kb — harness engineering (the context, tools, memory, loops, evals, sandbox and orchestration around a model that make it a reliable agent), built from 57 YouTube talks, indexed for topic lookup and problem-driven retrieval.
license: MIT
---

# Skill: Arnés — KB Navigation Guide

## Available Knowledge Base

### arnes-kb (`../kb/arnes-kb/`)

Sección del repo `kb` construida a partir de los 57 videos de la playlist [Harness](https://www.youtube.com/playlist?list=PLQ-6al9D-7mk). Cada video tiene dos archivos:

| Carpeta | Contenido |
|---------|-----------|
| `02-Notas/<slug>.md` | Nota en español: Resumen, Contenido estructurado, Conceptos clave, Herramientas y referencias, Referencias |
| `01-Transcripciones/<videoId> - <slug>.md` | Transcripción fiel en el idioma original, con timestamps `[M:SS]` y secciones `##` — la fuente para verificar citas |

Archivos raíz: `Index.md` (videos por tema y tabla de la playlist), `matriz-problema-conocimiento.md` (problema → notas), `como-usar-este-kb.md`.

A diferencia de las KBs genéricas (chatbots, telco), esta KB **sí nombra personas, empresas y productos reales**: cada nota resume lo que dice un ponente concreto (Ryan Lopopolo, Harrison Chase, Armin Ronacher…) sobre herramientas concretas (Claude Code, Pi, LangChain, Eve, Paperclip…). Son opiniones y experiencias de ponentes, no estándares: atribúyelas siempre.

## Dos modos de uso

### Modo 1 — Lookup por tema

Para "¿qué es X?" o "¿qué dicen sobre Y?": usa la tabla de tags de abajo o el grupo correspondiente en `Index.md`, y lee las notas.

### Modo 2 — Retrieval por problema (el modo principal)

Para "tengo este problema con mi agente, ¿cómo lo resuelvo?": ve directo a `matriz-problema-conocimiento.md`. Mapea problemas concretos (diagnosticar fallos, gestionar memoria, evals, orquestar agentes, llevar a producción) a las notas que aplican, ya cruzando temas.

## Tags de tema → enfoque (para Modo 1)

| Tag | Enfoque | Notas de entrada |
|-----|---------|------------------|
| `arnes/fundamentos` | Qué es un harness, componentes, harness vs. modelo/framework | que-es-harness-engineering, masterclass-de-harness-engineering, que-es-un-agent-harness-y-como-construirlo |
| `arnes/construccion` | Construir un harness: bucle, tools, permisos, implementaciones | construir-un-harness-de-codigo-desde-cero, construyendo-mi-propio-arnes-de-ia, harnesses-en-ia-a-fondo-ibm |
| `arnes/contexto-y-memoria` | Contexto, context rot, compactación, memoria, recuperación | memoria-de-agentes-y-harness-engineering, harness-engineering-a-fondo, alternativa-a-bases-de-datos-vectoriales |
| `arnes/herramientas-y-sandbox` | Diseño de tools, sandbox, permisos, secretos | demo-practica-de-harness-engineering, flujo-agentico-de-matt-pocock, meta-harness-para-ejecutar-agentes |
| `arnes/evals-y-observabilidad` | Evals, verificadores, LLM como juez, trazas, automejora | evals-fluidez-en-ia, loop-de-5-pasos-agente-legal, agentes-automejorables-evolucionar-el-harness |
| `arnes/orquestacion-multiagente` | Subagentes, roles, meta-harnesses, agentes como equipo | adaptando-claude-code-para-sdd, paperclip, anthropic-y-el-fin-de-los-harnesses |
| `arnes/fabricas-de-software` | Agentes que escriben todo el código, métricas de autonomía | como-construir-una-fabrica-de-software, humanos-dirigen-agentes-ejecutan-openai, por-que-fallan-las-fabricas-de-software |
| `arnes/flujos-de-trabajo` | Cómo trabajar a diario con agentes de código | 29-consejos-de-harness-engineering, flujo-de-ingenieria-agentica-del-creador-de-pi |
| `arnes/ontologias` | Ontologías como capa semántica y validador | ontologias-para-sistemas-agenticos, casos-de-uso-de-ontologias-crm-erp |
| `arnes/frameworks` | Frameworks y harnesses concretos (Pi, Eve, DeepSeek, Jev, AgentCore…) | agentes-con-eve-y-nextjs, deepseek-nueva-generacion-de-agentes-de-codigo, jaula-de-produccion-para-agentes-de-dominio |
| `arnes/produccion` | Operar agentes en producción | seis-pilares-de-un-harness-para-produccion, jaula-de-produccion-para-agentes-de-dominio |
| `arnes/opinion` | Posturas y críticas (lock-in, escepticismo, economía) | por-que-cancele-claude-code, code-loops-y-harness-autodidacta |

## Problema → Conocimiento (para Modo 2)

Ver `matriz-problema-conocimiento.md`. Arquetipos ya definidos:

- Entender qué es un harness y en qué se diferencia del modelo, el prompt o un framework
- Elegir un modelo mental de componentes o capas del harness
- El agente falla y no sé si es el modelo o el harness
- Construir un harness desde cero
- Decidir si construir uno propio, extender uno existente o usar un framework
- Gestionar contexto y memoria
- Recuperar información para el agente (RAG, búsqueda, índices)
- Diseñar herramientas, sandbox y permisos seguros
- Hacer fiable un agente sin cambiar prompt ni modelo
- Medir y mejorar el agente con evals
- Que el agente mejore su propio harness
- Orquestar varios agentes o subagentes
- Organizar el flujo de trabajo diario con agentes de código
- Montar una fábrica de software
- Llevar un agente a producción
- Dar al agente conocimiento estructurado del negocio
- Saber qué partes del harness sobran a medida que mejoran los modelos

Si el problema no encaja en ninguno, no lo fuerces: elige notas por tags y sugiere agregar la fila a la matriz.

## Navigation Pattern

1. Empieza en `../kb/arnes-kb/Index.md` para orientarte.
2. Para lookup por tema: grupo del tag en `Index.md` → notas.
3. Para retrieval por problema: `matriz-problema-conocimiento.md` → notas.
4. Lee las notas seleccionadas; para citar un dato textual, abre la transcripción enlazada en `## Referencias` y busca el timestamp.
5. Cuando varias notas se contradicen (p. ej. harness mínimo tipo Pi vs. harness rico, o confiar en la automejora vs. escepticismo), preséntalo como desacuerdo entre ponentes, no lo promedies.

## Frontmatter Schema (notas)

```yaml
---
title: "Título en español del tema del video"
tags:
  - arnes/nota
  - type/nota
  - arnes/<tema>          # 1-3 tags de tema
channel: "<canal de YouTube>"
speaker: "<ponente(s)>"
videoId: "<videoId>"
source: "https://www.youtube.com/watch?v=<videoId>"
language: "<idioma original del video>"
playlistOrder: <n>
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Arnés"
aliases:
  - "<título original del video>"
related:
  - "<wikilink a la transcripción: videoId - slug, alias Transcripción>"
---
```

Casos especiales: el video 41 es un clip sin narración (nota mínima); el 39 está en tamil (transcripción traducida al inglés con el original al final); el 28 se reconstruyó al inglés desde subtítulos transliterados.
