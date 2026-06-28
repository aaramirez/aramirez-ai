
# KB management

Maintain an existing knowledge base vault of markdown notes with `[[wikilinks]]`. For creating new notes from external sources, see `content-ingestion`; for PDF extraction, see `pdf-extraction`.

## Structure

```
kb/
├── Architecture/     # System architecture, decisions, ADRs
├── Team/             # Team profiles, roles, responsibilities
├── Processes/        # Workflows, SOPs, runbooks
└── Knowledge/        # Reference, guides, documentation
```

## Maintenance tasks

### Update existing notes

- Update `updated` date in frontmatter when modifying.
- Keep `created` date as the original creation date.
- Fix broken `[[wikilinks]]` when notes are renamed or restructured.

### Knowledge integrity

- Keep notes atomic (one concept per note).
- Use `[[wikilinks]]` to connect related notes.
- Run `arai status` to check for inconsistencies after structural changes.
- Commit workspace and graph state alongside note changes.

## Best practices

- Frontmatter is required: `tags`, `created`, `updated`.
- Use consistent naming: `kebab-case-for-files.md`.
- One directory per domain area.
- Cross-link related notes liberally — the graph is a discovery tool.
- Archive, don't delete: move obsolete notes to an `Archived/` directory.
