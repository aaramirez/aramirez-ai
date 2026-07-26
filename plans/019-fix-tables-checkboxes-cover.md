# Plan: Tablas, checkboxes y portada

## Problemas detectados

### 1. Tablas markdown no se renderizan

En `05-Especificaciones.md` y `04-Criterio-y-buenas-practicas.md` hay tablas como:

```markdown
| Formato | Cuándo usarlo |
|---------|---------------|
| **Markdown** | Proyectos pequeños |
```

Actualmente se renderizan como párrafos sueltos porque `mdToHtml()` no detecta el patrón `^|`. No sale HTML `<table>`.

### 2. Checkboxes en listas no se renderizan

En `Módulo 5` hay checkboxes como:

```markdown
- [ ] Registro de usuarios
- [x] Login con JWT
```

Actualmente el parser de listas toma `- ` como lista, y `[ ]` queda como texto literal. No sale `<input type="checkbox">`.

### 3. Portada: título, subtítulo y clasificación incorrectos

Estado actual:
| Campo | Hoy | Debería |
|-------|-----|---------|
| Título | `Módulo 1 — Fundamentos` | `Módulo` |
| Subtítulo | `Documento generado...` | `Módulo 1 — Fundamentos` |
| Clasificación | `brand.json.classification` | `Generado desde curso-ia` |

## Soluciones

### 1. Tablas — nuevo bloque en `mdToHtml()`

Añadir detección de bloques de tabla en `mdToHtml()`:

```
Detectar líneas que empiezan con |
  → Colectar bloque completo (hasta línea vacía)
  → Primera línea = <thead> (th)
  → Segunda línea = separador (ignorar, pero detectar alineación)
  → Resto = <tbody> (td)
  → Render: <table><thead><tr><th>...</th></tr></thead><tbody>...
```

La detección debe ocurrir **antes** del código markdown general (h1, h2, p, etc.), en el mismo nivel de detección que listas y blockquotes.

### 2. Checkboxes — modificar detección de listas

En la detección de listas (`- `), añadir:

```javascript
if (trimmed.startsWith('- [ ] ')) {
  // lista con checkbox sin check
  listBuf.push(`<input type="checkbox" disabled> ${trimmed.slice(6)}`);
} else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
  // lista con checkbox checkeado
  listBuf.push(`<input type="checkbox" disabled checked> ${trimmed.slice(6)}`);
}
```

### 3. Portada — cambiar lógica de `buildMeta()`

La portada debe mostrar:

| Scope | Título | Subtítulo |
|-------|--------|-----------|
| module | `Fundamentos` | `Módulo 1` |
| lesson | `Modos build y plan` | `Lección 03` |
| all | `Curso de Desarrollo con IA` | `curso-ia` |

El título se extrae como el **contenido** (después del número/separador), y el subtítulo es el **identificador** (antes del separador).

```javascript
function extractTitle(name) {
  // "Módulo 1 - Fundamentos" → "Fundamentos"
  // "Lección 03 — Modos build" → "Modos build"
  const sep = name.search(/ [—\-] /);
  return sep !== -1 ? name.slice(sep + 3).trim() : name;
}

function extractSubtitle(name) {
  // "Módulo 1 - Fundamentos" → "Módulo 1"
  // "Lección 03 — Modos build" → "Lección 03"
  const sep = name.search(/ [—\-] /);
  return sep !== -1 ? name.slice(0, sep).trim() : name;
}

function buildMeta(title, subtitle, vaultName) {
  const brandData = brand();
  return {
    title,
    subtitle,
    organization: brandData?.name || '',
    classification: `Generado desde ${vaultName}`,
    version: '1.0',
  };
}
```

En `main()`: extraer display name del módulo/lección y pasarlo a `buildMeta` como título y subtítulo por separado.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/docgen-vault.js` | Tablas (nuevo bloque en `mdToHtml`) |
| `shared/scripts/docgen-vault.js` | Checkboxes (extender detección de listas) |
| `shared/scripts/docgen-vault.js` | Portada (título, subtítulo, clasificación) |

## CSS adicional

Agregar estilos para la tabla y checkboxes:

```css
.body-text table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 9pt;
}
.body-text th, .body-text td {
  border: 0.5px solid var(--line, #d9dee8);
  padding: 6px 10px;
  text-align: left;
}
.body-text th {
  background: var(--bg-soft, #f4f5fa);
  font-weight: 700;
  color: var(--ink, #23264f);
}
.body-text input[type="checkbox"] {
  margin-right: 6px;
  transform: scale(0.9);
}
```

## Verificación

```bash
# 1. Regenerar módulo 1 (tiene tablas en lecciones 4 y 5)
node shared/scripts/docgen-vault.js --scope module --module "Módulo 1" --mode merged

# 2. Verificar que el PDF es válido y tiene más páginas (tablas ocupan espacio)
file generated/*/modulo-1.pdf

# 3. Verificar checkboxes — exportar lección de Módulo 5 que tenga [ ]
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "05"

# 4. Tests
npm test
```
