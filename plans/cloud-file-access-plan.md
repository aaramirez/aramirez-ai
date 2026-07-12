# Plan: Acceso a Archivos en Google Drive y SharePoint/OneDrive

> **Estado:** Planeado  
> **Prioridad:** Alta  
> **Estrategia:** MCP servers via npx (sin dependencias npm nuevas en el proyecto)

---

## Resumen Ejecutivo

Usar **MCP servers existentes** para acceder a Google Drive y SharePoint/OneDrive. Ambos se ejecutan via `npx` (como `playwright` en el proyecto), no requieren instalar dependencias en `package.json`, y se configuran en `opencode.json` deshabilitados por defecto.

Cada servicio tiene su propio skill para documentar setup OAuth y uso.

---

## Estrategia Recomendada

| Servicio | MCP Server | Tipo | Stars / Oficial |
|----------|-----------|------|----------------|
| **Google Drive** | [Google Workspace MCP](https://github.com/gemini-cli-extensions/workspace) | Local (open-source) ⭐ 4.3k | **Oficial de Google** — Docs, Sheets, Slides, Calendar, Gmail + Drive |
| **Google Drive** (alt) | [Drive MCP API](https://developers.google.com/workspace/drive/api/guides/configure-mcp-server) | Remote (Google-managed) | **Oficial de Google** — Developer Preview |
| **SharePoint / OneDrive** | `@softeria/ms-365-mcp-server` | Local (npx) ⭐ 812 | **Mejor comunidad** — 200+ tools, 257 releases, OneDrive + SharePoint + Outlook + Teams |
| **SharePoint / OneDrive** (alt) | [Microsoft MCP remoto](https://learn.microsoft.com/en-us/graph/mcp-server/overview) | Remote (Microsoft-managed) | **Oficial de Microsoft** — solo Entra ID (no archivos) en preview |

> **Recomendación:**
> - **Google Drive:** Workspace MCP oficial de Google (open-source, 4.3k stars)
> - **SharePoint/OneDrive:** `@softeria/ms-365-mcp-server` (Microsoft no tiene aún server oficial para archivos — el ODSP combinado fue deprecado en marzo 2026, y el MCP Server for Enterprise solo cubre Entra ID)

---

## 1. Google Drive — Google Workspace MCP (oficial)

### Tools expuestas

| Tool | Descripción |
|------|-------------|
| `drive_files_list` | Listar archivos en Google Drive |
| `drive_files_get` | Obtener metadata de un archivo |
| `drive_files_export` | Exportar contenido (Docs→MD, Sheets→CSV, Slides→txt) |
| `drive_files_search` | Buscar archivos por query |
| `docs_documents_get` | Leer contenido de un Google Doc |
| `sheets_values_get` | Leer celdas de un Google Sheet |

### Setup OAuth

Usa `gws` (Google Workspace CLI) para autenticación automática:

1. Opción A: `npx -y @google/mcp-workspace auth` — abre browser para flujo OAuth
2. Opción B manual: crear proyecto en [Google Cloud Console](https://console.cloud.google.com/projectcreate) → habilitar Drive API → OAuth Client ID (Desktop App) → descargar credentials.json

### Registro en `opencode.json`

```json
"google-workspace": {
  "command": [
    "npx", "-y",
    "@google/mcp-workspace"
  ],
  "enabled": false,
  "type": "local"
}
```

> También existe la [Drive MCP API](https://developers.google.com/workspace/drive/api/guides/configure-mcp-server) remota de Google (Developer Preview) como alternativa server-managed.

---

## 2. SharePoint / OneDrive — `@softeria/ms-365-mcp-server`

### Tools expuestas (archivos)

| Tool | Descripción |
|------|-------------|
| `graph_list_drive_children` | Listar archivos en un directorio de OneDrive |
| `graph_get_drive_item` | Obtener metadata de un archivo/carpeta |
| `graph_download_drive_item` | Descargar contenido de un archivo |
| `graph_search_drive` | Buscar archivos en OneDrive/SharePoint |
| `graph_list_sites` | Listar sitios de SharePoint |
| `graph_list_site_drives` | Listar document libraries de un sitio |
| `graph_list_site_children` | Listar archivos en una library |

Además cubre: Outlook, Teams, Calendar, Excel, OneNote — todo M365.

### Setup Azure AD

1. Ir a [Azure Portal](https://portal.azure.com) → App registrations
2. Crear nueva registración con redirect URI `http://localhost`
3. Agregar permisos Microsoft Graph:
   - `Files.Read.All` (leer archivos OneDrive/SharePoint)
   - `Sites.Read.All` (leer sitios SharePoint)
   - `User.Read` (perfil usuario)
4. Generar client secret
5. Autenticar via device-code flow (primera vez)

### Variables de entorno

```env
# Azure AD
AZURE_CLIENT_ID=tu-client-id
AZURE_TENANT_ID=tu-tenant-id
AZURE_CLIENT_SECRET=tu-client-secret

# Opcional: filtrar a read-only
M365_READ_ONLY_MODE=true
```

### Registro en `opencode.json`

```json
"m365": {
  "command": [
    "npx", "-y",
    "@softeria/ms-365-mcp-server"
  ],
  "enabled": false,
  "type": "local",
  "env": {
    "AZURE_CLIENT_ID": "{env:AZURE_CLIENT_ID}",
    "AZURE_TENANT_ID": "{env:AZURE_TENANT_ID}",
    "AZURE_CLIENT_SECRET": "{env:AZURE_CLIENT_SECRET}",
    "M365_READ_ONLY_MODE": "true"
  }
}
```

---

## 3. Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `shared/skills/google-workspace/SKILL.md` | Skill Google Workspace: setup GCP OAuth, tools, ejemplos búsqueda/lectura |
| `shared/skills/m365/SKILL.md` | Skill M365: setup Azure AD, tools (OneDrive, SharePoint), ejemplos |
| `.env.example` | Ya existe — agregar sección Azure AD |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `platforms/opencode/opencode.json` | Agregar `mcp.google-workspace` + `mcp.m365` (ambos disabled) |
| `.env.example` | Agregar comentarios para Azure AD variables |

**No se modifica `package.json`** — ambos MCP se ejecutan via `npx -y`, sin instalar dependencias.

---

## 4. Estructura de Skills

### `shared/skills/google-workspace/SKILL.md`

- **Setup:** Google Cloud Project, OAuth consent, autenticación con `gws`
- **Uso:** `drive_files_list`, `drive_files_search`, `drive_files_export`, `docs_documents_get`, `sheets_values_get`
- **Ejemplos:** buscar documento, leer hoja de cálculo, exportar a Markdown
- **Related:** `email` (adjuntar archivos), `content-ingestion` (estructurar contenido leído)

### `shared/skills/m365/SKILL.md`

- **Setup:** Azure AD app registration, permisos Graph
- **Uso:** `graph_list_drive_children`, `graph_search_drive`, `graph_download_drive_item`, `graph_list_sites`
- **Ejemplos:** listar archivos en OneDrive, buscar en SharePoint, descargar documento
- **Diferencia OneDrive vs SharePoint:** cómo navegar cada uno
- **Related:** `google-workspace`, `email`, `content-ingestion`

---

## 5. Consideraciones

### OAuth Setup (one-time)
Ambos servicios requieren setup inicial de OAuth:
- **Google:** Usa `npx -y @google/mcp-workspace auth` para flujo OAuth automático. O manual: Google Cloud Project → OAuth Client ID.
- **Microsoft:** Azure AD app registration. `@softeria/ms-365-mcp-server` soporta device-code flow para auth interactiva (primera vez).

### Seguridad
- Ambos MCP **disabled por defecto** (como playwright + email)
- `M365_READ_ONLY_MODE=true` por defecto (evita escrituras accidentales)
- Credenciales via `{env:VAR}` resueltas del entorno (nunca en texto plano)
- `.env` en `.gitignore`

### Experiencia de uso
```
# Buscar y leer un archivo de Google Drive
→ "búscame el documento 'plan estratégico' en Google Drive"
→ "léeme el archivo con ID abc123"

# Listar y descargar de SharePoint
→ "muéstrame los archivos en mi OneDrive"
→ "busca en SharePoint el documento 'reporte Q2'"
→ "descarga ese archivo y adjúntalo a un email"
```

### Integración cross-skill
El skill `email` ya permite adjuntar archivos. Con estos skills, el flujo completo sería:

```
"búscame el reporte en Google Drive, léelo, genera un resumen,
 y envíalo por email al equipo"
```

---

## 6. Orden de Implementación

| # | Archivo / Acción | Propósito |
|---|-----------------|-----------|
| 1 | `platforms/opencode/opencode.json` | Agregar `mcp.google-workspace` + `mcp.m365` (disabled) |
| 2 | `.env.example` | Agregar sección Azure AD |
| 3 | `shared/skills/google-workspace/SKILL.md` | Skill Google Workspace |
| 4 | `shared/skills/m365/SKILL.md` | Skill M365 |
| 5 | `arai sync skill google-workspace` | Sincronizar skill Google Workspace |
| 6 | `arai sync skill m365` | Sincronizar skill M365 |
| 7 | `AGENTS.md` | Agregar skills al árbol de directorios y tabla de skills; documentar MCP servers nuevos |
| 8 | `README.md` | Agregar skills a la lista de skills disponibles |
| 9 | `tutoriales-arai/08-Google-Workspace/` | Nuevo tutorial: setup OAuth, tools, ejemplos |
| 10 | `tutoriales-arai/09-Microsoft-365/` | Nuevo tutorial: Azure AD setup, tools OneDrive/SharePoint, ejemplos |
| 11 | `npm test` | Verificar que todo pasa, incluyendo validaciones de consistencia de AGENTS.md y README.md |

---

## 7. Verificación

```bash
# Skills instalados correctamente
arai list skills | grep -E "google-workspace|m365"

# Config JSON válido
node -e "JSON.parse(require('fs').readFileSync('platforms/opencode/opencode.json','utf8'))" && echo "OK"

# Tests
npm test
```
