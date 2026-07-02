# Documentación automática

## El problema de la documentación

La documentación es lo primero que se abandona cuando hay presión. Los agentes de IA pueden ayudarte a mantenerla al día sin esfuerzo.

> *"Si no está documentado, no existe."*

## ¿Qué puede documentar la IA?

| Tipo | Automatizable | Calidad |
|------|:----|:----|
| README.md | ✅ Alto | Buena con buen contexto |
| JSDoc / docstrings | ✅ Alto | Excelente |
| API docs | ✅ Alto | Muy buena |
| CHANGELOG | ✅ Medio | Requiere revisión |
| ADRs | ⚠️ Medio | Depende del criterio humano |
| Tutoriales | ❌ Bajo | Requiere expertise |

## Agente de documentación

```json
{
  "agent": {
    "docs": {
      "mode": "subagent",
      "description": "Documentation specialist",
      "permission": { "edit": "allow", "bash": "deny" }
    }
  }
}
```

## Flujo de documentación

1. Implementar funcionalidad
2. Ejecutar agente docs: "Documenta el módulo de autenticación"
3. Revisar la documentación generada
4. Ajustar y commitear

## Documentación viva desde specs

Las [[Módulo 1 — Fundamentos/05-Especificaciones|especificaciones]] que escribes antes de codificar son el germen de la documentación. Al terminar, pídele a la IA que convierta las specs en documentación final.

## README generado

Un buen README debe incluir:

```md
# Nombre del proyecto

## Descripción
¿Qué hace y por qué existe?

## Instalación
Pasos para ponerlo en marcha.

## Uso
Ejemplos básicos.

## API (si aplica)
Endpoint, parámetros, respuestas.

## Contribuir
Guía para contributors.

## Licencia
MIT
```

## Enlaces

- [[04-Testing-y-calidad|Anterior: Testing y calidad]]
- [[Módulo 3 — Multiagentes/01-Arquitectura-multiagente|Siguiente módulo: Multiagentes]]
- [[Módulo 1 — Fundamentos/05-Especificaciones|Especificaciones como base para docs]]
