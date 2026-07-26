---
name: kb-management
description: Create, maintain, and validate knowledge base vaults — init new KBs, update notes, fix wikilinks, reorganize structure, keep workspace and graph in sync.
license: MIT
scripts:
  - kb-init.js
  - kb-sync.js
---

# KB Management

Create and maintain knowledge base vaults of markdown notes with `[[wikilinks]]`. For creating notes from external sources, see `content-ingestion`; for PDF extraction, see `pdf-extraction`.

## Create a new KB

Initialize a new knowledge base with standard structure:

```bash
node shared/skills/kb-management/scripts/kb-init.js <name> --prefix <prefix> --description "Description"
```

### Standard structure

```
<name>-kb/
├── Index.md                    # Entry point with navigation
├── como-usar-este-kb.md        # Usage guide
├── <prefix>-glossary.md        # Glossary of terms
├── <prefix>-timeline.md        # Historical timeline
├── 01-Fundamentos/             # Numbered sections
│   ├── README.md               # Section overview
│   └── *.md                    # Content notes
├── references/                 # Source materials (PDFs, etc.)
└── .gitignore
```

### Frontmatter standard

```yaml
---
title: "Note Title"
tags:
  - <prefix>/<section>
  - type/concepto
  - difficulty/principiante
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Section Name"
---
```

## Maintain existing KB

### Update notes

- Update `updated` date in frontmatter when modifying.
- Keep `created` date as the original creation date.
- Fix broken `[[wikilinks]]` when notes are renamed or restructured.

### Knowledge integrity

- Keep notes atomic (one concept per note).
- Use `[[wikilinks]]` to connect related notes.
- Check for broken references: run `kb-sync.js --validate`.
- Commit workspace and graph state alongside note changes.

## Best practices

- Frontmatter is required: `title`, `tags`, `created`, `updated`.
- Use consistent naming: `kebab-case-for-files.md`.
- One directory per domain area.
- Cross-link related notes liberally — the graph is a discovery tool.
- Archive, don't delete: move obsolete notes to an `Archived/` directory.

## Tag taxonomy

- **Section tags**: `<prefix>/<section-name>` (e.g., `lean/fundamentos`)
- **Type tags**: `type/concepto`, `type/herramienta`, `type/guia`, `type/indice`
- **Difficulty tags**: `difficulty/principiante`, `difficulty/intermedio`, `difficulty/avanzado`
