---
tags:
  - ci
  - tests
created: 2026-07-05
---

# Tests

## Suite de tests

arai usa `node:test` (sin dependencias externas). Todos los tests se ejecutan con:

```bash
npm test
```

## Estructura

```
tests/
├── consistency/          ← Estructura y consistencia de archivos
├── commands/             ← Tests de comandos CLI
└── integration/          ← Ciclos completos: skill → generate → validate
```

## Ejecutar subsets

```bash
# Solo tests de consistencia
node --test tests/consistency/

# Un test específico
node --test tests/consistency/behavioral.test.js

# Tests de creator scripts
node --test tests/commands/
```

## Creator scripts tests

Prueban que cada script:
- Muestra ayuda con `--help`
- Reporta error con `--dry-run` sin argumentos
- Genera JSON/archivos válidos
- No tiene errores de sintaxis

## Escribir tests nuevos

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('mi-componente', () => {
  it('hace algo específico', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
```

---

**Siguiente**: [[10-CI/03-docgen-validate.md|DocGen Validate]]
