---
name: telco
description: Navigation guide for telco-kb — generic industry reference on how a telco offering FTTH services should operate, indexed for topic lookup and problem-driven retrieval.
---

# Skill: Telco FTTH — KB Navigation Guide

## Available Knowledge Base

### telco-kb

| Sección | Enfoque |
|---------|---------|
| 01-Fundamentos-del-Negocio | Qué es un telco FTTH, modelo de negocio ISP, panorama de industria |
| 02-Cadena-de-Valor | 16 etapas de extremo a extremo: Demanda → Cobertura → Red → Ventas → Órdenes → Agendamiento → Instalación → Activación → Operación → Soporte → Facturación → Cobranza → Retención → Monetización → Datos/IA → Gobierno |
| 03-Arquitectura-de-Sistemas | Capas: experiencia/canales, comercial/CRM, datos/analítica/IA, integración |
| 04-BSS | Billing, gestión de órdenes, CRM, revenue assurance, mediation, catálogo |
| 05-OSS | Inventario de red, gestión de fallas/rendimiento, aprovisionamiento, NOC |
| 06-Arquitectura-de-Red-FTTH | GPON/XGS-PON, OLT/ONU/ONT, ODN, diseño y dimensionamiento |
| 07-Operacion-y-Gestion-de-Red | Monitoreo, gestión de incidentes, mantenimiento, capacidad, backbone/peering |
| 08-Calidad-de-Servicio | QoS, SLA, experiencia del cliente, benchmarks |
| 09-Seguridad | Seguridad de red, datos de clientes, cumplimiento, incidentes de seguridad |
| 10-Procesos-Operativos-Fundamentales | Vista funcional/departamental — complementaria a la cadena de valor, sin repetirla |
| 11-Gobierno-y-Marcos-de-Referencia | TM Forum eTOM/SID/TAM, ITIL, gobierno de TI |
| 12-Ruta-Aprendizaje | Itinerarios por rol y nivel |

Esta KB es **estrictamente genérica**: no contiene sistemas propietarios, cifras ni estrategias de ninguna empresa real.

## Dos modos de uso

### Modo 1 — Lookup por tema

Para "¿qué es X?" o "explícame Y": usa la tabla de arriba para ubicar la sección, luego lee la nota o su README.

### Modo 2 — Retrieval por problema (el modo principal de esta KB)

Para "tengo este problema operativo, ¿cómo lo resuelvo?": ve directo a `matriz-problema-conocimiento.md` en la raíz de `telco-kb`. Esa tabla mapea problemas operativos concretos (diseñar una red nueva, elegir un sistema BSS/OSS, diagnosticar una caída de calidad, reducir churn, evaluar seguridad) a las secciones/notas que aplican, ya cruzando dominios cuando hace falta.

## Topic → Sección Mapping (para Modo 1)

| Tema | Sección |
|------|---------|
| Modelo de negocio ISP, qué es FTTH | 01-Fundamentos-del-Negocio |
| Demanda, ventas, instalación, facturación, cobranza, churn | 02-Cadena-de-Valor |
| Capas de sistemas, CRM, datos/IA, integración/APIs | 03-Arquitectura-de-Sistemas |
| Billing, order management, revenue assurance | 04-BSS |
| Inventario de red, fallas, rendimiento, provisioning, NOC | 05-OSS |
| GPON, XGS-PON, OLT, ONU/ONT, ODN | 06-Arquitectura-de-Red-FTTH |
| Monitoreo, incidentes de red, mantenimiento, capacidad | 07-Operacion-y-Gestion-de-Red |
| QoS, SLA, NPS, benchmarks de velocidad | 08-Calidad-de-Servicio |
| Seguridad de red, datos de clientes, cumplimiento | 09-Seguridad |
| Procesos internos/departamentales, inventario/compras, B2B | 10-Procesos-Operativos-Fundamentales |
| TM Forum, ITIL, gobierno de TI, comités | 11-Gobierno-y-Marcos-de-Referencia |
| Por dónde empezar / profundizar | 12-Ruta-Aprendizaje |

## Problema → Conocimiento (para Modo 2)

Ver `matriz-problema-conocimiento.md` en la raíz de `telco-kb` para la tabla completa. Arquetipos ya definidos:

- Diseñar/dimensionar una red FTTH nueva
- Elegir o evaluar un sistema BSS/OSS
- Diagnosticar una caída de calidad de servicio
- Diseñar el proceso de aprovisionamiento/activación
- Evaluar exposición de seguridad de red o de datos
- Reducir churn / mejorar retención
- Estructurar gobierno de TI / comités de decisión
- Evaluar si escalar la red
- Elegir un marco de referencia para modelar procesos nuevos

Si el problema no encaja en ninguno, no lo fuerces — trátalo como un problema nuevo, elige secciones por juicio directo, y sugiere agregar la fila a la matriz.

## Navigation Pattern

1. Empieza en `../telco-kb/Index.md` para orientarte.
2. Para lookup por tema: sigue el README de la sección correspondiente.
3. Para retrieval por problema: ve directo a `matriz-problema-conocimiento.md`.
4. Lee las notas individuales seleccionadas; sigue `[[wikilinks]]` a conceptos relacionados.
5. Revisa el frontmatter `tags` y el campo `source` (marco/estándar de industria del que parte cada nota).

## Frontmatter Schema

```yaml
---
title: "Nombre del concepto"
tags:
  - telco/{seccion}
  - type/concepto
  - difficulty/{nivel}
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Nombre de sección"
source: "<marco/estándar de industria: TM Forum eTOM, ITIL, ITU-T, etc.>"
related:
  - "[[otra-nota]]"
---
```

Secciones obligatorias del cuerpo: Definición, Por qué importa, Cómo se implementa/opera, Métricas o indicadores clave (si aplica), Riesgos u errores comunes, Relacionado.
