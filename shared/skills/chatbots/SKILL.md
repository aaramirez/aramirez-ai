---
name: chatbots
description: Navigation guide for chatbots-kb — generic industry reference on designing and implementing advanced enterprise chatbots, indexed for topic lookup and problem-driven retrieval.
---

# Skill: Chatbots — KB Navigation Guide

## Available Knowledge Base

### chatbots-kb

| Sección | Enfoque |
|---------|---------|
| 01-Fundamentos-y-Estrategia | Qué es un chatbot empresarial, tipos, casos de uso, construir vs. comprar |
| 02-Diseno-Conversacional | Conversation design, tono de marca, flujos, fallback |
| 03-Arquitectura-de-la-Plataforma | Capas, patrón híbrido reglas+LLM, dialogue manager, contexto multiturno |
| 04-Canales-y-Omnicanalidad | WhatsApp Business Platform, Instagram Messaging API, Telegram Bot API, web |
| 05-IA-Conversacional | NLU, LLM, RAG, function calling, agentes, selección de modelo |
| 06-Gestion-de-Conocimiento | Contenido para RAG, curaduría, fuentes de verdad |
| 07-Gestion-de-Conversaciones-y-Escalamiento | Sesión, memoria, escalamiento y handoff a humano |
| 08-Flujos-por-Area-de-Negocio | Prospección, ventas, atención al cliente, pagos/deuda, tickets |
| 09-Integraciones-con-Sistemas | CRM, helpdesk, billing, pasarelas de pago, API/webhooks |
| 10-Seguridad-Guardrails-e-Identidad | Verificación de identidad, PCI-DSS, guardrails, prompt injection, PII |
| 11-Gestion-de-Costos-de-IA | Costo por conversación, optimización de tokens, caching, monitoreo |
| 12-Analitica-y-Calidad-Conversacional | Containment, deflection, CSAT, mejora continua |
| 13-Testing-Despliegue-y-Gobierno | Testing, red-teaming, CI/CD, staging/producción, ownership |
| 14-Ruta-Aprendizaje | Itinerarios por rol y nivel |

Esta KB es **estrictamente genérica**: no contiene productos, marcas ni implementaciones reales de ninguna empresa.

## Dos modos de uso

### Modo 1 — Lookup por tema

Para "¿qué es X?" o "explícame Y": usa la tabla de arriba para ubicar la sección, luego lee la nota o su README.

### Modo 2 — Retrieval por problema (el modo principal de esta KB)

Para "tengo este problema de diseño/implementación, ¿cómo lo resuelvo?": ve directo a `matriz-problema-conocimiento.md` en la raíz de `chatbots-kb`. Esa tabla mapea problemas concretos (elegir canal, diseñar flujo de pagos, decidir NLU vs. LLM, controlar costos, escalar a humano) a las secciones/notas que aplican, ya cruzando dominios cuando hace falta.

## Topic → Sección Mapping (para Modo 1)

| Tema | Sección |
|------|---------|
| Qué es un chatbot empresarial, tipos, ROI | 01-Fundamentos-y-Estrategia |
| Tono de marca, flujos, manejo de errores | 02-Diseno-Conversacional |
| Capas de arquitectura, dialogue manager | 03-Arquitectura-de-la-Plataforma |
| WhatsApp, Instagram, Telegram, web, omnicanalidad | 04-Canales-y-Omnicanalidad |
| NLU, LLM, RAG, function calling, agentes | 05-IA-Conversacional |
| Contenido para RAG, curaduría | 06-Gestion-de-Conocimiento |
| Sesión, memoria, handoff a humano | 07-Gestion-de-Conversaciones-y-Escalamiento |
| Ventas, prospección, atención, pagos, tickets | 08-Flujos-por-Area-de-Negocio |
| CRM, helpdesk, billing, pasarelas de pago | 09-Integraciones-con-Sistemas |
| Identidad, PCI-DSS, guardrails, prompt injection, PII | 10-Seguridad-Guardrails-e-Identidad |
| Costo por conversación, tokens, caching | 11-Gestion-de-Costos-de-IA |
| Containment, deflection, CSAT, logs | 12-Analitica-y-Calidad-Conversacional |
| Testing, CI/CD, staging, ownership de flujos | 13-Testing-Despliegue-y-Gobierno |
| Por dónde empezar / profundizar | 14-Ruta-Aprendizaje |

## Problema → Conocimiento (para Modo 2)

Ver `matriz-problema-conocimiento.md` en la raíz de `chatbots-kb` para la tabla completa. Arquetipos ya definidos:

- Elegir qué canal(es) implementar primero
- Diseñar el flujo de pagos y consulta de deuda
- Diseñar el flujo de tickets
- Decidir entre NLU clásico, LLM o híbrido
- El bot da respuestas inventadas o fuera de tema
- El costo de IA se está disparando
- Diseñar cuándo y cómo escalar a un humano
- Estructurar contenido para RAG
- Medir si el chatbot realmente funciona
- Definir ownership de flujos entre áreas
- Verificar identidad antes de mostrar datos sensibles
- Diseñar el flujo de prospección/leads

Si el problema no encaja en ninguno, no lo fuerces — trátalo como un problema nuevo, elige secciones por juicio directo, y sugiere agregar la fila a la matriz.

## Navigation Pattern

1. Empieza en `../chatbots-kb/Index.md` para orientarte.
2. Para lookup por tema: sigue el README de la sección correspondiente.
3. Para retrieval por problema: ve directo a `matriz-problema-conocimiento.md`.
4. Lee las notas individuales seleccionadas; sigue `[[wikilinks]]` a conceptos relacionados.
5. Revisa el frontmatter `tags` y el campo `source` (estándar/framework de industria del que parte cada nota).

## Frontmatter Schema

```yaml
---
title: "Nombre del concepto"
tags:
  - chatbots/{seccion}
  - type/concepto
  - difficulty/{nivel}
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Nombre de sección"
source: "<estándar/framework de industria: WhatsApp Business Platform, PCI-DSS, etc.>"
related:
  - "[[otra-nota]]"
---
```

Secciones obligatorias del cuerpo: Definición, Por qué importa, Cómo se implementa/opera, Métricas o indicadores clave (si aplica), Riesgos u errores comunes, Relacionado.
