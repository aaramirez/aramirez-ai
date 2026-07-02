# Testing y calidad

## Testing con agentes

Los agentes de IA son excelentes para escribir tests. Pueden:

- Generar tests unitarios a partir de código existente
- Identificar casos borde que no habías considerado
- Ejecutar tests y reportar resultados
- Ayudar a depurar tests fallidos

> *"La IA es mejor escribiendo tests que código de producción. Aprovecha eso."*

## Flujo de testing

1. Escribir/actualizar código
2. Agente genera tests para el código nuevo
3. Ejecutar tests
4. Si fallan: depurar con la IA
5. Repetir hasta que pasen

## Agente tester

Puedes tener un agente especializado en testing:

```json
{
  "agent": {
    "tester": {
      "mode": "subagent",
      "description": "Testing specialist",
      "permission": { "bash": "allow", "edit": "allow" }
    }
  }
}
```

## Estrategias de testing

### TDD con IA

1. Escribir test que falla (tú o la IA)
2. IA genera código para que pase
3. Verificar que el test pasa
4. Refactorizar

### Property-based testing

La IA puede generar propiedades invariantes y tests parametrizados:

```js
// La IA genera: "para cualquier lista, reverse(reverse(list)) === list"
```

### Coverage dirigido

Pídele a la IA que identifique código no cubierto y genere tests específicos.

## Cuando NO confiar en tests generados

- **Tests que no fallan** — Si el test nunca falla, no está probando nada
- **Tests que dependen de implementación** — Prueban cómo, no qué
- **Tests sin asserts** — Cobertura falsa

## Comando personalizado

```json
{
  "command": {
    "test": {
      "description": "Run test suite",
      "template": "Run the test suite for this project. First detect the test framework, then run all tests and report results."
    }
  }
}
```

## Enlaces

- [[03-Planificacion-con-agentes|Anterior: Planificación]]
- [[05-Documentacion-automatica|Siguiente: Documentación automática]]
- [[Módulo 1 — Fundamentos/04-Criterio-y-buenas-practicas|Criterio y revisión]]
