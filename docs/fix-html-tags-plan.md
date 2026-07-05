# Plan: Corregir etiquetas HTML literales en PDF generado

## Problema

El PDF muestra `<strong>`, `<em>` y `<code>` como texto literal en lugar de aplicar el formato correspondiente (negrita, cursiva, código).

## Causa raíz

En `shared/scripts/docgen-vault.js`, función `inlineMd()` (línea 198), el orden de operaciones está invertido:

```
inlineMd() actual:
  1. Reemplazar **bold** → <strong>bold</strong>          ← inserta HTML
  2. Reemplazar *italic* → <em>italic</em>               ← inserta HTML
  3. Reemplazar `code` → <code>code</code>               ← inserta HTML
  4. escHtml(s)                                           ← ESCAPA los tags insertados!
  5. Unescape parcial (&amp;lt; → &lt;)                   ← no recupera nada
```

El paso 4 (`escHtml`) convierte `<strong>` en `&lt;strong&gt;`, que el renderizador Chromium muestra como texto literal `<strong>`.

## Solución

Invertir el orden: aplicar `escHtml` **antes** de las transformaciones markdown:

```
inlineMd() corregido:
  1. escHtml(s)                                           ← escapa <>& del contenido original
  2. Reemplazar **bold** → <strong>bold</strong>          ← tags HTML reales
  3. Reemplazar *italic* → <em>italic</em>                ← tags HTML reales
  4. Reemplazar `code` → <code>code</code>                ← tags HTML reales
  5. Wiki links, imágenes, emojis, etc.
```

De esta forma:
- Cualquier `<` o `>` en el texto original se escapa (seguridad)
- Los tags HTML insertados por markdown quedan como tags reales
- El navegador/Chromium los renderiza con el estilo apropiado

## Mejoras adicionales

1. **Eliminar el `<em>` de wikilinks con pipe**: `[[page|texto]]` actualmente genera `<em>texto</em>` (línea 183). Cambiar a solo texto plano, que es más limpio.

2. **Eliminar el unescape hack**: La línea `replace(/&amp;(amp|lt|gt);/g, ...)` al final de `inlineMd()` sobra porque ya no hay doble escape.

3. **Agregar CSS explícito para `strong` y `em`** en el HTML generado, por si el navegador headless no aplica defaults correctamente:
   ```css
   .body-text strong { font-weight: 700; }
   .body-text em { font-style: italic; }
   ```

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/docgen-vault.js` | Orden de `escHtml` en `inlineMd()` |
| `shared/scripts/docgen-vault.js` | CSS adicional para `strong`/`em` |
| `shared/scripts/docgen-vault.js` | Limpiar wikilink pipe y unescape hack |

## Verificación

```bash
# 1. Regenerar la misma lección
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 1" --lesson "01"

# 2. Extraer texto del PDF para verificar que NO aparecen <strong> literales
#    (usar strings o pdftotext)

# 3. Si hay Chromium, abrir el HTML temporal para inspección visual

# 4. Tests pasan
npm test
```
