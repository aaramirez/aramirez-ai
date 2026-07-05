# Plan: Corregir título de portada y checkbox literal

## Problema 1: Título de portada incorrecto

**Síntoma**: Con `--scope module --module "Módulo 1"`, la portada muestra título "Módulo 1" en vez de "Fundamentos". El subtítulo "Módulo 1" está correcto.

**Causa raíz**: Se pasa `moduleName` (el string del flag `--module`, ej: `"Módulo 1"`) a `extractTitle()`, pero ese string es solo el filtro de búsqueda, no el nombre real del directorio del módulo.

El nombre real del módulo está en las `groups` (key del mapa), que para Módulo 1 es `"Módulo 1 - Fundamentos"`. Al pasar `"Módulo 1"` a `extractTitle()` no encuentra separador y devuelve el mismo string intacto.

**Solución**: Para `module` scope, obtener el nombre real desde `Object.keys(groups)[0]` y pasarlo a `extractTitle()`/`extractSubtitle()`.

Para `lesson` scope, construir el nombre real desde el entry de la lección (filename sin extensión).

```javascript
// Código actual (erróneo)
const coverTitle = scope === 'all' ? 'Curso de Desarrollo con IA' :
  scope === 'module' ? extractTitle(moduleName) :
    extractTitle(`${moduleName} — Lección ${lessonNum}`);

// Código corregido
const groupKeys = Object.keys(groups);
const actualName = groupKeys.length === 1 ? groupKeys[0] : moduleName;
const coverTitle = scope === 'all' ? 'Curso de Desarrollo con IA' :
  scope === 'module' ? extractTitle(actualName) :
    extractTitle(`${actualName} — Lección ${lessonNum}`);
const coverSubtitle = scope === 'all' ? vaultName :
  scope === 'module' ? extractSubtitle(actualName) :
    `Lección ${lessonNum}`;
```

Para `lesson` scope en merged, obtener el nombre de la lección desde los entries:
```javascript
// Ej: entry.name = "01-De-prompt-a-programacion"
// display: "De prompt a programación"
```

## Problema 2: Checkbox literal en PDF

**Síntoma**: `<input type="checkbox" disabled>` aparece como texto literal.

**Causa raíz**: Los checkboxes se insertan como HTML crudo en `listBuf`:

```javascript
listBuf.push(`<input type="checkbox" disabled checked> ${trimmed.slice(6)}`);
```

Pero `flushList()` pasa cada item por `inlineMd()`, que comienza con `escHtml()`, escapando el tag HTML:

```
"<input type='checkbox' ...>"  →  escHtml()  →  "&lt;input type='checkbox' ...&gt;"
```

**Solución**: En `flushList()`, detectar items que ya empiezan con `<` y saltar `inlineMd()`:

```javascript
// Antes (flushList):
for (const item of listBuf) out.push(`<li>${inlineMd(item)}</li>`);

// Después:
for (const item of listBuf) {
  if (item.startsWith('<')) {
    out.push(`<li>${item}</li>`);
  } else {
    out.push(`<li>${inlineMd(item)}</li>`);
  }
}
```

Esto es genérico: cualquier item que ya sea HTML crudo se emite sin transformación.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/docgen-vault.js` | `coverTitle`/`coverSubtitle` usando `actualName` desde groups |
| `shared/scripts/docgen-vault.js` | `flushList()` — bypass `inlineMd` si item empieza con `<` |

## Verificación

```bash
# Módulo 1 (debe mostrar título "Fundamentos", subtítulo "Módulo 1")
node shared/scripts/docgen-vault.js --scope module --module "Módulo 1" --mode merged
file generated/*/modulo-1.pdf

# Módulo 5 lección 05 (checkboxes)
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "05"
file generated/*/leccion-05.pdf

# No deben aparecer tags literales en ningún PDF
strings ... | grep -i '&lt;input\|checkbox'  → vacío

# Tests
npm test
```
