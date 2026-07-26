# Plan: Alineación de checkbox y más formatos markdown

## Problema 1: Checkbox no alineado a la izquierda

**Síntoma**: El bullet desapareció (`list-style: none`) pero el espacio que ocupaba el bullet sigue ahí. El checkbox aparece desplazado a la derecha.

**Causa raíz**: Los navegadores reservan `padding-left` (típicamente ~40px) en `<li>` para el marcador. `list-style: none` oculta el marcador pero no elimina el padding.

```
┌─ <ul> margin-left: 22px ─────────────┐
│  ┌─ <li> padding-left: 40px ───────┐  │
│  │  (espacio del bullet) ☐ texto    │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Solución**: En el CSS, agregar `padding-left: 0` y `margin-left: 0` a `li.checkbox-item`:

```css
.body-text li.checkbox-item {
  list-style: none;
  padding-left: 0;
  margin-left: -22px;  /* compensa el margin del <ul> */
}
```

O mejor, ajustar para que quede alineado con el texto de los párrafos:

```css
.body-text li.checkbox-item {
  list-style: none;
  padding-left: 0;
}
```

Y ajustar el `<input>` para que mantenga un pequeño margen derecho del texto:
```css
.body-text li.checkbox-item input[type="checkbox"] {
  margin-right: 6px;
}
```

## Problema 2: Faltan formatos markdown en checkbox items

**Síntoma**: En items con checkbox, `**text**` se convierte a `<strong>` (funciona), pero `__text__` no se procesa.

**Causa raíz**: `inlineMd()` solo maneja `**bold**`, `*italic*`, `` `code` ``. No maneja:
- `__bold__` (sintaxis alternativa)
- `~~strikethrough~~`

Los checkbox items pasan por `inlineMd()` (después del fix anterior), pero `inlineMd()` no cubre todos los patrones.

**Solución**: Agregar los patrones faltantes en `inlineMd()`:

```javascript
// __bold__ (sintaxis alternativa, con límite de palabra)
s = s.replace(/(^|\s)__([^_]+)__(\s|$)/g, '$1<strong>$2</strong>$3');

// ~~strikethrough~~
s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>');
```

El regex de `__bold__` requiere espacios alrededor (` __text__ `) o inicio/final de línea para evitar falsos positivos con `some_text_here`.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/docgen-vault.js` | CSS: `li.checkbox-item` con `padding-left: 0` |
| `shared/scripts/docgen-vault.js` | `inlineMd()`: agregar `__bold__` y `~~strikethrough~~` |

## Verificación

```bash
# Lección con checkboxes (alineación + formatos)
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "05"
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "11"

# Verificar:
# 1. Checkbox alineado a la izquierda (sin espacio de bullet)
# 2. **bold** funciona en checkbox items
# 3. __bold__ funciona en checkbox items
# 4. ~~strikethrough~~ funciona en checkbox items
# 5. Sin tags literales en el PDF

# Tests
npm test
```
