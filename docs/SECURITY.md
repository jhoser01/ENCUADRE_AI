# ENCUADRE — Security Documentation

## Overview

ENCUADRE handles photography data and visual preferences. Security is designed for:
- Photographer data isolation (multi-tenant via RLS)
- Client sessions without user accounts (secure tokenless access)
- Private photography storage
- No sensitive AI keys in the browser

---

## 1. Row Level Security (RLS)

**All user tables** have RLS enabled. Photographers can only read/write their own rows.

### Policies

```sql
-- photographers: all operations restricted to own rows
CREATE POLICY "photographer_own_data" ON projects
  FOR ALL USING (owner_id = auth.uid());

-- clients: same ownership model
CREATE POLICY "clients_own_data" ON clients
  FOR ALL USING (owner_id = auth.uid());
```

Client session data (pairwise_choices, client_answers) is inserted anonymously through Server Actions that validate the token server-side before writing. Anonymous users cannot read data directly.

### Verification

```sql
-- Test as anon: should return 0 rows
SELECT COUNT(*) FROM projects; -- 0 for anon

-- Test as wrong user: should return 0
SELECT COUNT(*) FROM portfolio_images WHERE owner_id = 'other-user-uuid';
```

---

## 2. Client Session Token Security

Clients access sessions without creating an account. The mechanism:

### Token Generation

```ts
// Generate 128-bit cryptographically random token
const token = crypto.randomBytes(16).toString('hex') // 32 hex chars
```

### Storage

```ts
// Store HASH of token in database, never the plain token
const tokenHash = createHash('sha256').update(token).digest('hex')
await db.insert({ token_hash: tokenHash, expires_at: ... })
```

### URL Structure

```
https://app.encuadre.app/s/{plain-token}
```

The plain token is in the URL once. The database never stores it.

### Validation (Server-side)

```ts
// 1. Hash the incoming token
const hash = createHash('sha256').update(token).digest('hex')

// 2. Lookup in database
const session = await db.findSessionByHash(hash)

// 3. Check expiry
if (!session || session.expires_at < new Date()) throw new UnauthorizedError()

// 4. Check status
if (session.status === 'revoked' || session.status === 'completed') throw new ForbiddenError()
```

### Token Properties

- **Entropy**: 128 bits (cryptographically secure via `crypto.randomBytes`)
- **Storage**: SHA-256 hash only
- **Expiry**: 14 days (configurable)
- **Revocation**: photographer can revoke any time → session.status = 'revoked'
- **Single completion**: status changes to 'completed' after submission
- **No sequential IDs**: tokens are random, not guessable from project IDs

---

## 3. Secrets Management

| Secret | Location | Exposure |
|--------|----------|---------|
| NEXT_PUBLIC_SUPABASE_URL | .env.local + Vercel | Public — safe |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | .env.local + Vercel | Public — safe (RLS protects data) |
| SUPABASE_SERVICE_ROLE_KEY | .env.local (server only) | Server only — bypasses RLS |
| GEMINI_API_KEY | .env.local (server only) | Server only |
| OPENAI_API_KEY | .env.local (server only) | Server only |

### Rules

- `SUPABASE_SERVICE_ROLE_KEY`: never used in browser-side code, never in NEXT_PUBLIC_ variables
- AI keys: only used in Server Actions and Route Handlers
- `.env.local` is in `.gitignore` — never committed
- Vercel environment variables are encrypted at rest

---

## 4. Image Privacy

- Portfolio bucket (`portfolio`): **private** — no public access
- Images are served via **signed URLs** with 1-hour expiry
- Signed URLs are generated server-side only, after verifying ownership
- EXIF metadata (including GPS) is stripped before storage
- Client-facing images: verified via session token before generating signed URL

---

## 5. Server Actions & Route Handlers

All mutations go through:
1. Server Actions (preferred): validated with Zod, auth checked, ownership verified
2. Route Handlers: same validation, for non-form interactions

No client component calls Supabase directly for sensitive operations.

---

## 6. Input Validation

Every external input is validated with Zod:

```ts
const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  // ...
})
const parsed = schema.safeParse(rawInput)
if (!parsed.success) throw new ValidationError(parsed.error)
```

AI responses are also Zod-validated:

```ts
const aiResponseSchema = z.object({
  warmth: z.number().min(0).max(1),
  // ... 13 more fields
})
// If validation fails: retry → fallback → error (never use unvalidated AI output)
```

---

## 7. Security Headers

Configured in `next.config.ts`:

- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — restricts script/style/image sources
- `Permissions-Policy` — disables camera, microphone, geolocation APIs

---

## 8. Privacy

- Images are processed by AI only to extract visual features
- No AI model training on user images in MVP
- GPS/EXIF stripped from all stored images
- Client preferences shared only with the associated photographer
- Project deletion removes associated storage objects (photographer-initiated)
