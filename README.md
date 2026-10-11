# ENCUADRE

**Alinea la visión. Antes de tomar la foto.**

**Proyecto web de hackathon · Fotografía, experiencia de usuario e IA aplicada.**

[Ver despliegue registrado en GitHub](https://encuadre-ai.vercel.app) · [Arquitectura](docs/ARCHITECTURE.md) · [Motor de alineación](docs/ALIGNMENT_ENGINE.md)

> **Alcance:** MVP experimental. El Alignment Score es una heurística definida por el proyecto; no equivale a una medida científica validada de compatibilidad creativa. La disponibilidad del despliegue no se comprobó en esta revisión.

ENCUADRE es una plataforma web que alinea las expectativas visuales entre fotógrafo y cliente antes de una sesión fotográfica, eliminando el problema de que las expectativas se comunican con palabras subjetivas cuando deberían validarse visualmente.

---

## En pocas palabras

ENCUADRE propone transformar expectativas fotográficas subjetivas en referencias visuales que cliente y fotógrafo pueden comparar antes de una sesión. El flujo descrito contempla un perfil visual del fotógrafo (Style DNA), selección de preferencias, una puntuación de alineación calculada mediante código y un brief compartido.

| Área | Implementación documentada |
| --- | --- |
| Aplicación | Next.js, React y TypeScript |
| Persistencia/autenticación | Supabase |
| Experiencia de usuario | Flujo fotógrafo → cliente → acuerdo visual |
| IA | Análisis de referencias visuales como parte del MVP |
| Alineación | Heurística determinística; no es una decisión de un LLM |

El código y los documentos describen el MVP; el README **no certifica** que todos los pasos estén operativos en un entorno de producción. Para comprobarlo es necesario realizar un recorrido de la aplicación con datos de prueba.

## ¿Qué hace ENCUADRE?

1. **El fotógrafo crea su Style DNA** — sube fotos representativas de su portafolio; el sistema analiza sus características visuales (cálido/frío, espontáneo/posado, documental/editorial, etc.)
2. **El cliente recibe un enlace** — sin instalar nada ni crear cuenta, elige entre pares de fotos reales del fotógrafo
3. **El sistema calcula compatibilidad** — Alignment Score determinístico (0–100) con coincidencias y divergencias específicas
4. **Se genera un Brief Visual** — documento compartido con dirección visual, must-haves, referencias y acuerdos. Ambas partes lo aprueban.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15+ App Router, React 19, TypeScript strict |
| Estilos | Tailwind CSS v4, Design tokens implementados en Tailwind y documentados en el flujo de diseño |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| AI | Gemini 2.0 Flash (default) / OpenAI GPT-4o (alternativa) |
| Deploy | Vercel |
| Tests | Vitest (unit), Playwright (E2E) |

---

## Quick Start

### Prerrequisitos
- Node.js 22+
- npm 11+
- Cuenta Supabase (ver `MANUAL_STEPS.txt`)
- API key Gemini o OpenAI (ver `MANUAL_STEPS.txt`)

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales reales

# 3. Aplicar migraciones Supabase (requiere Supabase CLI)
npx supabase db push

# 4. Cargar datos demo
npx supabase db seed

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Acceso de demostración

El despliegue registrado en GitHub es **https://encuadre-ai.vercel.app** (disponibilidad no verificada). No se incluyen credenciales en este README. Si existe una cuenta de pruebas pública, debe ser aislada, con datos descartables y permisos mínimos.


---

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción local
npm run lint         # ESLint (0 warnings)
npm run typecheck    # TypeScript check
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run test:coverage # Coverage report
npm run db:migrate   # Aplicar migraciones Supabase
npm run db:seed      # Cargar datos demo
npm run db:types     # Regenerar tipos TypeScript desde schema
```

---

## Estructura del proyecto

```
encuadre/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Landing page pública
│   │   ├── (auth)/             # Login / registro
│   │   ├── app/                # Studio del fotógrafo (protegido)
│   │   └── s/[token]/          # Experiencia del cliente (sin cuenta)
│   ├── components/             # Componentes genéricos
│   │   ├── ui/                 # Button, Card, Input, Badge, etc.
│   │   ├── brand/              # Logo, GradientText
│   │   ├── layout/             # StudioLayout, ClientLayout
│   │   └── charts/             # AlignmentGauge, DimensionBars
│   ├── features/               # Lógica específica del dominio
│   │   ├── alignment/          # Cálculo y visualización de alineación
│   │   ├── briefs/             # Generación y aprobación de briefs
│   │   ├── client-session/     # Flujo del cliente
│   │   └── portfolio/          # Subida y análisis de imágenes
│   ├── server/                 # Código exclusivamente server-side
│   │   ├── actions/            # Server Actions
│   │   ├── repositories/       # Acceso a base de datos
│   │   └── services/           # Lógica de negocio
│   └── lib/                    # Utilidades e infraestructura
│       ├── ai/                 # Proveedor de IA (Gemini/OpenAI)
│       ├── security/           # Tokens criptográficos
│       └── supabase/           # Clientes Supabase server/browser
├── supabase/
│   ├── migrations/             # Migraciones SQL versionadas
│   └── seed/                   # Datos demo
├── tests/
│   ├── unit/                   # Tests del motor de alineación y tokens
│   └── e2e/                    # Golden Path Playwright
└── docs/                       # Documentación técnica
```

---

## Flujo principal (Golden Path)

```
Fotógrafo                          Sistema                      Cliente
   │                                  │                            │
   ├─ Registro/Login ─────────────────►│                            │
   ├─ Sube portafolio ────────────────►│◄── Analiza con IA ─────────┤
   │                                  │    Genera Style DNA         │
   ├─ Crea proyecto ──────────────────►│                            │
   ├─ Selecciona referencias ─────────►│                            │
   ├─ Genera enlace/QR ───────────────►│                            │
   │                                  │◄── Enlace seguro ──────────►│
   │                                  │                            ├─ Abre enlace
   │                                  │                            ├─ Comparaciones
   │                                  │                            ├─ Preguntas
   │                                  │◄── Envía preferencias ─────┤
   │                                  │                            │
   │                                  ├─ Calcula preference vector  │
   │                                  ├─ Calcula Alignment Score    │
   │                                  ├─ Detecta divergencias       │
   │                                  ├─ Genera Visual Brief        │
   │                                  │                            │
   ├─ Ve Alignment Score ◄────────────┤                            │
   ├─ Aprueba Brief ──────────────────►│◄── Cliente aprueba ────────┤
   │                                  │                            │
   └─ "Brief acordado ✓" ◄────────────┴────────────────────────────┘
```

---

## Seguridad

- **RLS** en todas las tablas de Supabase — fotógrafo solo accede a sus propios datos
- **Token del cliente**: 128 bits criptográficos, almacenado como SHA-256, expira en 14 días
- **Service Role Key** solo server-side, nunca en el navegador
- **Imágenes**: solo derivados WebP/AVIF (sin originales), signed URLs con expiración
- **Headers de seguridad**: X-Frame-Options, CSP, Referrer-Policy

## Alignment Score

El score se calcula **deterministicamente por código**, nunca por LLM:

```
score = 100 × [0.60 × (1 - weightedL1) + 0.40 × normalizedCosine]
```

Donde:
- `weightedL1` = distancia L1 ponderada entre vectores fotógrafo y cliente
- `normalizedCosine` = similitud coseno normalizada a [0,1]
- Pesos por dimensión documentados en `docs/ALIGNMENT_ENGINE.md`

Bandas (heurística MVP, no afirmación científica):
- 85–100: Alineación muy alta
- 70–84: Buena alineación  
- 55–69: Alineación media — revisar puntos
- <55: Divergencias importantes

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura del sistema |
| [DATABASE.md](docs/DATABASE.md) | Modelo de datos y migraciones |
| [AI_PIPELINE.md](docs/AI_PIPELINE.md) | Pipeline de análisis de imágenes |
| [ALIGNMENT_ENGINE.md](docs/ALIGNMENT_ENGINE.md) | Motor de cálculo de score |
| [SECURITY.md](docs/SECURITY.md) | Seguridad, RLS, tokens |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy en Vercel + Supabase |
| [DESIGN_WORKFLOW.md](docs/DESIGN_WORKFLOW.md) | Tokens de diseño y sistema visual |
| [MANUAL_STEPS.txt](MANUAL_STEPS.txt) | Pasos manuales requeridos |
| [AGENTS.md](AGENTS.md) | Reglas para agentes IA |
| [CHANGELOG.md](CHANGELOG.md) | Historial de cambios |

---

## Diseño

El diseño fue generado con **Google Stitch MCP** siguiendo el flujo documentado en `docs/DESIGN_WORKFLOW.md`, con el design system "Encuadre Studio":

- Stitch Project ID: `931707746720943674`
- Design System ID: `ab263ce102924865910b23d555dfdbe7`
- Pantallas generadas: Dashboard Studio, Client Pairwise, Alignment Score, Client Welcome, Brief Approval

---

*Hackathon MVP — construido con ENCUADRE_AGENT_PLAN.md como fuente de verdad.*
