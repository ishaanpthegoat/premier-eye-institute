# Security TODO — deferred items

This tracks security work that **could not be completed** under the current
constraints (staying on GitHub Pages; contact form intentionally inert). Each
item lists **why it's deferred** and **what unlocks it**. Items already
implemented are in the "Done" section at the bottom for context.

---

## 1. Deploy to Vercel → turns on the real HTTP security headers (CODE READY)

**Status: the code is prepped — only the Vercel account step remains.**

GitHub Pages cannot send HTTP response headers, so on Pages the CSP ships as a
`<meta http-equiv>` tag and these header-only protections are missing:
`frame-ancestors` (clickjacking), `Strict-Transport-Security` (HSTS),
`X-Content-Type-Options`, `Referrer-Policy`.

`next.config.ts` is now **dual-target**: the `deploy:pages` build still exports
with the `<meta>` CSP (Pages stays working as the backup), and a normal Vercel
build automatically serves the full header suite — CSP (with `frame-ancestors`),
HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy`, and a `Permissions-Policy` that keeps `camera=(self)` for the
try-on while denying mic/geolocation. No `vercel.json` needed; the headers live
in `next.config.ts`'s `headers()` (verified locally via `next start` + `curl`).
The `<meta>` CSP auto-suppresses on Vercel so there's no duplicate policy.

**What unlocks it — one-time Vercel import (~5 min, needs a Vercel login):**

1. Go to [vercel.com](https://vercel.com) → sign in with the GitHub account
   (free "Hobby" plan is fine).
2. **Add New… → Project** → import `ishaanpthegoat/premier-eye-institute`.
3. Framework preset auto-detects **Next.js**. Leave build settings at defaults
   — **do NOT set `NEXT_PUBLIC_BASE_PATH`** (leaving it empty is what switches
   the config into full-app + headers mode).
4. Click **Deploy**. You'll get a `…vercel.app` URL with all headers live.
5. (Optional) verify: open the site, DevTools → Network → click the document
   request → Response Headers should list `content-security-policy`,
   `strict-transport-security`, etc.
6. GitHub Pages keeps working untouched as the backup deploy.

**Later — custom domain (peicare.com):** in Vercel → Project → Settings →
Domains, add the domain and follow the DNS instructions (Vercel issues a free
auto-renewing HTTPS cert). Then do the registrar/DNS 2FA in §3.

---

## 2. Wire the contact form to a real service → then implement the hardening TODO

**Why deferred:** Team decision pending on the backend (Formspree / Resend /
custom API route). The form is intentionally **inert** today — it validates
client-side and simulates the submit; no data leaves the browser, so there is
no live spam/abuse/injection surface yet.

**What's already in place (pre-wiring):**

- Shared validation schema in `lib/contact-schema.ts` (Zod) — designed to be
  re-imported **server-side** unchanged.
- Client-side validation applies that schema on submit with inline errors.
- Honeypot field (`components/contact/contact-form.tsx`) — hidden, off-screen,
  `aria-hidden`, `tabIndex={-1}`; a filled value is treated as spam.
- A visible disclaimer near the message field (no sensitive medical details;
  not for emergencies).

**What unlocks it:** a backend decision. When wiring up, implement the
`TODO(form-backend)` block in `components/contact/contact-form.tsx`:

1. **Rate limiting** on the receiving endpoint (per-IP throttle).
2. **Server-side validation** — re-run `contactSchema` on the raw payload.
   Never trust the client pass alone.
3. **Escape/encode** every field before rendering it into any email/HTML
   template (prevent HTML and email-header injection).
4. **Spam protection** — re-check the honeypot server-side AND add a real
   challenge (Cloudflare Turnstile / hCaptcha).
5. **Transport** — POST over HTTPS; add a CSRF token if the endpoint is
   same-origin and cookie-authenticated.

---

## 3. HUMAN TASKS (cannot be done in code)

These require account/dashboard access and must be done by a person:

- [ ] **Enable GitHub 2FA** for every collaborator on the repo
      (`ishaanpthegoat/premier-eye-institute`). Whoever controls the repo
      controls what deploys to the live site — this is the single highest-value
      real-world risk reduction.
- [ ] **Audit repo collaborator write access** — remove anyone who doesn't need
      push access; prefer least privilege.
- [ ] **Audit Personal Access Tokens / deploy tokens** — revoke unused ones,
      scope the rest minimally, set expirations.
- [ ] **When a custom domain is purchased** (e.g. peicare.com): enable **2FA at
      the domain registrar and DNS provider**, and lock the domain against
      transfer. Domain/DNS hijacking redirects the entire site regardless of how
      secure the code is.
- [ ] **On GitHub Pages settings:** confirm **"Enforce HTTPS"** is checked
      (Settings → Pages). The `*.github.io` default already enforces HTTPS; this
      matters most once a custom domain is added.

---

## 4. Dependency status — postcss advisory (RESOLVED, note the mechanism)

The `npm audit` postcss advisory (GHSA-qx2v-qp2m-jg93, moderate, build-time
only) **is resolved** — `npm audit` reports **0 vulnerabilities**.

- Root cause: Next.js `16.2.10` (the latest release in our major line — there
  is no newer 16.x to update to) pins `postcss@8.4.31` as a direct dependency,
  and the fix landed in `postcss@8.5.10`.
- Fix applied: an `overrides` entry in `package.json` (`"postcss": "^8.5.10"`)
  forces the transitive postcss up to a patched, semver-compatible minor
  (8.5.x) **without downgrading Next.js**. `npm audit fix --force` was NOT used
  (it would downgrade Next to v9 and break the build).
- **Watch item:** when upgrading Next.js in the future, re-check whether this
  override is still needed (if a future Next release pins postcss ≥ 8.5.10, the
  override can be removed). Re-run `npm audit` after any dependency bump.

---

## Done (implemented in this pass — for context)

- ✅ **postcss advisory** patched via `overrides` (see §4). `npm audit` clean.
- ✅ **Self-hosted MediaPipe** WASM + FaceLandmarker model under
  `public/mediapipe/` — removed the runtime `cdn.jsdelivr.net` /
  `storage.googleapis.com` dependency (supply-chain surface) that the webcam
  try-on used. Wired in `components/eyewear/try-on-dialog.tsx` via
  `withBasePath()` so it resolves under the Pages subpath.
- ✅ **Partial CSP** as `<meta http-equiv>` in `app/layout.tsx`, tailored to the
  site's actual load sources (including the R3F/three try-on and the GSAP
  service scroll-stories). (Full header-based policy → §1.)
- ✅ **Contact form pre-hardening** — shared Zod schema, honeypot, client-side
  validation, disclaimer. (Backend hardening → §2.)
- ✅ **Verified clean:** no committed secrets / `.env`; `.mcp.json` gitignored;
  all `target="_blank"` links carry `rel="noopener noreferrer"`; the only
  `dangerouslySetInnerHTML` is the static JSON-LD block (no user input).
