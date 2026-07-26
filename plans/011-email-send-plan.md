# Plan: Sistema de Envío de Email (3 Interfaces)

> **Estado:** Planeado  
> **Prioridad:** Alta  
> **Dependencias:** `nodemailer` (npm)

---

## Objetivo

Crear un sistema completo de envío de emails accesible desde 3 interfaces distintas (MCP, command, CLI), que funcione con Gmail SMTP y Outlook/Office365 SMTP, con soporte para attachments, CC/BCC, y envío de documentos generados por el pipeline docgen.

---

## Stack

| Componente | Tecnología |
|------------|------------|
| Lenguaje | Node.js ESM (`"type": "module"`) |
| Core SMTP | `nodemailer` (única dependencia externa) |
| MCP | JSON-RPC manual sobre stdio (sin SDK extra) |
| Credenciales | `process.env` via `.env` (ya en `.gitignore`) |
| CLI parser | `process.argv` manual (consistente con `youtube-transcript.js`) |

---

## Variables de Entorno (`.env.example`)

Se crea `.env.example` para documentar las variables requeridas:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=Tu Nombre <tu-email@gmail.com>
```

**Gmail vs Outlook:**

| Proveedor | SMTP_HOST | SMTP_PORT | Auth |
|-----------|-----------|-----------|------|
| Gmail | `smtp.gmail.com` | 587 | App password (requiere 2FA) |
| Outlook/Office365 | `smtp.office365.com` | 587 | App password o contraseña normal |

Las app passwords se configuran después por el usuario.

---

## Componentes

### 1. Core: `shared/scripts/send-email.js`

Script ESM que funciona como **módulo** (export) y como **CLI** (entry point).

**API Programática:**

```js
import { sendEmail } from './shared/scripts/send-email.js';

await sendEmail({
  to: 'user@example.com',
  cc: 'cc@example.com',           // opcional
  bcc: 'bcc@example.com',         // opcional
  subject: 'Asunto del correo',
  body: '<h1>Contenido HTML</h1>',
  html: true,                      // false = texto plano
  attachments: [                   // opcional, rutas de archivo
    'assets/docs/reporte.pdf',
    '/Users/user/foto.png'
  ]
});
```

**CLI:**

```bash
node shared/scripts/send-email.js \
  --to "user@example.com" \
  --cc "cc@example.com" \
  --bcc "bcc@example.com" \
  --subject "Asunto" \
  --body "Contenido" \
  --html \
  --attachment "ruta/al/archivo.pdf"
```

**Características:**

- Lee credenciales de `process.env` (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
- Resuelve `{env:VAR}` en strings de argumentos (consistente con `opencode.json`)
- Códigos de salida: `0` éxito, `1` error de envío, `2` error de uso
- Soporta `--payload <archivo.json>` para leer todos los args de un JSON (usado por el command)

---

### 2. MCP Server: `shared/scripts/mcp-email.js`

Servidor MCP local que se comunica por **stdin/stdout** usando JSON-RPC 2.0.

**Implementación:** Protocolo MCP manual (sin SDK), manejando:
- `initialize` — handshake con el host
- `tools/list` — lista la tool `send_email`
- `tools/call` — ejecuta `sendEmail()` del core y devuelve resultado

**Tool expuesta: `send_email`**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `to` | `string` | ✅ | Dirección del destinatario |
| `subject` | `string` | ✅ | Asunto del correo |
| `body` | `string` | ✅ | Cuerpo del mensaje |
| `cc` | `string` | ❌ | CC (separado por comas) |
| `bcc` | `string` | ❌ | BCC (separado por comas) |
| `html` | `boolean` | ❌ | `true` si body es HTML |
| `attachments` | `string[]` | ❌ | Lista de rutas de archivo |

**Registro en `opencode.json`:**

```json
"email": {
  "command": ["node", "shared/scripts/mcp-email.js"],
  "enabled": false,
  "type": "local"
}
```

Deshabilitado por defecto (como `playwright`). El usuario lo activa cambiando `"enabled": true`.

---

### 3. OpenCode Command: `platforms/opencode/commands/email.md`

Comando `/send-email` que sigue el patrón de los comandos existentes (`commit.md`, `deploy.md`, `test.md`).

**Template (guía al agente):**

```markdown
---
description: Send an email using project SMTP configuration.
---

1. Understand the email requirements from the user: to, subject, body,
   cc (optional), bcc (optional), html (optional), attachments (optional).
2. Build a JSON payload with those fields and write it to
   `.opencode/email-payload.json`.
3. Execute: `node shared/scripts/send-email.js --payload .opencode/email-payload.json`
4. Report the result (success or error with details).
```

**Registro en `opencode.json`:**

```json
"email": {
  "description": "Send an email using project SMTP configuration.",
  "template": "Understand the email requirements from the user..."
}
```

---

### 4. Skill: `shared/skills/email/SKILL.md`

Skill que documenta todo el sistema, siguiendo el patrón de `youtube/SKILL.md`.

**Estructura propuesta:**

```yaml
---
name: email
description: Send emails via SMTP (Gmail, Outlook) with CLI, MCP, and command support.
license: MIT
---
```

**Secciones:**

1. **Setup** — configuración de `.env` con credenciales SMTP
2. **Usage (CLI)** — flags y ejemplos
3. **Usage (MCP)** — cómo habilitar, examples de tool calls
4. **Usage (Command)** — cómo usar `/send-email`
5. **Attachments** — enviar archivos existentes o generados por docgen
6. **Docgen Integration** — flujo para generar y enviar reportes:

   ```bash
   npm run docgen:report assets/templates/specs/weekly-status.json \
     && node shared/scripts/send-email.js \
       --to "equipo@example.com" \
       --subject "Weekly Status Report" \
       --body "Adjunto el reporte semanal." \
       --html \
       --attachment "assets/docs/weekly-status-report.pdf"
   ```

7. **Gmail vs Outlook** — diferencias de configuración SMTP

**Relacionado con:** `document-generation`, `branding`, `content-ingestion`

---

### 5. Modificaciones a `opencode.json`

Agregar dos entradas:

```json
{
  "mcp": {
    "email": {
      "command": ["node", "shared/scripts/mcp-email.js"],
      "enabled": false,
      "type": "local"
    }
  },
  "command": {
    "email": {
      "description": "Send an email using project SMTP configuration.",
      "template": "Understand the email requirements from the user. Build a JSON payload with 'to', 'subject', 'body', and optionally 'cc', 'bcc', 'html', 'attachments'. Write it to .opencode/email-payload.json. Then run: node shared/scripts/send-email.js --payload .opencode/email-payload.json. Report success or error."
    }
  }
}
```

---

### 6. Modificaciones a `package.json`

```json
{
  "dependencies": {
    "nodemailer": "^6.9.0"
  },
  "scripts": {
    "email": "node shared/scripts/send-email.js"
  }
}
```

---

## Archivos Finales

| Archivo | Acción | LOC estimado |
|---------|--------|-------------|
| `shared/scripts/send-email.js` | **Crear** | ~120 |
| `shared/scripts/mcp-email.js` | **Crear** | ~100 |
| `platforms/opencode/commands/email.md` | **Crear** | ~20 |
| `shared/skills/email/SKILL.md` | **Crear** | ~80 |
| `platforms/opencode/opencode.json` | **Modificar** | +12 líneas |
| `package.json` | **Modificar** | +3 líneas |
| `.env.example` | **Crear** | ~8 líneas |

---

## Consideraciones Técnicas

### MCP Protocol (sin SDK)

El MCP server implementa el protocolo básico manualmente:

```
← Host envía: {"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}
→ Server responde: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}}}}

← Host envía: {"jsonrpc":"2.0","id":2,"method":"tools/list"}
→ Server responde: {"jsonrpc":"2.0","id":2,"result":{"tools":[{...}]}}

← Host envía: {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"send_email","arguments":{...}}}
→ Server responde: {"jsonrpc":"2.0","id":3,"result":{"content":[{...}]}}
```

Se implementa con `readline` (built-in de Node.js) para stdin y `process.stdout.write` para salida.

### Nodemailer

`nodemailer` es la librería SMTP estándar de Node.js (~200K stars). No requiere configuración de OAuth2 si se usa SMTP con username/password.

### Resolución de `{env:VAR}`

Consistente con el resto del proyecto: cualquier argumento string que contenga `{env:VARIABLE_NAME}` se reemplaza con `process.env[VARIABLE_NAME]`. Esto permite usar `{env:SMTP_USER}` en payloads JSON.

---

## Verificación

```bash
# 1. Instalar dependencia
npm install

# 2. Verificar que scripts existen
node shared/scripts/send-email.js --help
node shared/scripts/mcp-email.js &
sleep 1 && kill %1    # debe arrancar y esperar sin error

# 3. Test skill sync
arai sync skill email

# 4. Verificar que no rompe nada existente
npm test

# 5. (opcional) Envío real — requiere .env configurado
node shared/scripts/send-email.js \
  --to "test@example.com" \
  --subject "Prueba" \
  --body "Hola desde arai"
```

---

## Orden de Implementación

1. **`package.json`** — agregar `nodemailer` + npm script
2. **`.env.example`** — documentar variables
3. **`shared/scripts/send-email.js`** — core CLI/API con nodemailer
4. **`shared/scripts/mcp-email.js`** — MCP server sobre stdio
5. **`platforms/opencode/commands/email.md`** — command template
6. **`platforms/opencode/opencode.json`** — registrar MCP + command
7. **`shared/skills/email/SKILL.md`** — skill documentación
8. **`npm install`** + **`arai sync skill email`** + **`npm test`**
