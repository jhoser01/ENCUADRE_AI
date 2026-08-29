# ENCUADRE — Deployment & Environment Configuration

## 1. Deployment Platforms

- **Frontend & Server Actions**: Vercel (Next.js 15+ App Router)
- **Database, Auth & Storage**: Supabase
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

---

## 2. Environment Variables Checklist

Set these variables in Vercel Project Settings (Production & Preview):

```env
# Public Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Server-side Supabase Service Role Key (NEVER prefix with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# AI Provider Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...
AI_VISION_MODEL=gemini-2.0-flash
AI_TEXT_MODEL=gemini-2.0-flash

# Base App URL for Token Links & Redirects
NEXT_PUBLIC_APP_URL=https://encuadre.vercel.app
```

---

## 3. Post-Deployment Verification Steps

1. Verify Supabase Auth redirect URLs include `https://[your-app].vercel.app/auth/callback`.
2. Apply database migrations via Supabase CLI or SQL Editor:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_storage.sql`
   - `demo_seed.sql`
3. Execute smoke test:
   - Login with demo credentials: `demo@encuadre.app` / `EncuadreDemo2024!`
   - Create a test project.
   - Generate client QR and open on mobile device.
