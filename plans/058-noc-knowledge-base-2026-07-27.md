# NOC Knowledge Base — Fibex Telecom

## Objective

Create a comprehensive Obsidian-compatible knowledge base in `../fibex-noc-kb` that documents all NOC Level 1 GPON procedures, troubleshooting workflows, system integrations, and governance from the official manuals, enabling AI agent training and operational reference.

## Requirements

1. Initialize KB using `kb-init.js` with prefix `noc` — priority: high
2. Extract and structure all content from the PDF manual (45 pages) into atomic notes — priority: high
3. Extract and structure governance/SLA content from the DOCX instrument — priority: high
4. Organize into logical sections matching the manual's structure — priority: high
5. Cross-link all notes with `[[wikilinks]]` for Obsidian graph navigation — priority: high
6. Include frontmatter on every note (title, tags, created, updated, category) — priority: high
7. Create comprehensive glossary with NOC-specific terms — priority: medium
8. Create timeline of NOC process evolution — priority: low
9. Include the original reference documents in `references/` — priority: medium
10. All content in Spanish (matching source material) — priority: high

## Architecture

### Source Materials

| Document | Type | Content |
|----------|------|---------|
| `Manual de Procedimientos de Atencion de Fallas Nivel 1 NOC.pdf` | PDF, 45pp | Troubleshooting procedures, order classification, tools |
| `INSTRUMENTO INTEGRADO DE LEVANTAMIENTO GOBERNANZA OMNICANAL Y PROCESOS AGENTICOS.docx` | DOCX | Governance, SLA/KPIs, system integration, AI agent rules |

### Target Repository

`../fibex-noc-kb` — empty git repo (only `.git/` exists)

### KB Structure (following sf-kb pattern)

```
fibex-noc-kb/
├── Index.md                              # Entry point with navigation
├── como-usar-este-kb.md                  # Usage guide
├── noc-glossary.md                       # NOC glossary (terms, acronyms)
├── noc-timeline.md                       # NOC process timeline
├── 01-Fundamentos/
│   ├── README.md                         # Section overview
│   ├── 01-que-es-el-noc.md               # What is the NOC
│   ├── 02-equipos-herramientas.md        # Tools: SaePlus, SmartOLT, Winbox, etc.
│   ├── 03-roles-responsabilidades.md     # Analista Nivel 1 GPON, Mesa de Control, etc.
│   └── 04-canales-atencion.md            # APICONEXVE, Call Center, Medios Digitales, ATC
├── 02-Procedimientos-Comunes/
│   ├── README.md                         # Section overview
│   ├── 01-crear-orden-reclamo.md         # Proc 1.1: Create claim order
│   ├── 02-crear-orden-servicio.md        # Proc 1.2: Create service order
│   ├── 03-verificar-estatus-saeplus.md   # Proc 1.3: SaePlus status checks
│   ├── 04-estatus-servicio-activo.md     # Proc 1.3.1: Active service
│   ├── 05-estatus-servicio-cortado.md    # Proc 1.3.1.1: Cut service
│   ├── 06-estatus-por-reconectar.md      # Proc 1.3.1.2: To reconnect
│   ├── 07-estatus-por-instalar.md        # Proc 1.3.1.3: To install
│   ├── 08-estatus-suspendido.md          # Proc 1.3.1.4: Suspended
│   ├── 09-estatus-smartolt.md            # Proc 1.4: SmartOLT status checks
│   ├── 10-status-los-off-signal.md       # Proc 1.4.1: LOS off Signal
│   ├── 11-status-power-fail.md           # Proc 1.4.2: Power Fail
│   ├── 12-status-offline.md              # Proc 1.4.3: Offline
│   ├── 13-validar-servicio-smartolt.md   # Proc 1.5: Validate service in SmartOLT
│   ├── 14-validar-niveles-optimicos.md   # Proc 1.6: Validate optical levels
│   ├── 15-reinicar-ont.md                # Proc 1.7: Reboot ONT
│   ├── 16-escalabilidad-remota.md        # Proc 1.8: Remote scalability
│   ├── 17-solicitar-informacion-cliente.md # Proc 1.9: Request client info
│   ├── 18-verificar-ont-servicio.md      # Proc 1.10: Verify ONT service
│   ├── 19-realizar-prueba-navegacion.md  # Proc 1.11: Navigation test
│   ├── 20-verificar-red-wifi.md          # Proc 1.12: Verify WiFi network
│   ├── 21-contactar-cliente-solucion.md  # Proc 1.13: Contact client with solution
│   ├── 22-contactar-cliente-averia-general.md # Proc 1.14: General outage notification
│   ├── 23-cambiar-vlan.md                # Proc 1.15: Change VLAN
│   ├── 24-crear-orden-visita-tecnica.md  # Proc 1.16: Create technical visit order
│   ├── 25-cambiar-estado-orden.md        # Proc 1.17: Change order status
│   ├── 26-observacion-orden.md           # Proc 1.18: Order observations
│   ├── 27-finalizar-orden-reclamo.md     # Proc 1.3.1.11: Finalize claim order
│   ├── 28-finalizar-orden-servicio.md    # Proc 1.3.1.12: Finalize service order
│   ├── 29-finalizar-cambio-clave.md      # Proc 1.3.1.13: Finalize password change
│   ├── 30-escalar-mesa-control.md        # Proc 7.4: Escalate to Mesa de Control
│   └── 31-solicitar-cierre-sesion.md     # Proc 1.19: Request session closure
├── 03-Flujos-Troubleshooting/
│   ├── README.md                         # Section overview
│   ├── 01-flujo-sin-internet.md          # Flow 1: "SIN INTERNET"
│   ├── 02-flujo-lentitud.md              # Flow 2: "LENTITUD"
│   ├── 03-flujo-caidas-seguidas.md       # Flow 3: "CAÍDAS SEGUIDAS"
│   ├── 04-flujo-cambio-clave-wifi.md     # Flow 4: "CAMBIO DE CLAVE WI-FI"
│   ├── 05-flujo-no-navega-paginas.md     # Flow 5: "NO NAVEGA EN CIERTAS PÁGINAS"
│   └── 06-flujo-falla-los.md             # Flow 6: "FALLA LOS"
├── 04-Gestion-Ordenes/
│   ├── README.md                         # Section overview
│   ├── 01-clasificacion-ordenes.md       # Section 8: Order classification (6 categories)
│   ├── 02-cierre-comun-ordenes.md        # Section 7: Common closure procedure
│   └── 03-herramientas-gestion.md        # Section 9: Tools used
├── 05-Sistemas-Integracion/
│   ├── README.md                         # Section overview
│   ├── 01-saeplus-sistema.md             # SAE Plus: orders, tickets, service params
│   ├── 02-smartolt-sistema.md            # SmartOLT: monitoring, diagnostics, alarms
│   ├── 03-winbox-mikrotik.md             # Winbox: MikroTik router management
│   ├── 04-tr069-protocolo.md             # TR-069: remote ONT management protocol
│   └── 05-matriz-integracion-core.md     # DOCX: System integration matrix
├── 06-SLA-KPIs/
│   ├── README.md                         # Section overview
│   ├── 01-sla-acuerdos.md                # DOCX: SLA agreements
│   ├── 02-kpi-linea-base.md              # DOCX: KPI baseline & targets
│   └── 03-metricas-objetivo.md           # Pre-diagnostic, resolution rate, etc.
├── 07-Gobernanza-AI/
│   ├── README.md                         # Section overview
│   ├── 01-gobernanza-aprobacion.md       # DOCX: Centralized governance & approval
│   ├── 02-procesos-agenticos.md          # DOCX: AI agent processes for Sofia
│   ├── 03-reglas-negocio-retencion.md    # DOCX: Upsell/retention rules
│   ├── 04-respuestas-institucionales.md  # DOCX: Q&A responses for client-facing AI
│   └── 05-integracion-sistemas-ia.md     # DOCX: AI system integration (read/write)
├── references/
│   ├── manual-procedimientos-noc.pdf     # Copy of source PDF
│   └── instrumento-gobernanza.docx       # Copy of source DOCX
└── .gitignore
```

### Section Mapping from Source

| KB Section | PDF Section | DOCX Section |
|------------|-------------|--------------|
| 01-Fundamentos | Implicit (context) | "Datos de Levantamiento" |
| 02-Procedimientos-Comunes | Section 1 (Procedures 1.1-1.19) | — |
| 03-Flujos-Troubleshooting | Sections 2-6 (Troubleshooting flows) | "Casos de Uso Comerciales" |
| 04-Gestion-Ordenes | Sections 7-9 (Closure, Classification, Tools) | — |
| 05-Sistemas-Integracion | Tools references throughout | "Matriz de Integración Core" |
| 06-SLA-KPIs | — | "Acuerdos de Nivel de Servicio" |
| 07-Gobernanza-AI | — | "Gobernanza y Aprobación" + AI processes |

### Decisions

1. **Use `kb-init.js`** for base structure, then customize sections manually
2. **Atomic notes**: Each procedure, flow, and concept gets its own file
3. **Spanish language**: All content stays in Spanish matching source material
4. **Prefix `noc`**: Tag taxonomy uses `noc/<section>` for section tags
5. **Reference docs copied**: Original PDF/DOCX placed in `references/` for traceability
6. **Cross-linking**: Wikilinks connect procedures → troubleshooting flows → systems → SLAs
7. **Frontmatter standard**: Every note gets `title`, `tags`, `created`, `updated`, `category`

## File Changes

### New Files (in `../fibex-noc-kb/`)

| File | Source | Description |
|------|--------|-------------|
| `Index.md` | kb-init.js + manual | Entry point with full navigation |
| `como-usar-este-kb.md` | kb-init.js | Usage guide customized for NOC |
| `noc-glossary.md` | PDF + DOCX | NOC terms, acronyms (OLT, ONT, GPON, etc.) |
| `noc-timeline.md` | DOCX | NOC process timeline |
| `01-Fundamentos/README.md` | kb-init.js | Fundamentals section overview |
| `01-Fundamentos/01-que-es-el-noc.md` | DOCX | NOC definition, mission |
| `01-Fundamentos/02-equipos-herramientas.md` | PDF §9 + DOCX | Tools inventory |
| `01-Fundamentos/03-roles-responsabilidades.md` | DOCX | Roles: Analista, Especialista, Mesa Control |
| `01-Fundamentos/04-canales-atencion.md` | DOCX | ATC channels |
| `02-Procedimientos-Comunes/README.md` | — | Section overview |
| `02-Procedimientos-Comunes/*.md` (31 files) | PDF §1 | All common procedures |
| `03-Flujos-Troubleshooting/README.md` | — | Section overview |
| `03-Flujos-Troubleshooting/01-flujo-sin-internet.md` | PDF §2 | "SIN INTERNET" flow |
| `03-Flujos-Troubleshooting/02-flujo-lentitud.md` | PDF §2 | "LENTITUD" flow |
| `03-Flujos-Troubleshooting/03-flujo-caidas-seguidas.md` | PDF §3 | "CAÍDAS SEGUIDAS" flow |
| `03-Flujos-Troubleshooting/04-flujo-cambio-clave-wifi.md` | PDF §4 | "CAMBIO DE CLAVE" flow |
| `03-Flujos-Troubleshooting/05-flujo-no-navega-paginas.md` | PDF §5 | "NO NAVEGA EN CIERTAS PÁGINAS" flow |
| `03-Flujos-Troubleshooting/06-flujo-falla-los.md` | PDF §6 | "FALLA LOS" flow |
| `04-Gestion-Ordenes/README.md` | — | Section overview |
| `04-Gestion-Ordenes/01-clasificacion-ordenes.md` | PDF §8 | 6 fault categories |
| `04-Gestion-Ordenes/02-cierre-comun-ordenes.md` | PDF §7 | Common closure |
| `04-Gestion-Ordenes/03-herramientas-gestion.md` | PDF §9 | Tool details |
| `05-Sistemas-Integracion/README.md` | — | Section overview |
| `05-Sistemas-Integracion/01-saeplus-sistema.md` | DOCX | SAE Plus details |
| `05-Sistemas-Integracion/02-smartolt-sistema.md` | DOCX + PDF | SmartOLT details |
| `05-Sistemas-Integracion/03-winbox-mikrotik.md` | PDF | Winbox usage |
| `05-Sistemas-Integracion/04-tr069-protocolo.md` | PDF | TR-069 protocol |
| `05-Sistemas-Integracion/05-matriz-integracion-core.md` | DOCX | Integration matrix |
| `06-SLA-KPIs/README.md` | — | Section overview |
| `06-SLA-KPIs/01-sla-acuerdos.md` | DOCX | SLA definitions |
| `06-SLA-KPIs/02-kpi-linea-base.md` | DOCX | KPI baselines |
| `06-SLA-KPIs/03-metricas-objetivo.md` | DOCX | Target metrics |
| `07-Gobernanza-AI/README.md` | — | Section overview |
| `07-Gobernanza-AI/01-gobernanza-aprobacion.md` | DOCX | Governance |
| `07-Gobernanza-AI/02-procesos-agenticos.md` | DOCX | AI agent processes |
| `07-Gobernanza-AI/03-reglas-negocio-retencion.md` | DOCX | Retention/upsell rules |
| `07-Gobernanza-AI/04-respuestas-institucionales.md` | DOCX | Client Q&A |
| `07-Gobernanza-AI/05-integracion-sistemas-ia.md` | DOCX | AI system read/write |
| `references/manual-procedimientos-noc.pdf` | — | Source PDF copy |
| `references/instrumento-gobernanza.docx` | — | Source DOCX copy |
| `.gitignore` | kb-init.js | Standard gitignore |

### Modified Files

None — this is a new KB in an empty repo.

## TDD Flow

This is a content/documentation project, not a code project. The "test" equivalent is:

1. **Validate structure** → Run `kb-sync.js --validate` after creation to check wikilinks
2. **Validate frontmatter** → Ensure every `.md` file has required frontmatter fields
3. **Validate navigation** → Every section README links to its notes, every note links back
4. **Validate glossary** → All acronyms in content appear in glossary
5. **Validate cross-links** → No broken `[[wikilinks]]`

## Verification

- [ ] `kb-init.js` creates base structure successfully
- [ ] All 7 sections created with README.md
- [ ] All 31 procedure notes created from PDF §1
- [ ] All 6 troubleshooting flow notes created from PDF §2-6
- [ ] All DOCX content structured into sections 05-07
- [ ] Every `.md` file has valid frontmatter (title, tags, created, updated, category)
- [ ] All `[[wikilinks]]` resolve to existing files
- [ ] Glossary contains all NOC-specific acronyms
- [ ] Reference documents copied to `references/`
- [ ] `noc-glossary.md` cross-references all terms used in notes
- [ ] Git status shows all files tracked

## Implementation Order

1. Run `kb-init.js` to scaffold base structure
2. Customize directories (rename 01-Fundamentos, create 02-07)
3. Create Index.md with full navigation table
4. Create glossary from extracted terms
5. Create 01-Fundamentos section (4 notes)
6. Create 02-Procedimientos-Comunes section (31 notes)
7. Create 03-Flujos-Troubleshooting section (6 notes)
8. Create 04-Gestion-Ordenes section (3 notes)
9. Create 05-Sistemas-Integracion section (5 notes)
10. Create 06-SLA-KPIs section (3 notes)
11. Create 07-Gobernanza-AI section (5 notes)
12. Copy reference documents
13. Run validation (wikilinks, frontmatter)
14. Fix any broken links or missing content
