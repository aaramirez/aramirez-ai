---
description: Create, sync, and validate knowledge base structure.
---

Manage knowledge base vaults.

## Init a new KB

Create a new knowledge base with standard structure:

```bash
node .opencode/scripts/kb-init.js <name> --prefix <prefix> --description "Description"
```

Example:
```bash
node .opencode/scripts/kb-init.js lean-kb --prefix lean --description "Lean Manufacturing Knowledge Base"
```

## Validate existing KB

```bash
node .opencode/scripts/kb-sync.js --validate <kb-directory>
```

## Fix broken wikilinks

```bash
node .opencode/scripts/kb-sync.js --fix-links <kb-directory>
```

## Reindex structure

```bash
node .opencode/scripts/kb-sync.js --reindex <kb-directory>
```

Use `kb-management` skill for vault conventions and maintenance tasks.
