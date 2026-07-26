# UPlan: Reestructurar tutoriales MCP

## Problema

Los tutoriales de Google Workspace y Microsoft 365 están en directorios separados (`12-Google-Workspace/`, `13-Microsoft-365/`) cuando deberían estar dentro de la sección `07-MCP/` que ya existe. Además:

- Cada MCP está dividido en 2 archivos (setup + uso) en vez de 1 consolidado
- El MCP de email no tiene tutorial propio
- AGENTS.md solo referencia el MCP de email (no el command ni el CLI)
- README.md no referencia el email en absoluto

## Estructura propuesta

### 07-MCP/ (modificada)

```
07-MCP/
├── Index.md                     ← Agregar entradas 06, 07, 08
├── 01-servidores-mcp.md         ← Sin cambios
├── 02-comandos-personalizados.md ← Sin cambios
├── 03-plugins.md                ← Sin cambios
├── 04-herramientas-personalizadas.md ← Sin cambios
├── 05-uso-creators.md           ← Sin cambios
├── 06-email.md                  ← NUEVO: las 3 interfaces (MCP + command + CLI)
├── 07-google-workspace.md       ← CONSOLIDADO: setup + uso en un solo archivo
└── 08-microsoft-365.md          ← CONSOLIDADO: setup + uso en un solo archivo
```

### Archivos a eliminar

```
tutoriales-arai/12-Google-Workspace/   ← rm -rf todo el directorio
tutoriales-arai/13-Microsoft-365/      ← rm -rf todo el directorio
```

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `07-MCP/Index.md` | Agregar entradas 06, 07, 08 |
| `tutoriales-arai/Index.md` | Remover secciones 12 y 13 |
| `shared/skills/email/SKILL.md` | (si existe, verificar) |
| `AGENTS.md` | Agregar referencias a email command + email CLI |
| `README.md` | Agregar email a skills table |

### Archivos a crear

| Archivo | Contenido |
|---------|-----------|
| `07-MCP/06-email.md` | Consolidado: MCP email server + email command + send-email CLI, con ejemplos de cada uno |
| `07-MCP/07-google-workspace.md` | Consolidado: setup OAuth + habilitar MCP + ejemplos de uso |
| `07-MCP/08-microsoft-365.md` | Consolidado: Azure AD setup + habilitar MCP + ejemplos de uso |

## Contenido de cada nuevo tutorial

### `06-email.md` — Envío de emails (3 interfaces)

- **Objetivo**: Enviar emails desde opencode usando 3 interfaces
- **Requisitos**: `opencode.json` básico, `.env` con credenciales SMTP
- **Interfaz 1 — MCP Server**: Habilitar `mcp_servers.email`, herramientas `email_send`
- **Interfaz 2 — Comando opencode**: `/email` command con `$ARGUMENTS`
- **Interfaz 3 — CLI directo**: `node shared/scripts/send-email.js`
- **Ejemplos**: email simple, con adjunto, con HTML
- **Prerrequisitos**: Gmail App Password / Outlook SMTP
- **Archivos relacionados**: `shared/scripts/send-email.js`, `shared/scripts/mcp-email.js`, `platforms/opencode/commands/email.md`

### `07-google-workspace.md` — Google Drive, Docs y Sheets

- **Objetivo**: Acceder a archivos de Google desde opencode
- **OAuth**: `npx -y @google/mcp-workspace auth` (automático) o Google Cloud Console (manual)
- **Config**: Habilitar `mcp_servers.google-workspace` en opencode.json
- **Uso**: Listar, buscar, leer, exportar archivos
- **Integración**: Con `email` para adjuntar, con `content-ingestion` para estructurar
- **Referencia**: `shared/skills/google-workspace/SKILL.md`

### `08-microsoft-365.md` — OneDrive y SharePoint

- **Objetivo**: Acceder a archivos de Microsoft 365 desde opencode
- **Azure AD**: App registration + permisos Graph API + client secret
- **Config**: `.env` con AZURE_* vars + habilitar `mcp_servers.m365`
- **Uso**: OneDrive personal, sitios SharePoint, búsqueda, descarga
- **Referencia**: `shared/skills/m365/SKILL.md`

## Cambios en AGENTS.md — específicos

Actualmente AGENTS.md tiene:
- ✅ MCP email referenced (tabla MCP Servers, línea 114)
- ❌ Email command NO referenced
- ❌ Email CLI NO referenced
- ❌ Email skill NO en la lista de Available skills
- ❌ Email command NO en la tabla de OpenCode commands

### Cambios concretos

**1. Skills list** (línea 79): Insertar `email,` después de `document-generation,`:
```
Available skills: **branding**, **code-review**, **content-ingestion**, **document-generation**, **email**, **git**, ...
```

**2. MCP Servers table** (línea 114): Modificar la celda de descripción de `email` para mencionar el comando y el CLI:
```
| **email** | local (`node shared/scripts/mcp-email.js`) | SMTP email — 3 interfaces: MCP server, /email command, send-email.js CLI |
```

**3. OpenCode commands** (líneas 133-141): Actualizar "3 commands" → "4 commands" y agregar fila:
```
| `email` | Send an email via SMTP (requires .env SMTP config) |
```

## Cambios en README.md — específicos

Actualmente README.md tiene:
- ❌ Email NO referenced anywhere (ni skills table, ni ningún lado)

### Cambios concretos

**1. Skills table** (entre `document-generation` y `git`): Agregar fila:
```
| **email** | Envío de emails vía SMTP — 3 interfaces: MCP server, comando `/email`, y CLI `send-email.js` |
```

## Orden de ejecución

1. Crear `07-MCP/06-email.md`
2. Crear `07-MCP/07-google-workspace.md`
3. Crear `07-MCP/08-microsoft-365.md`
4. Actualizar `07-MCP/Index.md` (agregar entradas 06, 07, 08)
5. Actualizar `tutoriales-arai/Index.md` (remover 12, 13)
6. Eliminar `tutoriales-arai/12-Google-Workspace/`
7. Eliminar `tutoriales-arai/13-Microsoft-365/`
8. `AGENTS.md` — skills list: agregar `email` (línea 79)
9. `AGENTS.md` — MCP Servers table: ampliar descripción de email con command + CLI (línea 114)
10. `AGENTS.md` — OpenCode commands: agregar comando `email` (líneas 133-141)
11. `README.md` — skills table: agregar fila `**email**`
12. Verificar wikilinks en otros tutoriales que referencien 12-* o 13-*
13. `npm test`

## Verificación

- `npm test` — debe pasar 786+ tests
- Verificar que no haya wikilinks rotos a 12-Google-Workspace o 13-Microsoft-365 (grep en tutoriales-arai/)
- Verificar que `07-MCP/Index.md` tenga los 8 tutoriales enumerados
- Verificar que `tutoriales-arai/Index.md` no mencione 12 ni 13
