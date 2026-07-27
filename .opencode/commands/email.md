---
description: Send an email using project SMTP configuration.
---

Understand the email requirements from the user. Build a JSON payload with 'to', 'subject', 'body', and optionally 'cc', 'bcc', 'html', 'attachments'. Write it to .opencode/email-payload.json.

Then run: `node shared/skills/email/scripts/send-email.js --payload .opencode/email-payload.json`

Report success or error.
