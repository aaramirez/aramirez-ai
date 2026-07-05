# Plan: Vault title en portada y checkbox items con **bold**

## Problema 1: Cover title hardcoded por scope

**Estado actual**: El título de portada cambia según el scope:
- module → `"Fundamentos"` (solo contenido)
- lesson → `"De prompt a programación"` (solo contenido)
- all → `"Curso de Desarrollo con IA"`

**Lo que pide**: El título debe ser **siempre** el título del vault (vault title), extraído dinámicamente de `Index.md`.

**Solución**: Leer el primer H1 de `curso-ia/Index.md` y usarlo como título de portada para TODOS los scopes. El subtítulo varía según el alcance:

| Scope | Title (vault title) | Subtitle |
|-------|-------------------|----------|
| module | `Curso de Desarrollo con IA — Programa con Agentes` | `Módulo 1 - Fundamentos` |
| lesson | `Curso de Desarrollo con IA — Programa con Agentes` | `Lección 01 - De prompt a programación` |
| all | `Curso de Desarrollo con IA — Programa con Agentes` | `curso-ia` |

```javascript
function readVaultTitle(vaultPath) {
  const indexPath = join(vaultPath, 'Index.md');
  if (!existsSync(indexPath)) return 'Curso';
  const md = readFileSync(indexPath, 'utf8');
  const match = md.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Curso';
}
```

## Problema 2: Checkbox con bullet y `**text**` literal

**Estado actual**: Las listas con checkbox se guardan en `listBuf` como HTML crudo:

```
<input type="checkbox" disabled> text with **bold**
```

`flushList()` detecta que empieza con `<` y salta `inlineMd()` → el texto `**bold**` no se procesa y se ve literal.

Además, `<li>` renderiza bullet por defecto, que sobra cuando hay checkbox.

**Solución**: Usar marcadores de prefijo (`\x00CB` / `\x00CBX`) para checkbox, y en `flushList()` procesar el texto a través de `inlineMd()` ANTES de envolver con `<input>`:

```javascript
// En la detección:
listBuf.push(`\x00CB ${trimmed.slice(6)}`);   // unchecked
listBuf.push(`\x00CBX ${trimmed.slice(6)}`);  // checked

// En flushList:
if (item.startsWith('\x00CB ')) {
  const text = inlineMd(item.slice(5));
  out.push(`<li class="checkbox-item"><input type="checkbox" disabled> ${text}</li>`);
} else if (item.startsWith('\x00CBX ')) {
  const text = inlineMd(item.slice(6));
  out.push(`<li class="checkbox-item"><input type="checkbox" disabled checked> ${text}</li>`);
}
```

CSS:
```css
.body-text li.checkbox-item {
  list-style: none;
}
```

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/docgen-vault.js` | Nueva función `readVaultTitle()` |
| `shared/scripts/docgen-vault.js` | Cover title usa `readVaultTitle()` siempre |
| `shared/scripts/docgen-vault.js` | Checkbox usa marcadores `\x00CB` en vez de HTML crudo |
| `shared/scripts/docgen-vault.js` | `flushList()` procesa marcadores con `inlineMd()` + `class="checkbox-item"` |
| `shared/scripts/docgen-vault.js` | CSS para `li.checkbox-item { list-style: none }` |

## Verificación

```bash
# Módulo 1 (portada con vault title + subtítulo módulo)
node shared/scripts/docgen-vault.js --scope module --module "Módulo 1" --mode merged

# Lección con checkboxes (sin bullet, **bold** renderizado)
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "05"

# Sin tags literales ni \x00CB en el PDF
strings *.pdf | grep -i 'checkbox\|cb\|&lt;'  → vacío

# Tests
npm test
```
