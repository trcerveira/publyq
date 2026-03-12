# PUBLYQ — CLAUDE.md
> Content Machine Method | 7 dias de conteúdo. Uma manhã.
> Fundador: Telmo Cerveira | Início: 2026-03-12

---

## 1. O QUE É ESTE PROJECTO

**Nome:** PUBLYQ
**Domínio:** publyq.ai
**Tipo:** SaaS Web Application — Content Machine for Solopreneurs
**Missão:** Transformar uma manhã por semana em 7 dias de conteúdo publicável — na voz do utilizador, não na de um robô.

### Pipeline (Content Machine Method)
```
01. FOUNDATION — Brand DNA + Voice DNA (uma vez, setup inicial)
02. MACHINE — Batch Day: 7 carrosséis Instagram gerados de uma vez
03. PUBLISH — Publicação manual (V1) → automática (V2)
04. KAIZEN — Métricas → Análise → Ajuste do próximo ciclo
```

### Veto Conditions
- ❌ Carrossel sem Voice DNA → BLOQUEADO
- ❌ Carrossel sem Brand DNA → BLOQUEADO
- ❌ Kaizen sem métricas reais → BLOQUEADO
- ❌ Publicar sem aprovação do utilizador → BLOQUEADO

---

## 2. STACK TECNOLÓGICO

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Next.js + Tailwind CSS | 16.1.6 + v4 |
| Auth | Clerk | @clerk/nextjs |
| Database | Supabase | service_role |
| AI Engine | Claude API | claude-sonnet-4-6 |
| Validation | Zod | v4 |
| Deploy | Vercel | — |

---

## 3. ESTRUTURA DE FICHEIROS

```
publyq/
├── app/
│   ├── layout.tsx              ← Root (ClerkProvider + Space Grotesk)
│   ├── page.tsx                ← Landing page (waitlist)
│   ├── globals.css             ← Tailwind 4 + CSS vars
│   ├── (auth)/
│   │   ├── sign-in/            ← Clerk sign-in
│   │   └── sign-up/            ← Clerk sign-up
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Navbar + container
│   │   ├── dashboard/          ← Pipeline overview (4 steps)
│   │   ├── brand-dna/          ← Step 01: Brand DNA
│   │   ├── voice-dna/          ← Step 02: Voice DNA
│   │   ├── carousel/           ← Step 03: 7 carrosséis
│   │   └── kaizen/             ← Step 04: Métricas + análise
│   └── api/
│       ├── waitlist/           ← POST email → waitlist table
│       ├── progress/           ← GET pipeline progress
│       ├── brand-dna/          ← POST answers → Claude → card
│       ├── voice-dna/          ← POST answers → Claude → card
│       ├── carousel/           ← POST batch → 7 carrosséis
│       └── kaizen/             ← POST metrics → Claude analysis
├── components/
│   └── layout/
│       └── Navbar.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts           ← createServerClient()
│   │   ├── types.ts            ← All DB types
│   │   ├── user-profiles.ts    ← Profile CRUD + progress
│   │   ├── rate-limit.ts       ← DB rate limiter
│   │   └── audit.ts            ← Fire-and-forget logger
│   ├── config/
│   │   └── admins.ts           ← SUPER_ADMINS + BETA_USERS
│   └── validators/
│       └── index.ts            ← All Zod schemas
├── middleware.ts               ← Clerk + beta access gate
└── supabase/
    └── migrations/
        └── 001_publyq_schema.sql
```

---

## 4. ARCHITECTURE PATTERNS

- **Auth:** 100% Clerk — clerk_id is TEXT (user_xxxxxxx), not UUID
- **DB access:** service_role key bypasses RLS — security enforced at API route level
- **RLS:** `USING(false)` on all tables — policy name: `block_direct_access`
- **Rate limiting:** DB-based (works in Vercel serverless)
- **Audit:** Fire-and-forget (never blocks response)
- **Validation:** Zod v4 on all API routes
- **Pipeline gating:** Brand DNA → Voice DNA → Carousel/Kaizen (server-side authority)
- **Zod v4 rules:** `.issues[0]` not `.errors[0]`, no `required_error` in `z.string()`

---

## 5. DATABASE TABLES (Supabase)

| Table | Purpose |
|-------|---------|
| waitlist | Beta email signups |
| user_profiles | Synced from Clerk (brand_dna_complete, voice_dna_complete) |
| brand_profiles | Brand DNA answers + generated card (JSONB) |
| voice_profiles | Voice DNA answers + generated card (JSONB) |
| generated_carousels | 7 carousels per batch (slides JSONB) |
| carousel_metrics | Likes, comments, saves, shares, reach |
| rate_limits | Per-user per-endpoint counters |
| audit_log | Action trail |

---

## 6. RATE LIMITS

| Endpoint | Limit |
|----------|-------|
| brand-dna | 5/day |
| voice-dna | 5/day |
| carousel | 20/day |
| kaizen | 10/day |
| waitlist | 5/day |

---

## 7. DESIGN

- **Colors:** bg #0A0E1A, surface #111827, accent #BFD64B, text #F0ECE4, muted #8892a4
- **Font:** Space Grotesk
- **Approach:** Mobile-first

---

## 8. BETA TESTERS

Hardcoded in `lib/config/admins.ts`:
1. trcerveira@gmail.com (founder/admin)
2. miguel.rodrigues@imomaster.com
3. geral@arm-lda.com
4. cleciofwise@hotmail.com
5. bruno@pulsifyai.com

---

## 9. REGRAS DE DESENVOLVIMENTO

### Código
- TypeScript everywhere
- Code in English, user-facing content in Portuguese
- AI system prompts in Portuguese
- Componentes pequenos e reutilizáveis
- Mobile-first

### Git
- Branch: master
- Commits: `feat:`, `fix:`, `docs:`, `chore:`

### NEVER
- Delete files without asking first
- Add features not requested
- Use mock data when real data exists
- Skip Zod validation on API routes
- Trust AI output without verification

### ALWAYS
- Present options as 1, 2, 3 format
- Read existing code before modifying
- Commit before moving to next task
- Respond in Portuguese
