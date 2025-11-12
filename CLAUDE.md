# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# KAV Concursos - Development Guide

**Project:** SaaS platform for Brazilian public exam preparation (Lei Seca focus)
**Status:** Active MVP Development - **v2.1 Cadernos System + Stripe Integration Implemented**
**Current State:** ~65-70% complete (core features + monetization built, engagement features pending)

---

## Build Commands

```bash
npm run dev         # Dev server (Turbopack, fast refresh)
npm run build       # Production build (validates TypeScript strict)
npm run lint        # ESLint
npm run type-check  # TypeScript strict mode check
npm run format      # Prettier format
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright E2E tests
```

## Tech Stack & Architecture

**Frontend:** Next.js 14 App Router, React 18, TypeScript 5.3 (strict mode), Tailwind CSS 3.4
**State:** TanStack Query 5.17 (5min cache), React useState, Zod 3.22.4
**Backend:** Supabase (PostgreSQL 15.6, Auth via JWT + httpOnly cookies, Storage)
**UI:** shadcn/ui components, Recharts 2.15, Lucide React icons
**Payments:** ✅ **Stripe FULLY INTEGRATED** (checkout, webhooks, portal, subscriptions)

### Server Components vs Client Components Pattern

**Critical architecture pattern used throughout:**

1. **Server Components (default)** - Fetch data directly from Supabase:
   ```typescript
   // src/app/dashboard/page.tsx
   export default async function DashboardPage() {
     const supabase = createClient(); // from lib/supabase/server.ts
     const { data: { user } } = await supabase.auth.getUser();
     const { data } = await supabase.from('profiles').select('*').single();
     return <ClientComponent data={data} user={user} />;
   }
   ```

2. **Client Components** - Receive data as props, handle interactivity:
   ```typescript
   // src/components/questoes/question-interface.tsx
   'use client';
   export function QuestionInterface({ questao, userId, plano }: Props) {
     const [selected, setSelected] = useState<string | null>(null);
     const supabase = createClient(); // from lib/supabase/client.ts
     // Use TanStack Query for refetch if needed
   }
   ```

3. **Middleware** ([src/middleware.ts](src/middleware.ts)) - Validates JWT on EVERY request:
   - Redirects `/dashboard/*` → `/auth/login` if unauthenticated
   - Redirects `/auth/*` → `/dashboard` if authenticated
   - Manages cookie synchronization

### Key Files & Patterns

**Authentication & Data:**
- [src/middleware.ts](src/middleware.ts) - Auth guard for all routes (validates JWT on every request)
- [src/lib/supabase/server.ts](src/lib/supabase/server.ts) - Server Supabase client (use in RSCs)
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts) - Browser Supabase client (use in 'use client')
- [src/components/providers.tsx](src/components/providers.tsx) - TanStack Query config (5min cache)
- [src/types/database.types.ts](src/types/database.types.ts) - Supabase TypeScript types (generate with `supabase gen types`)

**Cadernos Implementation Pattern (v2.1):**
```typescript
// Server Component (page.tsx) - Fetches data directly from Supabase
export default async function CadernosPage() {
  const supabase = createClient(); // from lib/supabase/server.ts
  const { data: { user } } = await supabase.auth.getUser();
  const { data: cadernos } = await supabase
    .from('cadernos')
    .select('*, disciplinas(*), bancas(*)')
    .eq('user_id', user.id);

  // Check plan limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single();

  return <CadernosListClient cadernos={cadernos} plano={profile.plano} />;
}
```

**Plan-Based Limits Pattern:**
```typescript
// Every feature checks user's plan and enforces limits
const LIMITES = {
  free: { max_cadernos: 2, max_questoes_dia: 5 },
  basic: { max_cadernos: 10, max_questoes_dia: Infinity },
  premium: { max_cadernos: Infinity, max_questoes_dia: Infinity }
};

// Show paywall when limit reached
if (!podeCrearMais) {
  return <PaywallCard planoAtual="free" recursoNecessario="basic" />;
}
```

---

## v2.1 Strategic Change: Cadernos System (IMPLEMENTED ✅)

**Core Strategy:** All questions ONLY accessible through Cadernos (study notebooks). Standalone questions deprecated.

**Implementation Status:**
- ✅ `/app/dashboard/cadernos/` pages created (list, create, solve)
- ✅ Cadernos CRUD API routes implemented ([src/app/api/cadernos/](src/app/api/cadernos/))
- ✅ `CriarCadernoForm` component built
- ✅ `CadernoQuestionInterface` working with caderno context
- ✅ Legacy code cleaned up (old `/dashboard/questoes` now redirects to cadernos)

**New Plan Limits (v2.1):**
- **FREE:** 2 cadernos, 50 questions/caderno, 5 questions/day
- **BASIC (R$39,90):** 10 cadernos, unlimited daily, 200 questions/caderno, **+ Comments system**
- **PREMIUM (R$79,90):** Unlimited cadernos, 500 questions/caderno, **+ Extra materials (videos/PDFs)**

See [docs/CHANGELOG-CADERNOS-v2.1.md](docs/CHANGELOG-CADERNOS-v2.1.md) for full v2.1 strategy.

---

## ✅ Stripe Integration (FULLY IMPLEMENTED - Nov 2025)

**Status:** Production-ready monetization system

### Features Implemented:
- ✅ Checkout flow (one-time + subscription)
- ✅ Customer Portal (manage subscription, update payment method, cancel)
- ✅ Webhook handlers (sync subscription status automatically)
- ✅ Automatic plan upgrades/downgrades
- ✅ Database fields for Stripe data (customer_id, subscription_id, status, period_end)
- ✅ Pricing cards with dynamic plan features
- ✅ `/dashboard/assinatura` page (subscription management)
- ✅ `/dashboard/planos` integrated with real Stripe checkout

### Architecture:
```
src/lib/stripe/
├── config.ts  # Server-side Stripe SDK (NEVER exposed to client)
└── client.ts  # Client-side Stripe.js (safe publishable key)

src/components/stripe/
├── checkout-button.tsx           # Initiates Stripe Checkout
├── pricing-card.tsx              # Plan card with checkout
└── manage-subscription-button.tsx # Opens Customer Portal

src/app/api/stripe/
├── create-checkout-session/      # POST: Creates Stripe Checkout session
├── create-portal-session/        # POST: Opens Customer Portal
└── webhooks/                      # POST: Receives Stripe events
```

### Webhook Events Handled:
- `checkout.session.completed` - Initial subscription created
- `customer.subscription.created` - Subscription started
- `customer.subscription.updated` - Plan changed (upgrade/downgrade)
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Recurring payment succeeded
- `invoice.payment_failed` - Payment failed

### Environment Variables Required:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Client-side (safe)
STRIPE_SECRET_KEY=sk_test_xxx                   # Server-side ONLY
STRIPE_WEBHOOK_SECRET=whsec_xxx                 # Webhook signature
STRIPE_PRICE_BASIC_MONTHLY=price_xxx            # BASIC plan price ID
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx          # PREMIUM plan price ID
SUPABASE_SERVICE_ROLE_KEY=xxx                   # For webhook DB updates
```

### Database Schema (profiles table):
```sql
stripe_customer_id TEXT           -- Stripe customer ID (cus_xxx)
stripe_subscription_id TEXT       -- Active subscription ID (sub_xxx)
stripe_subscription_status TEXT   -- active, canceled, past_due, etc.
stripe_current_period_end TIMESTAMPTZ -- Renewal date
```

### Testing:
- **Test cards:** `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)
- **Webhook testing:** Use ngrok for local development
- **Full guide:** [docs/STRIPE-SETUP-GUIDE.md](docs/STRIPE-SETUP-GUIDE.md)

### Next Steps:
1. Configure Stripe Dashboard (products, prices, webhook)
2. Update `.env` with real Stripe keys
3. Test checkout flow in development
4. Deploy to production with live keys

**⚠️ IMPORTANT:** Never commit `.env` file or expose `STRIPE_SECRET_KEY` to client.

---

## What's Implemented

### ✅ Authentication (90%)
- Email/password signup, login, password reset
- JWT stored in httpOnly cookie (secure)
- Middleware protection on all `/dashboard/*` routes
- Profile creation with plan assignment
- **Missing:** OAuth Google login

**Files:** [src/app/auth/](src/app/auth/) pages, [src/middleware.ts](src/middleware.ts)

### ✅ Landing Page (100%)
- Full marketing page with hero, features, testimonials, CTAs
- 2400+ lines of well-structured React

**File:** [src/app/page.tsx](src/app/page.tsx)

### ✅ Cadernos System (75% - CORE v2.1 FEATURE)
- List view with plan-based limits (FREE: 2, BASIC: 10, PREMIUM: unlimited)
- Creation form with filters (disciplina, banca, orgão, dificuldade)
- Solve questions within caderno context
- Progress tracking (questões resolvidas, taxa de acerto)
- Plan upgrade prompts when limits reached
- **Files:** [src/app/dashboard/cadernos/](src/app/dashboard/cadernos/), [src/app/api/cadernos/](src/app/api/cadernos/)
- **Missing:** Cadernos inteligentes (IA), export to PDF, sharing

### ✅ Dashboard Shell (60%)
- Sidebar with 8 menu items
- Header with search, notifications, user menu
- Stats cards (questions, accuracy, points)
- Performance chart (Recharts)
- Streak tracking, recent activity
- **Files:** [src/app/dashboard/](src/app/dashboard/), [src/components/dashboard/](src/components/dashboard/)
- **Needs improvement:** Real data integration (some components still use placeholders)

### ✅ Question System (70% - REFACTORED FOR CADERNOS)
- Interface to display question + alternatives (MCQ)
- Timer, immediate feedback, explanation display
- Save response to `respostas_usuarios` table with `caderno_id`
- Works within caderno context
- **Files:** [src/components/cadernos/caderno-question-interface.tsx](src/components/cadernos/caderno-question-interface.tsx)
- ⚠️ Legacy standalone question page exists but deprecated

### ✅ Database (70%)
- Schema documented with 18 tables (see [docs/03-DATABASE-SCHEMA.md](docs/03-DATABASE-SCHEMA.md))
- Core tables exist: profiles, questoes, respostas_usuarios, cadernos, bancas, orgaos, disciplinas
- Cadernos table with RLS policies
- **Missing:** Full RLS policies for comments/materials, some triggers, indices optimization

**Migrations:** [supabase/migrations/](supabase/migrations/)

---

## What's NOT Implemented or Incomplete

### ❌ Cadernos Advanced Features (Priority: High)
- ⚠️ Cadernos inteligentes com IA (recomendação baseada em fraquezas)
- ⚠️ Export caderno to PDF
- ⚠️ Share caderno with other users
- ⚠️ Clone caderno templates

### ❌ API Routes (Partial)
- ✅ `/api/cadernos/` exists (GET, POST)
- ✅ `/api/cadernos/[id]/` exists (GET, PUT, DELETE)
- ✅ `/api/cadernos/[id]/questoes/` exists (GET)
- ❌ Need: `/api/questoes/[id]/comentarios/` (comments)
- ❌ Need: `/api/questoes/[id]/materiais/` (extra materials)

### ❌ Comments System (BASIC+ feature)
- ✅ UI components exist (src/components/questoes/comentarios-section.tsx)
- ✅ API routes created (/api/comentarios/[id], /api/comentarios/[id]/votar)
- ❌ Need: Backend integration with Supabase
- ❌ Need: Paywall enforcement (FREE blocked, BASIC+ read, PREMIUM write)

### ❌ Extra Materials (PREMIUM feature)
- ✅ UI components exist (src/components/questoes/materiais-section.tsx)
- ✅ API routes created (/ api/questoes/[id]/materiais)
- ❌ Need: Upload to Supabase Storage
- ❌ Need: Paywall enforcement (PREMIUM only)

### ❌ Gamification
- Database fields exist (pontos_totais, nivel, streak_dias)
- NO UI, NO badges, NO ranking pages

### ❌ Admin Panel
- No moderation interface
- No CRUD for laws, questions, comments, materials

### ❌ Tests
- Vitest & Playwright installed
- **Zero test files exist**

### ❌ Dashboard Pages
- Sidebar links to: `/dashboard/mnemonicos`, `/dashboard/flashcards`, `/dashboard/ranking`, `/dashboard/bancas`, `/dashboard/configuracoes`
- All return 404

---

## Recommended Next Steps (Priority Order)

### Phase 1 - Polish Cadernos & Remove Legacy (URGENT - 1 week)
1. ✅ ~~Implement core Cadernos system~~ (DONE)
2. ✅ ~~Clean up legacy code~~ (DONE)
   - ✅ `/app/dashboard/questoes/page.tsx` redirects to cadernos
   - ✅ Old `question-interface.tsx` removed
   - ✅ Dashboard links updated to use cadernos
3. **Complete Cadernos features:**
   - Add edit caderno functionality
   - Add archive/delete caderno with confirmation
   - Improve error handling and loading states
4. **Optimize database queries:**
   - Add indices on frequently queried columns
   - Review and optimize RLS policies
   - Add database triggers for stats updates

### Phase 2 - Monetization Features (2-3 weeks) - ✅ **STRIPE DONE!**
1. **✅ Stripe Integration (COMPLETED):**
   - ✅ Checkout flow implemented
   - ✅ Subscription management page (`/dashboard/assinatura`) created
   - ✅ Webhook handlers implemented (`/api/stripe/webhooks`)
   - ✅ Full subscription lifecycle handling
   - **NEXT:** Configure Stripe Dashboard + test in production
2. **Comments System (BASIC+ feature) - IN PROGRESS:**
   - Create tables: `questoes_comentarios`, `comentarios_votos`
   - Build API: `/api/questoes/[id]/comentarios/` (GET, POST, PUT, DELETE)
   - Create components: `ComentariosSection`, `ComentarioForm`, `ComentarioCard`
   - Add upvote/downvote system
   - Implement paywall for FREE users, read-only for BASIC, full access for PREMIUM
3. **Extra Materials System (PREMIUM feature):**
   - Create table: `questoes_materiais_extras`
   - Build API: `/api/questoes/[id]/materiais/` (GET, POST)
   - Create components: `MateriaisSection`, `VideoPlayer`, `PDFViewer`
   - Add paywall (PREMIUM only)
4. **Complete dashboard data integration:**
   - Replace placeholder data with real Supabase queries
   - Optimize performance (caching, query optimization)

### Phase 3 - Engagement (4-8 weeks)
1. Implement gamification UI (badges, points, ranking)
2. Create mnemonics pages
3. Create flashcards system with SM-2 algorithm
4. Build admin panel for content moderation
5. Add analytics and "Banca Intelligence" features

---

## Database Patterns

### Supabase Integration

**Server-side** ([lib/supabase/server.ts](src/lib/supabase/server.ts)):
- Use in Server Components
- Can call `auth.getUser()` directly
- Queries respect RLS policies

**Client-side** ([lib/supabase/client.ts](src/lib/supabase/client.ts)):
- Use in Client Components (`'use client'`)
- Browser-based, cannot access `auth.getUser()`
- Combine with TanStack Query for caching

**RLS Policies (Row Level Security):**
- `profiles`: Users see only their own (user_id = auth.uid())
- `cadernos`: Users see only their own
- `questoes_comentarios`: Plan-based (FREE blocked, BASIC+ read, PREMIUM write)
- `questoes_materiais_extras`: PREMIUM only

### Generating Types

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

---

## Environment Variables

Required in `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # server-only, NEVER expose client-side
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional (Stripe - not yet used):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Code Organization

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with Providers
│   ├── auth/                       # Auth pages (login, register, reset)
│   └── dashboard/                  # Protected dashboard pages
│       ├── layout.tsx              # Dashboard layout (Server Component)
│       ├── page.tsx                # Dashboard home
│       └── questoes/page.tsx       # Questions page (DEPRECATED in v2.1)
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── dashboard/                  # Dashboard-specific components
│   └── questoes/                   # Question system components
├── lib/
│   ├── supabase/                   # Supabase clients (server.ts, client.ts)
│   └── utils.ts                    # General utilities
└── types/
    └── database.types.ts           # Supabase generated types
```

---

## Important Documentation

**Read these docs for complete context:**
- [docs/01-PRD-COMPLETO.md](docs/01-PRD-COMPLETO.md) - Product requirements (60+ features, 12-week roadmap)
- [docs/02-ARQUITETURA-SISTEMA.md](docs/02-ARQUITETURA-SISTEMA.md) - System architecture v2.0
- [docs/03-DATABASE-SCHEMA.md](docs/03-DATABASE-SCHEMA.md) - Database schema (18 tables, RLS policies)
- [docs/CHANGELOG-CADERNOS-v2.1.md](docs/CHANGELOG-CADERNOS-v2.1.md) - **v2.1 strategic change** (questões → cadernos)
- [docs/07-REGRAS-NEGOCIO.md](docs/07-REGRAS-NEGOCIO.md) - Business rules (plan limits, algorithms)
- [docs/06-API-ENDPOINTS.md](docs/06-API-ENDPOINTS.md) - API patterns (documented but not coded)

---

## Design System

**Colors:**
- Primary: `#8fbc8f` (green accent)
- Dark backgrounds: `bg-black`, `bg-gray-900`, `bg-gray-950`
- Text: `text-white`, `text-gray-400`

**Typography:**
- Headings: Saira (weights: 300-800)
- Body: Inter (weights: 300-800)

**UI Components:** shadcn/ui (Button, Card, Input, etc.)

---

## Common Issues

### "Cannot access user in Client Component"
- **Fix:** Pass user from parent Server Component as prop, or use `useEffect` with Supabase client to fetch

### "Middleware not protecting route"
- **Check:** Middleware matcher pattern in [src/middleware.ts](src/middleware.ts)
- **Ensure:** Route is not excluded from matcher

### "RLS policy preventing query"
- **Check:** User is authenticated (auth.uid() exists)
- **Verify:** Policy allows the operation for this user's plan

### "Types out of sync with Supabase"
- **Fix:** Regenerate types with `supabase gen types typescript`

---

## Code Organization (Actual Structure)

```
src/
├── app/
│   ├── page.tsx                         # Landing page (marketing)
│   ├── layout.tsx                       # Root layout with Providers
│   ├── auth/                            # Auth pages (login, register, reset, update-password)
│   ├── dashboard/                       # Protected dashboard
│   │   ├── layout.tsx                   # Dashboard layout (Server Component)
│   │   ├── page.tsx                     # Dashboard home
│   │   ├── cadernos/                    # ✅ Cadernos system (v2.1 core)
│   │   │   ├── page.tsx                 # List all cadernos
│   │   │   ├── novo/page.tsx            # Create new caderno
│   │   │   └── [id]/page.tsx            # Solve caderno questions
│   │   └── questoes/page.tsx            # ⚠️ DEPRECATED (remove in cleanup)
│   └── api/                             # API Routes (Next.js 14 App Router)
│       └── cadernos/                    # ✅ Cadernos CRUD
│           ├── route.ts                 # GET (list), POST (create)
│           └── [id]/
│               ├── route.ts             # GET (single), PUT (update), DELETE
│               └── questoes/route.ts    # GET (questions for caderno)
├── components/
│   ├── ui/                              # shadcn/ui base components
│   ├── dashboard/                       # Dashboard-specific components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── stats-cards.tsx
│   │   ├── performance-chart.tsx
│   │   └── ...
│   ├── cadernos/                        # ✅ Cadernos components (v2.1)
│   │   ├── criar-caderno-form.tsx
│   │   └── caderno-question-interface.tsx
│   └── questoes/                        # ⚠️ Legacy question components
│       └── question-interface.tsx       # (may be deprecated)
├── lib/
│   ├── supabase/
│   │   ├── server.ts                    # Server-side Supabase client
│   │   └── client.ts                    # Browser Supabase client
│   └── utils.ts                         # General utilities (cn, etc.)
└── types/
    └── database.types.ts                # Supabase generated types
```

---

**Last Updated:** October 23, 2025 (Reflects actual implementation status post-Cadernos v2.1)
**For questions:** Check [/docs](docs/) folder or [README.md](README.md)
