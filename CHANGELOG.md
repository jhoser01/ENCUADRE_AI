# CHANGELOG

All notable changes to ENCUADRE are documented here.
Format: [Semantic Versioning](https://semver.org/)

---

## [0.1.0] — 2026-08-29 — MVP Hackathon

### Added
- Next.js 15 App Router scaffold with TypeScript strict mode
- Complete directory architecture (feature-first, server/client separation)
- DESIGN.md contract with all tokens implemented in Tailwind CSS v4
- Google Stitch MCP integration — generated 5 key screens:
  - Studio Dashboard (desktop)
  - Client Pairwise Comparison (mobile)
  - Alignment Score (desktop)
  - Client Welcome (mobile)
  - Brief Approval (mobile)
- Supabase schema: 14 tables, enums, indexes, RLS policies
- Storage: `portfolio` (private) and `brand-public` buckets
- AI provider interface (VisionProvider) — Gemini 2.0 Flash default
- Deterministic Alignment Score engine (`calculateAlignmentScore`)
  - Weighted L1 distance + cosine similarity
  - Algorithm version: v1.0.0
- Style DNA calculation (mean + spread of portfolio features)
- Preference vector calculation from pairwise choices
- Cryptographic client token (128-bit random, SHA-256 hash storage)
- Image optimization pipeline (sharp: resize → WebP → strip EXIF → thumbnail)
- Signed URLs for private portfolio images
- Server Actions: portfolio upload, project creation, session management, brief generation
- PWA manifest (theme-color, icons, standalone)
- Security headers (CSP, X-Frame-Options, Referrer-Policy)
- Unit tests: alignment engine, token security, style DNA
- E2E test: complete Golden Path (Playwright, desktop + mobile)
- GitHub Actions CI: lint → typecheck → test → build
- MANUAL_STEPS.txt with step-by-step human instructions
- Complete documentation: ARCHITECTURE.md, DATABASE.md, AI_PIPELINE.md, ALIGNMENT_ENGINE.md, SECURITY.md, DEPLOYMENT.md
- Brand assets: logo-dark.png, logo-light.png, symbol.png → /public/brand/

### Architecture decisions
- No business logic in React components
- All DB access through repositories
- AI outputs validated with Zod before use
- Alignment Score is code-calculated, not LLM-generated
- Client token: plain in URL → SHA-256 for storage → verify with crypto timing-safe compare
