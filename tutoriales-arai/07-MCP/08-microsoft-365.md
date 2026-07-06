---
tags:
  - mcp
  - m365
  - onedrive
  - sharepoint
created: 2026-07-05
---

# Microsoft 365 — OneDrive y SharePoint

> **Objetivo**: Configurar y usar el acceso a OneDrive y SharePoint desde opencode vía Microsoft Graph API.

**⏱ Tiempo estimado**: 15 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[07-MCP/01-servidores-mcp.md|Servidores MCP]]

## Resultado esperado

Poder ejecutar herramientas como `graph_list_drive_children`, `graph_search_drive` y `graph_download_drive_item` desde cualquier agente de opencode.

## 1. Azure AD

1. Ve a [Azure Portal](https://portal.azure.com) → App registrations
2. Crea una nueva registración con redirect URI `http://localhost`
3. Agrega permisos Microsoft Graph:
   - `Files.Read.All` — leer archivos OneDrive/SharePoint
   - `Sites.Read.All` — leer sitios SharePoint
   - `User.Read` — perfil de usuario
4. Genera un client secret y cópialo

## 2. Variables de entorno

Agrega a `.env`:

```env
AZURE_CLIENT_ID=tu-client-id
AZURE_TENANT_ID=tu-tenant-id
AZURE_CLIENT_SECRET=tu-client-secret
```

## 3. Habilitar MCP server

En `opencode.json`:

```json
"m365": {
  "type": "local",
  "command": ["npx", "-y", "@softeria/ms-365-mcp-server"],
  "enabled": true,
  "env": {
    "AZURE_CLIENT_ID": "{env:AZURE_CLIENT_ID}",
    "AZURE_TENANT_ID": "{env:AZURE_TENANT_ID}",
    "AZURE_CLIENT_SECRET": "{env:AZURE_CLIENT_SECRET}",
    "M365_READ_ONLY_MODE": "true"
  }
}
```

La primera vez, el server inicia un device-code flow para autenticar.

## 4. Uso

### OneDrive personal

```
→ "muéstrame los archivos en mi OneDrive"
→ "busca el archivo 'reporte Q2' en OneDrive"
→ "lista los archivos en la carpeta 'Documentos'"
```

### SharePoint

```
→ "lista los sitios de SharePoint que tengo"
→ "muéstrame las bibliotecas de documentos del sitio 'Ventas'"
→ "busca en SharePoint documentos sobre 'estrategia'"
```

### Descargar archivos

```
→ "descarga ese archivo y guárdalo localmente"
→ "baja la presentación 'kickoff' y adjúntala a un email"
```

### Tools principales

| Tool | Descripción |
|------|-------------|
| `graph_list_drive_children` | Listar archivos en un directorio |
| `graph_get_drive_item` | Metadata de un archivo |
| `graph_download_drive_item` | Descargar contenido |
| `graph_search_drive` | Buscar archivos |
| `graph_list_sites` | Listar sitios SharePoint |
| `graph_list_site_drives` | Listar document libraries de un sitio |

### OneDrive vs SharePoint

| Aspecto | OneDrive | SharePoint |
|---------|----------|------------|
| Drive ID | `me` | De `graph_list_site_drives` |
| Búsqueda | `graph_search_drive` | `graph_search_drive` con scope |

## Referencia

- Skill: `shared/skills/m365/SKILL.md`
- Repo: https://github.com/Softeria/ms-365-mcp-server

---

**Siguiente**: [[08-Referencias/Index|Prompts, Reglas y Branding]]
