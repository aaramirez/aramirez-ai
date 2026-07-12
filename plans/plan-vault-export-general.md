# Plan: Exportador de vaults genérico

## Problema

`docgen-vault.js` solo funciona bien con vaults tipo `curso-ia/` (estructura `Módulo N — Nombre/ NN-Leccion.md`). Con vaults de otras estructuras —como `tutoriales-arai/` (secciones numeradas `NN-Tema/`) o vaults planos— el parseo falla porque asume:
- Nombres de carpeta con "Módulo" o número
- Archivos que empiezan con número de lección
- Exclusiones hardcodeadas (`Transcripciones`, `Recursos`)
- Términos como "Lección" en portadas

## Objetivo

Que cualquier vault de Obsidian se pueda exportar a PDF con `docgen-vault.js` sin modificar el script por vault.

---

## Arquitectura propuesta

### 1. Auto-detección de tipo de vault

```javascript
function detectVaultType(vaultPath) {
  const entries = readdirSync(vaultPath, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.md'));

  // Criterios de detección (orden de precedencia)
  if (dirs.some(d => /Módulo/i.test(d.name)))        return 'curso';
  if (dirs.every(d => /^\d+\s*[—\-]/.test(d.name)))  return 'curso';     // "01 - Tema"
  if (dirs.every(d => /^\d+[-]/.test(d.name)))        return 'topics';    // "01-Tema"
  if (dirs.length === 0)                                return 'flat';     // Solo archivos .md en raíz
  return 'arbitrary';  // Carpetas sin patrón numérico
}
```

### 2. Tipos de vault

| Tipo | Estructura | Ejemplo | Agrupación | Título de sección |
|------|-----------|---------|-----------|-------------------|
| `curso` | `Módulo N/ NN-Leccion.md` | `curso-ia/` | módulo → lección | `Lección N — Nombre` |
| `topics` | `NN-Tema/ *.md` | `tutoriales-arai/` | tema → página | `Nombre del archivo` |
| `flat` | `*.md` en raíz | vault sin subcarpetas | — | Nombre del archivo |
| `arbitrary` | `Carpeta/ *.md` | vaults sin numeración | carpeta → página | Nombre de carpeta + archivo |

### 3. Nueva función `parseByType()`

Reemplazar `parseModuleLesson()` con un dispatch según el tipo:

```javascript
function parseByType(filePath, vaultPath, vaultType) {
  const rel = dirname(filePath).slice(vaultPath.length + 1);
  const name = basename(filePath, '.md');

  switch (vaultType) {
    case 'curso':
      return parseCurso(rel, name);
    case 'topics':
      return parseTopics(rel, name);
    case 'flat':
      return parseFlat(name);
    case 'arbitrary':
      return parseArbitrary(rel, name);
  }
}
```

#### parseCurso() — actual (backward compat)

```javascript
function parseCurso(rel, name) {
  const modMatch = rel.match(/(\d+)|Módulo\s+(\d+)/);
  const modNum = modMatch ? parseInt(modMatch[1] || modMatch[2]) : 99;
  const lesMatch = name.match(/^(\d+)/);
  const lesNum = lesMatch ? parseInt(lesMatch[1]) : 99;
  const modName = rel || 'General';
  const lesDisplay = name.replace(/^\d+[-]\s*/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    groupKey: modName,
    sortKey: `${String(modNum).padStart(3,'0')}-${String(lesNum).padStart(3,'0')}`,
    title: `${name}`,
    subtitle: `Lección ${lesMatch?.[1] || ''}${lesDisplay ? ` — ${lesDisplay}` : ''}`,
  };
}
```

#### parseTopics() — para vaults tipo tutoriales-arai

```javascript
function parseTopics(rel, name) {
  const secMatch = rel.match(/^(\d+)/);
  const secNum = secMatch ? parseInt(secMatch[1]) : 99;
  const secName = rel.replace(/^\d+[-]/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const pageMatch = name.match(/^(\d+)/);
  const pageNum = pageMatch ? parseInt(pageMatch[1]) : 99;
  const pageName = name.replace(/^\d+[-]/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    groupKey: secName,
    sortKey: `${String(secNum).padStart(3,'0')}-${String(pageNum).padStart(3,'0')}`,
    title: pageName,
    subtitle: `${secName} — ${pageName}`,
  };
}
```

#### parseFlat() — vaults planos

```javascript
function parseFlat(rel, name) {
  return {
    groupKey: '_flat',
    sortKey: name,
    title: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    subtitle: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  };
}
```

#### parseArbitrary() — cualquier otra estructura

```javascript
function parseArbitrary(rel, name) {
  const parts = rel.split('/');
  const groupName = parts[0] || 'General';
  const display = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    groupKey: groupName,
    sortKey: `${rel}/${name}`,
    title: display,
    subtitle: `${groupName} — ${display}`,
  };
}
```

### 4. Exclusiones configurables

Actual — hardcodeado:

```javascript
const EXCLUDE_DIRS = new Set(['Transcripciones', '.obsidian', 'Recursos']);
const EXCLUDE_FILES = new Set(['Index.md']);
```

Propuesta — por tipo + override via flag:

```javascript
const DEFAULT_EXCLUDE = {
  curso:    { dirs: ['Transcripciones', '.obsidian', 'Recursos'], files: ['Index.md'] },
  topics:   { dirs: ['.obsidian', 'assets'],                      files: ['Index.md'] },
  flat:     { dirs: ['.obsidian', 'assets'],                      files: ['Index.md'] },
  arbitrary:{ dirs: ['.obsidian', 'assets'],                      files: ['Index.md'] },
};

// Uso: --exclude-dir "node_modules" --exclude-file "README.md"
```

### 5. Título de portada inteligente

Actual: siempre de `Index.md` raíz.

Propuesta:
- `Index.md` raíz → título principal del vault
- Si no existe `Index.md` → nombre de la carpeta del vault
- Si `Index.md` no tiene `# Title` → nombre de la carpeta
- Subtítulo según contexto:
  - `all` → nombre del vault
  - módulo único → nombre del módulo/tema
  - lección única → nombre de la lección/página

### 6. Nuevos flags

```
--structure <auto|curso|topics|flat|arbitrary>
    Tipo de estructura del vault (default: auto)

--exclude-dir <name>
    Directorio adicional a excluir (multi-value)

--exclude-file <name>
    Archivo adicional a excluir (multi-value)

--sort <filename|frontmatter|filesystem>
    Criterio de ordenamiento (default: filename)
```

### 7. Nombres de archivo de salida

Actual — nombres fijos:
- `curso-completo.pdf` para `all`
- `{slug}.pdf` para `module`
- `leccion-{num}.pdf` para `lesson`

Propuesta — nombres descriptivos según tipo:

| Tipo | `all` | group | item |
|------|-------|-------|------|
| `curso` | `curso-completo.pdf` | `{slug}.pdf` | `leccion-{num}.pdf` |
| `topics` | `{vault-name}.pdf` | `{topic-slug}.pdf` | `{topic}-{page}.pdf` |
| `flat` | `{vault-name}.pdf` | — | `{page}.pdf` |
| `arbitrary` | `{vault-name}.pdf` | `{group}.pdf` | `{group}-{page}.pdf` |

### 8. Modo merged: bloque de contenido por archivo

Actual: cada grupo se muestra como una sección `<h2>` con barra decorativa.

Propuesta: mantener el mismo diseño pero con títulos que reflejen el tipo de vault:
- `curso`: `Lección N — Nombre`
- `topics`: `NombreDelTema.md`
- `arbitrary`: `Carpeta > Nombre`

---

## Resumen de cambios en docgen-vault.js

| Componente | Cambio | Líneas aprox |
|-----------|--------|-------------|
| `detectVaultType()` | Nueva función de auto-detección | ~25 |
| `parseByType()` | Dispatcher + 4 parseadores | ~80 |
| `collectByScope()` | Adaptar para usar `parseByType` | ~15 |
| Exclusiones | Dinámicas por tipo + flags | ~20 |
| Portada | Título inteligente | ~15 |
| `main()` | Nuevos flags, nombres de salida | ~40 |
| Help | Documentar nuevos flags | ~10 |
| **Total** | | **~205 líneas** |

## Backward compatibility

- `curso-ia/` con `--scope module --module "Módulo 1"` → funciona igual (auto-detecta `curso`)
- Sin flag `--structure` → auto-detecta
- Exclusiones viejas siguen aplicando para tipo `curso`
- Sin flags nuevos → comportamiento actual

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/docgen-vault.js` | Todo el refactor |
| `shared/skills/vault-pdf-export/SKILL.md` | Actualizar docs con nuevos flags |

## Verificación

```bash
# Backward compat — curso-ia
node shared/scripts/docgen-vault.js --scope module --module "Módulo 1" --mode merged

# Auto-detect topics — tutoriales-arai
node shared/scripts/docgen-vault.js --vault tutoriales-arai --scope all

# Flat
node shared/scripts/docgen-vault.js --vault /ruta/vault-plano --scope all

# Arbitrary con override
node shared/scripts/docgen-vault.js --vault /ruta/vault --structure arbitrary --scope all

# Exclusiones personalizadas
node shared/scripts/docgen-vault.js --vault tutoriales-arai --scope all --exclude-dir "assets"

npm test
```
