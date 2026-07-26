#!/usr/bin/env node

/**
 * kb-init.js — Create a new knowledge base from template
 * 
 * Usage: node kb-init.js <name> --prefix <prefix> --description <desc>
 * 
 * Creates standard KB structure with:
 * - Index.md (entry point)
 * - como-usar-este-kb.md (usage guide)
 * - <prefix>-glossary.md
 * - <prefix>-timeline.md
 * - 01-Fundamentos/ (first section)
 * - .gitignore
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const TODAY = new Date().toISOString().split('T')[0];

function parseArgs(args) {
  const result = { name: null, prefix: null, description: '' };
  
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--prefix' && args[i + 1]) {
      result.prefix = args[++i];
    } else if (arg === '--description' && args[i + 1]) {
      result.description = args[++i];
    } else if (!arg.startsWith('--')) {
      result.name = arg;
    }
  }
  
  return result;
}

function validateArgs({ name, prefix }) {
  if (!name) {
    console.error('Error: KB name is required');
    console.error('Usage: node kb-init.js <name> --prefix <prefix> --description <desc>');
    process.exit(1);
  }
  if (!prefix) {
    console.error('Error: --prefix is required');
    process.exit(1);
  }
}

function validateName(name) {
  if (!/^[a-z0-9-]+$/.test(name)) {
    console.error('Error: KB name must be lowercase alphanumeric with hyphens');
    process.exit(1);
  }
}

function createDirectoryStructure(basePath, name) {
  const kbPath = join(basePath, name);
  
  if (existsSync(kbPath)) {
    console.error(`Error: Directory '${name}' already exists`);
    process.exit(1);
  }
  
  mkdirSync(kbPath, { recursive: true });
  mkdirSync(join(kbPath, '01-Fundamentos'), { recursive: true });
  mkdirSync(join(kbPath, 'references'), { recursive: true });
  
  return kbPath;
}

function createIndexMd(kbPath, name, prefix, description) {
  const content = `---
title: "${description || name}"
tags:
  - ${prefix}/indice
  - type/indice
created: ${TODAY}
updated: ${TODAY}
category: "Índice"
---

# ${description || name}

Bienvenido a la knowledge base **${name}**.

## Navegación

| Sección | Descripción |
|---------|-------------|
| [[01-Fundamentos/README]] | Fundamentos y conceptos básicos |

## Recursos

- [[${prefix}-glossary|Glosario]]
- [[${prefix}-timeline|Timeline]]

## Cómo usar esta KB

Lee [[como-usar-este-kb]] para entender la estructura y convenciones de esta knowledge base.
`;
  writeFileSync(join(kbPath, 'Index.md'), content);
}

function createComoUsarMd(kbPath, name, prefix) {
  const content = `---
title: "Cómo usar esta knowledge base"
tags:
  - ${prefix}/guia
  - type/guia
created: ${TODAY}
updated: ${TODAY}
category: "Guía"
---

# Cómo usar esta knowledge base

## Estructura

Esta KB está organizada en secciones numeradas:

- **01-Fundamentos/** — Conceptos básicos y fundamentos
- **references/** — Materiales fuente (PDFs, documentos)

## Convenciones

### Archivos

- Usa \`kebab-case\` para nombres de archivos
- Un concepto por nota (notas atómicas)
- Incluye frontmatter en todas las notas

### Wikilinks

Conecta notas relacionadas con \`[[wikilinks]]\`:

\`\`\`markdown
Ver también [[nombre-de-la-nota]]
\`\`\`

### Frontmatter

Toda nota debe incluir:

\`\`\`yaml
---
title: "Título de la nota"
tags:
  - ${prefix}/seccion
  - type/concepto
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Sección"
---
\`\`\`

### Tags

- **Sección**: \`${prefix}/nombre-seccion\`
- **Tipo**: \`type/concepto\`, \`type/herramienta\`, \`type/guia\`
- **Dificultad**: \`difficulty/principiante\`, \`difficulty/intermedio\`, \`difficulty/avanzado\`
`;
  writeFileSync(join(kbPath, 'como-usar-este-kb.md'), content);
}

function createGlossaryMd(kbPath, prefix) {
  const content = `---
title: "Glosario"
tags:
  - ${prefix}/glosario
  - type/indice
created: ${TODAY}
updated: ${TODAY}
category: "Índice"
---

# Glosario

Términos y definiciones utilizados en esta knowledge base.

| Término | Definición |
|---------|------------|
| *Agregar términos aquí* | *Agregar definiciones aquí* |
`;
  writeFileSync(join(kbPath, `${prefix}-glossary.md`), content);
}

function createTimelineMd(kbPath, prefix) {
  const content = `---
title: "Timeline"
tags:
  - ${prefix}/timeline
  - type/indice
created: ${TODAY}
updated: ${TODAY}
category: "Índice"
---

# Timeline

Línea de tiempo de eventos y hitos importantes.

| Fecha | Evento |
|-------|--------|
| *Agregar eventos aquí* | *Agregar descripciones aquí* |
`;
  writeFileSync(join(kbPath, `${prefix}-timeline.md`), content);
}

function createSectionReadme(kbPath, prefix) {
  const content = `---
title: "Fundamentos"
tags:
  - ${prefix}/fundamentos
  - type/indice
created: ${TODAY}
updated: ${TODAY}
category: "Fundamentos"
---

# Fundamentos

## Objetivos de aprendizaje

- Entender los conceptos básicos
- Conocer la terminología fundamental
- Aplicar los principios en la práctica

## Contenido

*Agregar notas de contenido aquí*

## Estudio sugerido

1. Revisar el glosario: [[${prefix}-glossary]]
2. Explorar la timeline: [[${prefix}-timeline]]
3. Volver al índice: [[Index]]
`;
  writeFileSync(join(kbPath, '01-Fundamentos', 'README.md'), content);
}

function createGitignore(kbPath) {
  const content = `node_modules/
.DS_Store
*.swp
*.swo
*~
.obsidian/workspace.json
.obsidian/workspace-mobile.json
`;
  writeFileSync(join(kbPath, '.gitignore'), content);
}

// Main
const args = parseArgs(process.argv);
validateArgs(args);
validateName(args.name);

const kbPath = createDirectoryStructure(process.cwd(), args.name);

createIndexMd(kbPath, args.name, args.prefix, args.description);
createComoUsarMd(kbPath, args.name, args.prefix);
createGlossaryMd(kbPath, args.prefix);
createTimelineMd(kbPath, args.prefix);
createSectionReadme(kbPath, args.prefix);
createGitignore(kbPath);

console.log(`✓ Created knowledge base '${args.name}' in ${kbPath}`);
console.log(`  - Index.md`);
console.log(`  - como-usar-este-kb.md`);
console.log(`  - ${args.prefix}-glossary.md`);
console.log(`  - ${args.prefix}-timeline.md`);
console.log(`  - 01-Fundamentos/README.md`);
console.log(`  - .gitignore`);
