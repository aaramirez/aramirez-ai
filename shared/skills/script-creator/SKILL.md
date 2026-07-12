---
name: script-creator
description: Create reusable automation scripts in JavaScript (ESM), Python, or Bash with proper boilerplate.
license: MIT
scripts:
  - create-script.js
  - create-base.js
---

# Creación de scripts reutilizables

Crea scripts en JS (ESM), Python o Bash con estructura estándar, shebang, manejo de argumentos y compatibilidad multiplataforma.

## Tipos de script

| Lenguaje | Extensión | Shebang |
|----------|-----------|---------|
| JavaScript | `.js` / `.mjs` | `#!/usr/bin/env node` |
| Python | `.py` | `#!/usr/bin/env python3` |
| Bash | `.sh` | `#!/usr/bin/env bash` |

## Convenciones

- **JS (ESM)**: Usar `import` en lugar de `require`. Importar utilidades desde `create-base.js` cuando esté disponible.
- **Argumentos**: Usar `process.argv` en JS, `sys.argv` en Python, `$1..$N` en Bash. Considerar `yargs` o `argparse` para parsing avanzado.
- **Compatibilidad**: Usar `path` / `os` en JS, `os.path` / `platform` en Python. Evitar rutas absolutas y comandos específicos de plataforma (`rm -rf` vs `rmdir /s /q`).
- **Códigos de salida**: `0` éxito, `1` error genérico, `2` error de uso.

## Referencia

```bash
node shared/scripts/create-script.js \
  --name my-tool \
  --lang js \
  --description "Useful tool" \
  --output ./shared/scripts/my-tool.js
```
