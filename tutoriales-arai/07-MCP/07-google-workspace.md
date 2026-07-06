---
tags:
  - mcp
  - google-workspace
  - drive
created: 2026-07-05
---

# Google Workspace — Google Drive, Docs y Sheets

> **Objetivo**: Configurar y usar el acceso a Google Drive, Docs y Sheets desde opencode vía el MCP server oficial de Google.

**⏱ Tiempo estimado**: 10 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[07-MCP/01-servidores-mcp.md|Servidores MCP]]

## Resultado esperado

Poder ejecutar herramientas como `drive_files_list`, `drive_files_search` y `docs_documents_get` desde cualquier agente de opencode.

## 1. Autenticación OAuth

Opción A (automática):

```bash
npx -y @google/mcp-workspace auth
```

Esto abre el navegador para el flujo OAuth. Las credenciales se guardan localmente.

Opción B (manual):

1. Ve a [Google Cloud Console](https://console.cloud.google.com/projectcreate)
2. Crea un proyecto y habilita Google Drive API + Google Docs API
3. Configura pantalla de consentimiento OAuth
4. Crea un OAuth Client ID (Desktop App)
5. Descarga el JSON y guárdalo

## 2. Habilitar MCP server

En `opencode.json`, activa el servidor:

```json
"google-workspace": {
  "type": "local",
  "command": ["npx", "-y", "@google/mcp-workspace"],
  "enabled": true
}
```

## 3. Uso

Una vez autenticado y habilitado, los agentes entienden instrucciones como:

```
→ "lista los archivos en mi Google Drive"
→ "búscame el documento 'plan estratégico' en Google Drive"
→ "léeme el Google Doc con ID abc123..."
→ "exporta ese Google Sheet a CSV"
→ "muéstrame los archivos de tipo hoja de cálculo creados este mes"
```

### Tools principales

| Tool | Descripción |
|------|-------------|
| `drive_files_list` | Listar archivos |
| `drive_files_get` | Metadata de un archivo |
| `drive_files_export` | Exportar contenido (Doc → MD, Sheet → CSV) |
| `drive_files_search` | Buscar archivos por query |
| `docs_documents_get` | Leer contenido de un Google Doc |
| `sheets_values_get` | Leer celdas de un Google Sheet |

## Troubleshooting

- Si el auth expira, repite `npx -y @google/mcp-workspace auth`
- Asegúrate de tener `"enabled": true` en opencode.json

## Integración

Combínalo con el skill `email` para adjuntar archivos, o con `content-ingestion` para estructurar contenido leído.

## Referencia

- Skill: `shared/skills/google-workspace/SKILL.md`
- Repo: https://github.com/googleapis/mcp-workspace

---

**Siguiente**: [[07-MCP/08-microsoft-365.md|Microsoft 365 — OneDrive y SharePoint]]
