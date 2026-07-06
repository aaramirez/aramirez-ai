---
tags:
  - mcp
  - email
  - command
  - cli
created: 2026-07-05
---

# Envío de emails con opencode

> **Objetivo**: Enviar emails desde opencode usando 3 interfaces: MCP server, comando `/email` y CLI directo.

**⏱ Tiempo estimado**: 10 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[03-Configuracion/01-opencode-json.md|opencode.json]]

## Resultado esperado

Poder enviar emails (texto plano, HTML, con adjuntos) desde cualquier agente de opencode, desde el chat con `/email`, o directamente desde la terminal.

## Prerrequisitos

Configura un remitente SMTP en `.env`:

```env
# Gmail (requiere App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password de 16 caracteres
SMTP_FROM=tu-correo@gmail.com
```

> **Gmail**: Activa 2FA en tu cuenta → Genera App Password en https://myaccount.google.com/apppasswords
>
> **Outlook**: Usa `smtp.office365.com`, puerto 587, con contraseña normal o App Password

## Interfaz 1 — MCP server (desde agentes)

El MCP server `email` expone herramientas que los agentes pueden invocar en lenguaje natural.

### Configuración

En `opencode.json`:

```json
"email": {
  "type": "local",
  "command": ["node", "shared/scripts/mcp-email.js"],
  "enabled": true
}
```

### Uso

Los agentes entienden instrucciones como:

```
→ "envía un email a usuario@example.com con el asunto 'Reporte' y el contenido del archivo reporte.md"
→ "manda un correo a los destinatarios en la lista contactos.txt con el resumen de la reunión"
→ "envía un email de prueba a mí mismo para verificar que el SMTP funciona"
```

El MCP server expone la herramienta `email_send` que acepta: `to`, `subject`, `body`, `cc`, `bcc`, `attachments`.

## Interfaz 2 — Comando `/email`

Para envíos rápidos desde el chat sin cargar el skill:

```
/email Envía un correo a admin@example.com con el asunto "Prueba" y el cuerpo "Hola mundo"
```

El comando está definido en `platforms/opencode/commands/email.md` y usa `$ARGUMENTS` para pasar el mensaje completo.

## Interfaz 3 — CLI directo

Para scripting o integración con otras herramientas:

```bash
# Texto plano
node shared/scripts/send-email.js \
  --to usuario@example.com \
  --subject "Asunto" \
  --body "Cuerpo del mensaje"

# Con HTML
node shared/scripts/send-email.js \
  --to usuario@example.com \
  --subject "HTML" \
  --body "<h1>Título</h1><p>Párrafo</p>" \
  --html

# Con adjunto
node shared/scripts/send-email.js \
  --to usuario@example.com \
  --subject "Con adjunto" \
  --body "Revisa el archivo" \
  --attach ./documento.pdf
```

## Archivos relacionados

- `shared/scripts/send-email.js` — core: lógica SMTP con nodemailer
- `shared/scripts/mcp-email.js` — wrapper MCP server (JSON-RPC sobre stdio)
- `platforms/opencode/commands/email.md` — definición del comando opencode
- `shared/skills/email/SKILL.md` — skill para cargar en agentes

---

**Siguiente**: [[07-MCP/07-google-workspace.md|Google Workspace — Google Drive]]
