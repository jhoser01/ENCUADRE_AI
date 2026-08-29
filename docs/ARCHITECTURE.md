# ENCUADRE — Architecture & Technical Specifications

## 1. System Architecture

ENCUADRE is built as a unified Next.js 15+ application with dual distinct user experiences:
1. **ENCUADRE Studio**: Desktop-first management suite for professional photographers.
2. **ENCUADRE Client**: Mobile-first, lightweight, emotional visual testing experience without authentication.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ENCUADRE Web App                              │
├──────────────────────────────────┬─────────────────────────────────────┤
│      ENCUADRE Studio (Desktop)   │      ENCUADRE Client (Mobile)       │
│      - Dashboard                 │      - Welcome & Consent            │
│      - Portfolio & Style DNA     │      - Pairwise Selection (A/B)     │
│      - Projects & Link Gen       │      - Context Questions            │
│      - Alignment & Brief         │      - Summary & Dual Approval      │
└─────────────────┬────────────────┴──────────────────┬──────────────────┘
                  │                                   │
                  ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Server Actions & Repositories                        │
│   (TypeScript Strict, Zod Validation, Ownership Authorization)         │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ Alignment Engine │ Style DNA Service│ Token Security   │ Image Sharp   │
│ (Deterministic)  │ (Statistical)    │ (SHA-256 Hashing)│ (WebP / EXIF) │
└──────────────────┴─────────┬────────┴──────────────────┴───────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────────────┐ ┌──────────────────────────────────────┐
│       Supabase Services       │ │        Multimodal AI Provider        │
│ - PostgreSQL 15 (RLS Enabled) │ │ - Gemini 2.0 Flash (Default)         │
│ - Supabase Auth               │ │ - OpenAI GPT-4o (Alternative)        │
│ - Supabase Storage (Private)  │ │ - Strictly Zod-Validated Outputs     │
└───────────────────────────────┘ └──────────────────────────────────────┘
```

---

## 2. Directory Structure Conventions

- `src/app/(marketing)/`: Public landing page and marketing copy.
- `src/app/(auth)/`: Authentication pages (Login, Signup, OAuth Callback).
- `src/app/app/`: Protected Studio experience. Redirects unauthenticated requests to `/auth/login`.
- `src/app/s/[token]/`: Protected Client experience. Validates session token server-side per request.
- `src/server/actions/`: Server Actions handling mutations and side effects.
- `src/server/repositories/`: Data access layer interfacing directly with Supabase.
- `src/server/services/`: Pure business logic (Alignment calculations, Style DNA statistics).
- `src/lib/ai/`: Decoupled AI provider interface and model adapters.
- `src/lib/security/`: Cryptographic token generation and verification.
- `src/lib/storage/`: Supabase private storage signed URL management.
- `src/lib/image/`: Sharp-based image optimization and EXIF stripping.

---

## 3. Core Principles

1. **No Business Logic in React Components**: Components purely handle presentation and user interactions.
2. **Deterministic Calculations**: The Alignment Score is computed by pure mathematical code, never by a language model.
3. **No RAW or Unbounded Storage**: Images are downscaled to 1920px max, converted to WebP, and stripped of GPS metadata before storage.
4. **Zero Account Friction for Clients**: Clients receive a 128-bit cryptographically secure tokenized URL and do not need to register.
