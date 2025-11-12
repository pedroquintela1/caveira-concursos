# Arquitetura do Sistema - KAV Concursos

**Versão:** 2.0  
**Data:** 18/10/2025  
**Última Atualização:** Mudanças estratégicas v2.0 (Cadernos obrigatórios)

> **⚠️ MUDANÇAS ESTRATÉGICAS v2.0:**
>
> - **Questões Avulsas REMOVIDAS**: Rota `/dashboard/questoes` agora exclusiva para gerenciamento de cadernos
> - **Novos componentes**: Sistema de comentários (BÁSICO+) e materiais extras (PREMIUM)
> - **Validação de planos**: Middleware e RLS enforcing limits (FREE: 2 cadernos, BÁSICO: 10, PREMIUM: ilimitado)
> - **Ver CHANGELOG-CADERNOS-v2.1.md** para detalhes completos da arquitetura

---

## Stack Tecnológica Completa

### Frontend

Framework: Next.js 14.2.5
App Router: true
Turbopack: true (dev mode)

Language: TypeScript 5.5.4
Strict Mode: true

Styling:

Tailwind CSS 3.4.10

tailwindcss-animate

class-variance-authority (CVA)

UI Components:

Radix UI (primitives)

shadcn/ui (collection)

Lucide React (icons)

Forms & Validation:

React Hook Form 7.52.0

Zod 3.23.8

State Management:

TanStack Query (React Query) 5.51.1

Zustand 4.5.4 (global state opcional)

Charts:

Recharts 2.12.7

Animations:

Framer Motion 11.3.19

Dates:

date-fns 3.6.0

text

### Backend

Runtime: Node.js 20 LTS

Serverless Functions:

Vercel Edge Functions

Next.js API Routes

Database:
Provider: Supabase
Engine: PostgreSQL 15.6
Features:

- Row Level Security (RLS)
- Real-time subscriptions
- PostgREST API
- pgvector (embeddings - futuro)

ORM/Client:

@supabase/ssr 0.4.0

@supabase/supabase-js 2.45.0

Authentication:

Supabase Auth (JWT)

OAuth providers: Google

Magic Links (email)

Storage:

Supabase Storage (avatars, PDFs)

text

### Payments

Provider: Stripe
SDK: stripe 16.8.0
Webhook Signing: true

Features:

Subscription billing

Customer Portal

Proration (upgrades/downgrades)

Automatic retries

text

### DevOps

Hosting: Vercel
Plan: Hobby (grátis) -> Pro (quando necessário)

CI/CD:

Vercel Git Integration (auto-deploy)

Preview deploys em PRs

Monitoring:

Vercel Analytics

Sentry (error tracking)

Environment Variables:

.env.local (desenvolvimento)

Vercel Environment Variables (produção)

text

## Arquitetura de Pastas Detalhada

lei-seca-pro/
├── .github/
│ ├── copilot-instructions.md
│ └── workflows/ # CI/CD (opcional)
│ └── test.yml
│
├── public/
│ ├── images/
│ │ ├── logo.svg
│ │ ├── og-image.png
│ │ └── icons/
│ └── fonts/ # Self-hosted fonts (opcional)
│
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── (auth)/ # Auth layout group
│ │ │ ├── login/
│ │ │ │ └── page.tsx
│ │ │ ├── cadastro/
│ │ │ │ └── page.tsx
│ │ │ ├── recuperar-senha/
│ │ │ │ └── page.tsx
│ │ │ └── layout.tsx # Auth layout (sem sidebar)
│ │ │
│ │ ├── (dashboard)/ # Dashboard layout group
│ │ │ ├── dashboard/
│ │ │ │ └── page.tsx # Página principal (stats + cards)
│ │ │ ├── leis/
│ │ │ │ ├── page.tsx # Lista de leis
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx # Visualizar lei específica
│ │ │ ├── cadernos/ # 🆕 ROTA PRINCIPAL v2.0 (antes era /questoes)
│ │ │ │ ├── page.tsx # Lista cadernos + criar novo
│ │ │ │ └── [id]/
│ │ │ │ ├── page.tsx # Resolver questões do caderno
│ │ │ │ └── estatisticas/
│ │ │ │ └── page.tsx # Estatísticas do caderno
│ │ │ ├── mnemonicos/
│ │ │ │ ├── page.tsx
│ │ │ │ └── [artigoId]/
│ │ │ │ └── page.tsx
│ │ │ ├── revisao/
│ │ │ │ └── page.tsx # Flashcards
│ │ │ ├── estatisticas/
│ │ │ │ └── page.tsx # Estatísticas gerais
│ │ │ ├── configuracoes/
│ │ │ │ ├── page.tsx
│ │ │ │ ├── perfil/
│ │ │ │ ├── assinatura/
│ │ │ │ └── preferencias/
│ │ │ └── layout.tsx # Dashboard layout (sidebar + header)
│ │ │
│ │ ├── (marketing)/ # Marketing layout group
│ │ │ ├── page.tsx # Landing page
│ │ │ ├── precos/
│ │ │ │ └── page.tsx
│ │ │ ├── sobre/
│ │ │ │ └── page.tsx
│ │ │ ├── blog/
│ │ │ │ ├── page.tsx
│ │ │ │ └── [slug]/
│ │ │ │ └── page.tsx
│ │ │ └── layout.tsx # Marketing layout
│ │ │
│ │ ├── api/ # API Routes
│ │ │ ├── auth/
│ │ │ │ ├── callback/
│ │ │ │ │ └── route.ts # OAuth callback
│ │ │ │ ├── signup/
│ │ │ │ │ └── route.ts
│ │ │ │ └── logout/
│ │ │ │ └── route.ts
│ │ │ ├── cadernos/ # 🆕 Endpoints principais v2.0
│ │ │ │ ├── route.ts # GET (listar), POST (criar)
│ │ │ │ └── [id]/
│ │ │ │ ├── route.ts # GET (buscar), PUT (atualizar), DELETE
│ │ │ │ ├── questoes/
│ │ │ │ │ └── route.ts # GET questões do caderno
│ │ │ │ └── export-pdf/
│ │ │ │ └── route.ts # Export caderno como PDF
│ │ │ ├── questoes/
│ │ │ │ ├── [id]/
│ │ │ │ │ ├── route.ts # GET questão específica
│ │ │ │ │ ├── responder/
│ │ │ │ │ │ └── route.ts # POST resposta
│ │ │ │ │ ├── comentarios/ # 🆕 Sistema comentários (BÁSICO+)
│ │ │ │ │ │ ├── route.ts # GET (BÁSICO+), POST (PREMIUM)
│ │ │ │ │ │ └── [comentarioId]/
│ │ │ │ │ │ ├── vote/
│ │ │ │ │ │ │ └── route.ts # POST upvote/downvote
│ │ │ │ │ │ └── report/
│ │ │ │ │ │ └── route.ts # POST reportar comentário
│ │ │ │ │ └── materiais/ # 🆕 Materiais extras (PREMIUM)
│ │ │ │ │ ├── route.ts # GET materiais (PREMIUM only)
│ │ │ │ │ └── [materialId]/
│ │ │ │ │ ├── download/
│ │ │ │ │ │ └── route.ts # POST registrar download
│ │ │ │ │ └── progresso/
│ │ │ │ │ └── route.ts # PUT atualizar progresso vídeo
│ │ │ ├── mnemonicos/
│ │ │ │ ├── route.ts
│ │ │ │ └── vote/
│ │ │ │ └── route.ts
│ │ │ ├── admin/ # 🆕 Endpoints administrativos
│ │ │ │ ├── comentarios/
│ │ │ │ │ └── moderar/
│ │ │ │ │ └── route.ts # POST aprovar/rejeitar comentário
│ │ │ │ └── materiais/
│ │ │ │ └── route.ts # POST upload materiais extras
│ │ │ ├── stripe/
│ │ │ │ ├── checkout/
│ │ │ │ │ └── route.ts
│ │ │ │ ├── portal/
│ │ │ │ │ └── route.ts
│ │ │ │ └── webhook/
│ │ │ │ └── route.ts
│ │ │ ├── estatisticas/
│ │ │ │ ├── geral/
│ │ │ │ │ └── route.ts
│ │ │ │ └── banca/
│ │ │ │ └── [bancaId]/
│ │ │ │ └── route.ts
│ │ │ └── recomendacoes/
│ │ │ └── route.ts
│ │ │
│ │ ├── layout.tsx # Root layout
│ │ ├── globals.css # Global styles + Tailwind
│ │ └── error.tsx # Global error boundary
│ │
│ ├── components/
│ │ ├── ui/ # shadcn/ui components
│ │ │ ├── button.tsx
│ │ │ ├── card.tsx
│ │ │ ├── dialog.tsx
│ │ │ ├── dropdown-menu.tsx
│ │ │ ├── input.tsx
│ │ │ ├── label.tsx
│ │ │ ├── select.tsx
│ │ │ ├── skeleton.tsx
│ │ │ ├── toast.tsx
│ │ │ └── ...
│ │ │
│ │ ├── questoes/
│ │ │ ├── questao-card.tsx
│ │ │ ├── questao-list.tsx
│ │ │ ├── filtro-questoes.tsx
│ │ │ ├── gabarito-table.tsx
│ │ │ └── feedback-resposta.tsx
│ │ │
│ │ ├── leis/
│ │ │ ├── lei-viewer.tsx
│ │ │ ├── artigo-card.tsx
│ │ │ ├── indice-lei.tsx
│ │ │ └── busca-artigo.tsx
│ │ │
│ │ ├── mnemonicos/
│ │ │ ├── mnemonico-card.tsx
│ │ │ ├── mnemonico-form.tsx
│ │ │ ├── mnemonico-list.tsx
│ │ │ └── votacao-mnemonico.tsx
│ │ │
│ │ ├── flashcards/
│ │ │ ├── flashcard.tsx
│ │ │ ├── flashcard-deck.tsx
│ │ │ └── flashcard-controls.tsx
│ │ │
│ │ ├── dashboard/
│ │ │ ├── dashboard-stats.tsx
│ │ │ ├── grafico-desempenho.tsx
│ │ │ ├── grafico-evolucao.tsx
│ │ │ ├── badge-conquistas.tsx
│ │ │ └── streak-counter.tsx
│ │ │
│ │ ├── cadernos/
│ │ │ ├── caderno-card.tsx # Card de caderno na lista
│ │ │ ├── caderno-form.tsx # Form criar/editar caderno
│ │ │ ├── filtros-avancados.tsx # Filtros para criar caderno
│ │ │ ├── preview-caderno.tsx # Preview antes de criar
│ │ │ └── caderno-progress.tsx # Barra de progresso
│ │ │
│ │ ├── questoes/
│ │ │ ├── questao-card.tsx # Card questão individual
│ │ │ ├── questao-interface.tsx # Interface resolver questão
│ │ │ ├── feedback-resposta.tsx # Feedback após responder
│ │ │ └── explicacao-questao.tsx # Explicação gabarito
│ │ │
│ │ ├── comentarios/ # 🆕 Sistema de comentários (BÁSICO+)
│ │ │ ├── comentarios-section.tsx # Seção completa comentários
│ │ │ ├── comentario-card.tsx # Card comentário individual
│ │ │ ├── comentario-form.tsx # Form escrever (PREMIUM)
│ │ │ ├── votacao-comentario.tsx # Upvote/downvote buttons
│ │ │ ├── paywall-comentarios.tsx # Paywall FREE→BÁSICO
│ │ │ └── comentario-professor-badge.tsx # Badge destaque professor
│ │ │
│ │ ├── materiais/ # 🆕 Materiais extras (PREMIUM)
│ │ │ ├── materiais-section.tsx # Seção completa materiais
│ │ │ ├── material-card.tsx # Card material individual
│ │ │ ├── video-player.tsx # Player vídeo com progresso
│ │ │ ├── pdf-viewer.tsx # Viewer PDF inline
│ │ │ ├── link-externo-card.tsx # Card links externos
│ │ │ ├── paywall-materiais.tsx # Paywall FREE/BÁSICO→PREMIUM
│ │ │ └── material-download-button.tsx # Botão download PDF
│ │ │
│ │ ├── layout/
│ │ │ ├── header.tsx
│ │ │ ├── sidebar.tsx
│ │ │ ├── footer.tsx
│ │ │ └── breadcrumb.tsx
│ │ │
│ │ ├── auth/
│ │ │ ├── login-form.tsx
│ │ │ ├── signup-form.tsx
│ │ │ └── oauth-buttons.tsx
│ │ │
│ │ └── shared/
│ │ ├── loading-spinner.tsx
│ │ ├── error-message.tsx
│ │ ├── empty-state.tsx
│ │ ├── pagination.tsx
│ │ └── search-input.tsx
│ │
│ ├── lib/
│ │ ├── supabase/
│ │ │ ├── client.ts # Browser client
│ │ │ ├── server.ts # Server client
│ │ │ ├── middleware.ts # Auth middleware
│ │ │ └── database.types.ts # Generated types
│ │ │
│ │ ├── stripe/
│ │ │ ├── client.ts
│ │ │ └── webhook.ts
│ │ │
│ │ ├── validations/
│ │ │ ├── auth.ts
│ │ │ ├── questao.ts
│ │ │ ├── mnemonico.ts
│ │ │ └── caderno.ts
│ │ │
│ │ ├── utils.ts # Helper functions
│ │ ├── constants.ts # App constants
│ │ └── logger.ts # Logging utility
│ │
│ ├── hooks/
│ │ ├── use-user.ts # Current user
│ │ ├── use-questoes.ts # Fetch questões
│ │ ├── use-mnemonicos.ts
│ │ ├── use-cadernos.ts
│ │ ├── use-stats.ts # Estatísticas
│ │ ├── use-recomendacoes.ts
│ │ ├── use-debounce.ts
│ │ └── use-local-storage.ts
│ │
│ ├── types/
│ │ ├── database.types.ts # Supabase types (generated)
│ │ ├── api.types.ts # API contracts
│ │ ├── domain.types.ts # Business logic types
│ │ └── index.ts # Re-exports
│ │
│ └── middleware.ts # Next.js middleware (auth)
│
├── supabase/
│ ├── migrations/
│ │ ├── 00000000000000_init.sql
│ │ ├── 00000000000001_create_profiles.sql
│ │ ├── 00000000000002_create_leis.sql
│ │ ├── 00000000000003_create_questoes.sql
│ │ ├── 00000000000004_create_mnemonicos.sql
│ │ ├── 00000000000005_create_cadernos.sql
│ │ ├── 00000000000006_create_estatisticas.sql
│ │ └── 00000000000007_create_rls_policies.sql
│ │
│ ├── seed.sql # Dados iniciais
│ └── config.toml # Supabase config
│
├── tests/
│ ├── unit/
│ │ ├── lib/
│ │ │ └── utils.test.ts
│ │ └── hooks/
│ │ └── use-questoes.test.ts
│ │
│ └── e2e/
│ ├── auth.spec.ts
│ ├── questoes.spec.ts
│ └── payment.spec.ts
│
├── docs/ # Documentação técnica
│ └── [todos os arquivos .md]
│
├── .env.local.example # Template de env vars
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md

text

## Fluxo de Dados

### 1. Autenticação

Usuário → Next.js → Supabase Auth → JWT Token → Cookie (httpOnly)
↓
Middleware verifica token em cada request

text

### 2. Queries (Leitura)

Component (Client) → React Query → API Route → Supabase (RLS) → PostgreSQL
↓
Cache (5min)

text

### 3. Mutations (Escrita)

Component → React Query Mutation → API Route → Validation (Zod)
↓
Supabase Insert/Update
↓
Invalidate Cache

text

### 4. Pagamentos

User clica "Assinar" → API Stripe Checkout → Redirect Stripe
↓
User paga no Stripe
↓
Webhook POST /api/stripe/webhook
↓
Atualiza profiles.plano = 'premium'
↓
User redirected /dashboard

text

## Convenções de Nomenclatura

### Arquivos

- Componentes: `kebab-case.tsx` (ex: `questao-card.tsx`)
- Utils: `kebab-case.ts` (ex: `format-date.ts`)
- Hooks: `use-*.ts` (ex: `use-questoes.ts`)
- Types: `*.types.ts` (ex: `database.types.ts`)

### Código

- Componentes: `PascalCase` (ex: `QuestaoCard`)
- Funções: `camelCase` (ex: `getQuestoes`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_QUESTOES`)
- Interfaces: `PascalCase` + sufixo (ex: `QuestaoCardProps`)

## Environment Variables

.env.local
Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-only

Stripe
NEXT*PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test*...
STRIPE*SECRET_KEY=sk_test*...
STRIPE*WEBHOOK_SECRET=whsec*...

URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000

Analytics (opcional)
NEXT_PUBLIC_SENTRY_DSN=https://...

text

## Deploy Checklist

### Pre-Deploy

- [ ] Rodar `pnpm build` localmente (sem erros)
- [ ] Rodar `pnpm lint` (sem warnings)
- [ ] Rodar `pnpm type-check` (sem erros TypeScript)
- [ ] Testar em mobile (responsive)
- [ ] Environment variables configuradas no Vercel

### Pós-Deploy

- [ ] Testar auth (login, cadastro, logout)
- [ ] Testar fluxo de pagamento em modo teste
- [ ] Verificar webhooks Stripe funcionando
- [ ] Verificar CORS (se necessário)
- [ ] Monitorar logs de erro (Sentry/Vercel)

## Performance Targets

| Métrica                  | Target | Atual |
| ------------------------ | ------ | ----- |
| Lighthouse Performance   | >90    | -     |
| First Contentful Paint   | <1.5s  | -     |
| Time to Interactive      | <3s    | -     |
| Largest Contentful Paint | <2.5s  | -     |
| Cumulative Layout Shift  | <0.1   | -     |
| Bundle Size (JS)         | <200kb | -     |

## Segurança

### Row Level Security (RLS) Policies

**Profiles:**
-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

text

**Questões:**
-- Public read, admin write
CREATE POLICY "Anyone can view questoes"
ON questoes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert questoes"
ON questoes FOR INSERT
TO authenticated
USING (
EXISTS (
SELECT 1 FROM profiles
WHERE id = auth.uid() AND role = 'admin'
)
);

text

**Respostas:**
-- Users can only see/manage their own respostas
CREATE POLICY "Users can view own respostas"
ON respostas_usuarios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own respostas"
ON respostas_usuarios FOR INSERT
WITH CHECK (auth.uid() = user_id);

text

### Validações

Sempre validar:

1. **Input do usuário** (Zod schemas)
2. **Autenticação** (middleware)
3. **Autorização** (RLS + checks)
4. **Rate limiting** (Vercel Edge Config)
5. **CORS** (apenas domínios permitidos)
6. **Webhooks** (Stripe signatures)

## Monitoramento

### Logs

import { logger } from '@/lib/logger';

logger.info('User logged in', { userId });
logger.error('Payment failed', { error, userId });
logger.warn('Unusual activity', { ip, userId });

text

### Error Tracking (Sentry)

import \* as Sentry from '@sentry/nextjs';

try {
// Code...
} catch (error) {
Sentry.captureException(error, {
tags: { feature: 'questoes' },
user: { id: userId },
});
}

text

### Analytics

- **Vercel Analytics**: Performance automático
- **Custom Events**: Track conversões, feature usage
  import { track } from '@vercel/analytics';

track('questao_respondida', {
correcta: true,
tempo: 45,
});

text
undefined

## Boas Práticas de Código

### Princípios SOLID

1. Princípios SOLID Aplicados
   Single Responsibility Principle (SRP)
   typescript
   // ❌ MAU: Componente fazendo muitas coisas
   export function QuestaoCard({ questao }: Props) {
   const [selected, setSelected] = useState<string | null>(null);

// Lógica de resposta
const handleResponder = async () => {
const res = await fetch('/api/questoes/responder', { /_ ... _/ });
// Lógica de atualização de estatísticas
updateStats();
// Lógica de notificação
showToast('Resposta salva!');
};

return (/_ JSX complexo _/);
}

// ✅ BOM: Separar responsabilidades
// 1. Componente de apresentação
export function QuestaoCard({ questao, onResponder }: Props) {
return (

<div>
<QuestaoEnunciado texto={questao.enunciado} />
<QuestaoAlternativas 
        alternativas={questao.alternativas}
        onSelect={onResponder}
      />
</div>
);
}

// 2. Hook para lógica de negócio
export function useResponderQuestao() {
const { mutate } = useMutation({
mutationFn: responderQuestao,
onSuccess: () => {
toast.success('Resposta salva!');
},
});
return { responder: mutate };
}

// 3. Service para API
export async function responderQuestao(payload: RespostaPayload) {
const res = await fetch('/api/questoes/responder', {
method: 'POST',
body: JSON.stringify(payload),
});
return res.json();
}
Open/Closed Principle (OCP)
typescript
// ✅ BOM: Aberto para extensão, fechado para modificação
interface Filtro {
aplicar(questoes: Questao[]): Questao[];
}

class FiltroPorBanca implements Filtro {
constructor(private bancaId: number) {}

aplicar(questoes: Questao[]): Questao[] {
return questoes.filter(q => q.banca_id === this.bancaId);
}
}

class FiltroPorAno implements Filtro {
constructor(private ano: number) {}

aplicar(questoes: Questao[]): Questao[] {
return questoes.filter(q => q.ano === this.ano);
}
}

// Adicionar novos filtros sem modificar código existente
class FiltroPorDificuldade implements Filtro {
constructor(private dificuldade: Dificuldade) {}

aplicar(questoes: Questao[]): Questao[] {
return questoes.filter(q => q.dificuldade === this.dificuldade);
}
}

// Composição de filtros
function aplicarFiltros(questoes: Questao[], filtros: Filtro[]): Questao[] {
return filtros.reduce((acc, filtro) => filtro.aplicar(acc), questoes);
}
Dependency Inversion Principle (DIP)
typescript
// ✅ BOM: Depender de abstrações, não de implementações concretas
interface QuestaoRepository {
findById(id: number): Promise<Questao | null>;
findAll(filtros: Filtros): Promise<Questao[]>;
save(questao: Questao): Promise<void>;
}

// Implementação concreta (Supabase)
class SupabaseQuestaoRepository implements QuestaoRepository {
constructor(private supabase: SupabaseClient) {}

async findById(id: number): Promise<Questao | null> {
const { data } = await this.supabase
.from('questoes')
.select('\*')
.eq('id', id)
.single();
return data;
}

async findAll(filtros: Filtros): Promise<Questao[]> {
let query = this.supabase.from('questoes').select('\*');
if (filtros.banca_id) query = query.eq('banca_id', filtros.banca_id);
const { data } = await query;
return data || [];
}

async save(questao: Questao): Promise<void> {
await this.supabase.from('questoes').insert(questao);
}
}

// Service depende da interface, não da implementação
class QuestaoService {
constructor(private repository: QuestaoRepository) {}

async buscarQuestao(id: number): Promise<Questao | null> {
return this.repository.findById(id);
}
}

// Facilita testes (mock da interface)
class MockQuestaoRepository implements QuestaoRepository {
async findById(id: number): Promise<Questao | null> {
return { id, enunciado: 'Mock', /_ ... _/ };
}
// ...
} 2. DRY (Don't Repeat Yourself)
typescript
// ❌ MAU: Código duplicado
export function calcularTaxaAcertoCP(userId: string) {
const { data } = await supabase
.from('respostas_usuarios')
.select('correta')
.eq('user_id', userId)
.eq('disciplina', 'Direito Penal');

const total = data.length;
const acertos = data.filter(r => r.correta).length;
return (acertos / total) \* 100;
}

export function calcularTaxaAcertoCPP(userId: string) {
const { data } = await supabase
.from('respostas_usuarios')
.select('correta')
.eq('user_id', userId)
.eq('disciplina', 'Direito Processual Penal');

const total = data.length;
const acertos = data.filter(r => r.correta).length;
return (acertos / total) \* 100;
}

// ✅ BOM: Extrair lógica comum
export async function calcularTaxaAcerto(
userId: string,
filtros: { disciplina?: string; banca?: string }
): Promise<number> {
let query = supabase
.from('respostas_usuarios')
.select('correta')
.eq('user_id', userId);

if (filtros.disciplina) {
query = query.eq('disciplina', filtros.disciplina);
}

const { data } = await query;

if (!data || data.length === 0) return 0;

const acertos = data.filter(r => r.correta).length;
return (acertos / data.length) \* 100;
}

// Uso
const taxaCP = await calcularTaxaAcerto(userId, { disciplina: 'Direito Penal' });
const taxaCPP = await calcularTaxaAcerto(userId, { disciplina: 'Direito Processual Penal' }); 3. KISS (Keep It Simple, Stupid)
typescript
// ❌ MAU: Over-engineering
class QuestaoManager {
private questaoFactory: QuestaoFactory;
private questaoValidator: QuestaoValidator;
private questaoObserver: QuestaoObserver;

constructor() {
this.questaoFactory = QuestaoFactory.getInstance();
this.questaoValidator = new QuestaoValidator();
this.questaoObserver = QuestaoObserver.createObserver();
}

public async processQuestao(data: unknown): Promise<Result<Questao>> {
const validation = await this.questaoValidator.validateAsync(data);
if (validation.hasErrors()) {
return Result.failure(validation.errors);
}
const questao = this.questaoFactory.create(validation.data);
this.questaoObserver.notify('questao:created', questao);
return Result.success(questao);
}
}

// ✅ BOM: Solução simples e direta
export async function criarQuestao(data: unknown): Promise<Questao> {
// Validar com Zod (simples e eficaz)
const validated = QuestaoSchema.parse(data);

// Salvar no banco
const { data: questao, error } = await supabase
.from('questoes')
.insert(validated)
.select()
.single();

if (error) throw error;

return questao;
} 4. YAGNI (You Aren't Gonna Need It)
typescript
// ❌ MAU: Adicionar features "por precaução"
interface Questao {
id: number;
enunciado: string;
// Campos que TALVEZ vamos usar no futuro
video_explicacao_url?: string;
audio_narration_url?: string;
related_questions_ids?: number[];
machine_learning_difficulty_score?: number;
blockchain_hash?: string; // ???
}

// ✅ BOM: Apenas o necessário AGORA
interface Questao {
id: number;
enunciado: string;
alternativas: Record<'A' | 'B' | 'C' | 'D' | 'E', string>;
gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
banca_id: number;
disciplina_id: number;
ano: number;
}

// Adicionar novos campos quando realmente necessários 5. Composição sobre Herança
typescript
// ❌ MAU: Herança complexa
class BaseQuestao {
id: number;
enunciado: string;

validate(): boolean {
return this.enunciado.length > 10;
}
}

class QuestaoObjetiva extends BaseQuestao {
alternativas: string[];
gabarito: string;

validate(): boolean {
return super.validate() && this.alternativas.length === 5;
}
}

class QuestaoDiscursiva extends BaseQuestao {
resposta_esperada: string;
criterios_correcao: string[];

validate(): boolean {
return super.validate() && this.resposta_esperada.length > 0;
}
}

// ✅ BOM: Composição com funções
interface QuestaoBase {
id: number;
enunciado: string;
tipo: 'objetiva' | 'discursiva';
}

interface QuestaoObjetiva extends QuestaoBase {
tipo: 'objetiva';
alternativas: Record<'A' | 'B' | 'C' | 'D' | 'E', string>;
gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
}

interface QuestaoDiscursiva extends QuestaoBase {
tipo: 'discursiva';
resposta_esperada: string;
criterios_correcao: string[];
}

type Questao = QuestaoObjetiva | QuestaoDiscursiva;

// Validações como funções puras
function validarEnunciado(enunciado: string): boolean {
return enunciado.length > 10;
}

function validarQuestaoObjetiva(q: QuestaoObjetiva): boolean {
return validarEnunciado(q.enunciado) &&
Object.keys(q.alternativas).length === 5;
}

function validarQuestao(q: Questao): boolean {
if (q.tipo === 'objetiva') {
return validarQuestaoObjetiva(q);
}
return validarEnunciado(q.enunciado) && q.resposta_esperada.length > 0;
} 6. Imutabilidade
typescript
// ❌ MAU: Mutação direta
function adicionarQuestaoAoCaderno(caderno: Caderno, questao: Questao) {
caderno.questoes.push(questao); // Mutação!
caderno.total_questoes += 1;
return caderno;
}

// ✅ BOM: Retornar novo objeto
function adicionarQuestaoAoCaderno(caderno: Caderno, questao: Questao): Caderno {
return {
...caderno,
questoes: [...caderno.questoes, questao],
total_questoes: caderno.total_questoes + 1,
};
}

// ✅ BOM: Com Immer (para objetos complexos)
import { produce } from 'immer';

function adicionarQuestaoAoCaderno(caderno: Caderno, questao: Questao): Caderno {
return produce(caderno, (draft) => {
draft.questoes.push(questao);
draft.total_questoes += 1;
});
} 7. Early Return Pattern
typescript
// ❌ MAU: Nested if
async function calcularDesempenho(userId: string) {
const user = await getUser(userId);
if (user) {
const respostas = await getRespostas(userId);
if (respostas.length > 0) {
const acertos = respostas.filter(r => r.correta);
if (acertos.length > 0) {
return (acertos.length / respostas.length) \* 100;
} else {
return 0;
}
} else {
return 0;
}
} else {
throw new Error('Usuário não encontrado');
}
}

// ✅ BOM: Early return
async function calcularDesempenho(userId: string): Promise<number> {
const user = await getUser(userId);
if (!user) {
throw new Error('Usuário não encontrado');
}

const respostas = await getRespostas(userId);
if (respostas.length === 0) {
return 0;
}

const acertos = respostas.filter(r => r.correta);
return (acertos.length / respostas.length) _ 100;
} 8. Funções Pequenas e Focadas
typescript
// ❌ MAU: Função fazendo muitas coisas
async function processarResposta(userId: string, questaoId: number, resposta: string) {
// Buscar questão
const { data: questao } = await supabase
.from('questoes')
.select('_')
.eq('id', questaoId)
.single();

// Validar resposta
if (!['A', 'B', 'C', 'D', 'E'].includes(resposta)) {
throw new Error('Resposta inválida');
}

// Verificar se já respondeu
const { data: existing } = await supabase
.from('respostas_usuarios')
.select('id')
.eq('user_id', userId)
.eq('questao_id', questaoId)
.single();

if (existing) {
throw new Error('Já respondeu esta questão');
}

// Salvar resposta
const correta = resposta === questao.gabarito;
await supabase
.from('respostas_usuarios')
.insert({ user_id: userId, questao_id: questaoId, resposta_escolhida: resposta, correta });

// Atualizar estatísticas
const { data: stats } = await supabase
.from('user_stats')
.select('\*')
.eq('user_id', userId)
.single();

const newStats = {
total_questoes: stats.total_questoes + 1,
total_acertos: correta ? stats.total_acertos + 1 : stats.total_acertos,
};

await supabase
.from('user_stats')
.update(newStats)
.eq('user_id', userId);

return { correta, gabarito: questao.gabarito };
}

// ✅ BOM: Dividir em funções pequenas
async function buscarQuestao(questaoId: number): Promise<Questao> {
const { data, error } = await supabase
.from('questoes')
.select('\*')
.eq('id', questaoId)
.single();

if (error || !data) {
throw new Error('Questão não encontrada');
}

return data;
}

function validarResposta(resposta: string): void {
if (!['A', 'B', 'C', 'D', 'E'].includes(resposta)) {
throw new Error('Resposta inválida');
}
}

async function verificarRespostaDuplicada(
userId: string,
questaoId: number
): Promise<boolean> {
const { data } = await supabase
.from('respostas_usuarios')
.select('id')
.eq('user_id', userId)
.eq('questao_id', questaoId)
.single();

return !!data;
}

async function salvarResposta(
userId: string,
questaoId: number,
resposta: string,
correta: boolean
): Promise<void> {
await supabase
.from('respostas_usuarios')
.insert({
user_id: userId,
questao_id: questaoId,
resposta_escolhida: resposta,
correta,
});
}

async function atualizarEstatisticas(
userId: string,
correta: boolean
): Promise<void> {
const { data: stats } = await supabase
.from('user_stats')
.select('\*')
.eq('user_id', userId)
.single();

await supabase
.from('user_stats')
.update({
total_questoes: stats.total_questoes + 1,
total_acertos: correta ? stats.total_acertos + 1 : stats.total_acertos,
})
.eq('user_id', userId);
}

// Função principal orquestra as outras
async function processarResposta(
userId: string,
questaoId: number,
resposta: string
) {
validarResposta(resposta);

const jaRespondeu = await verificarRespostaDuplicada(userId, questaoId);
if (jaRespondeu) {
throw new Error('Já respondeu esta questão');
}

const questao = await buscarQuestao(questaoId);
const correta = resposta === questao.gabarito;

await salvarResposta(userId, questaoId, resposta, correta);
await atualizarEstatisticas(userId, correta);

return { correta, gabarito: questao.gabarito };
} 9. Nomenclatura Descritiva
typescript
// ❌ MAU: Nomes genéricos
const data = await fetch('/api/q');
const arr = data.filter(x => x.c);
const n = arr.length;

// ✅ BOM: Nomes descritivos
const questoes = await fetchQuestoes();
const questoesCorretas = questoes.filter(questao => questao.correta);
const totalQuestoesCorretas = questoesCorretas.length;

// ✅ BOM: Funções descrevem ação
function calculateAverageScore(scores: number[]): number { /_ ... _/ }
function isUserAuthenticated(userId: string): boolean { /_ ... _/ }
function sendEmailNotification(to: string, subject: string): Promise<void> { /_ ... _/ }

// ❌ MAU: Nomes ambíguos
function process(data: any): any { /_ ... _/ }
function handle(input: unknown): unknown { /_ ... _/ }
function do(x: any): void { /_ ... _/ } 10. Const por Padrão
typescript
// ✅ BOM: Sempre usar const (ou let se necessário)
const MAX_QUESTOES_POR_CADERNO = 200;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function calcularMedia(notas: number[]): number {
const total = notas.reduce((acc, nota) => acc + nota, 0);
const quantidade = notas.length;
const media = total / quantidade;
return media;
}

// ⚠️ let apenas quando realmente necessário
function contarAcertos(respostas: Resposta[]): number {
let contador = 0;

for (const resposta of respostas) {
if (resposta.correta) {
contador += 1;
}
}

return contador;
}

// ✅ Melhor ainda: usar reduce
function contarAcertos(respostas: Resposta[]): number {
return respostas.reduce((acc, r) => r.correta ? acc + 1 : acc, 0);
} 11. Async/Await sobre Promises
typescript
// ❌ MAU: Promise chains
function buscarQuestaoComDependencias(id: number) {
return supabase
.from('questoes')
.select('_')
.eq('id', id)
.single()
.then(({ data: questao }) => {
return supabase
.from('mnemonicos')
.select('_')
.eq('questao_id', questao.id)
.then(({ data: mnemonicos }) => {
return { ...questao, mnemonicos };
});
})
.catch((error) => {
console.error(error);
throw error;
});
}

// ✅ BOM: Async/await
async function buscarQuestaoComDependencias(id: number) {
try {
const { data: questao, error: questaoError } = await supabase
.from('questoes')
.select('\*')
.eq('id', id)
.single();

    if (questaoError) throw questaoError;

    const { data: mnemonicos, error: mnemonicosError } = await supabase
      .from('mnemonicos')
      .select('*')
      .eq('questao_id', questao.id);

    if (mnemonicosError) throw mnemonicosError;

    return { ...questao, mnemonicos };

} catch (error) {
console.error('Erro ao buscar questão:', error);
throw error;
}
}

// ✅ MELHOR: Queries em paralelo quando possível
async function buscarQuestaoComDependencias(id: number) {
try {
const [questaoResult, mnemonicosResult] = await Promise.all([
supabase.from('questoes').select('*').eq('id', id).single(),
supabase.from('mnemonicos').select('*').eq('questao_id', id),
]);

    if (questaoResult.error) throw questaoResult.error;
    if (mnemonicosResult.error) throw mnemonicosResult.error;

    return {
      ...questaoResult.data,
      mnemonicos: mnemonicosResult.data,
    };

} catch (error) {
console.error('Erro ao buscar questão:', error);
throw error;
}
} 12. Type Guards e Narrowing
typescript
// ✅ BOM: Type guards para validação de tipos
function isQuestaoObjetiva(questao: Questao): questao is QuestaoObjetiva {
return questao.tipo === 'objetiva';
}

function processarQuestao(questao: Questao) {
if (isQuestaoObjetiva(questao)) {
// TypeScript sabe que aqui é QuestaoObjetiva
console.log(questao.alternativas); // ✅ OK
console.log(questao.gabarito); // ✅ OK
} else {
// Aqui é QuestaoDiscursiva
console.log(questao.resposta_esperada); // ✅ OK
}
}

// ✅ BOM: Narrowing com switch
function getPlanoColor(plano: 'free' | 'basic' | 'premium'): string {
switch (plano) {
case 'free':
return 'gray';
case 'basic':
return 'blue';
case 'premium':
return 'gold';
default:
// TypeScript garante exhaustiveness
const \_exhaustive: never = plano;
throw new Error(`Plano desconhecido: ${_exhaustive}`);
}
} 13. Comentários Significativos
typescript
// ❌ MAU: Comentários óbvios
// Incrementa o contador em 1
contador += 1;

// Define a variável userId
const userId = '123';

// ✅ BOM: Comentários explicam "por quê", não "o quê"
// Usamos debounce de 300ms para evitar sobrecarga no banco de dados
// durante digitação rápida na busca
const debouncedSearch = useDebounce(searchTerm, 300);

// A taxa de conversão é multiplicada por 1.5 devido a promoção ativa
// até 31/12/2025. Remover após essa data.
const taxaConversao = baseTaxa \* 1.5;

// Workaround: Supabase tem bug com JSON arrays vazios em RLS policies
// Issue: https://github.com/supabase/supabase/issues/12345
const filtros = filtrosRaw.length === 0 ? null : filtrosRaw;

// ✅ BOM: Documentar funções complexas com JSDoc
/\*\*

- Calcula a probabilidade de um assunto cair na próxima prova.
-
- Usa fórmula ponderada considerando:
- - Incidência histórica (35%)
- - Tendência de crescimento (25%)
- - Frequência de aparição (20%)
- - Relevância no edital (20%)
-
- @param assunto - Assunto a ser analisado
- @param banca - Banca organizadora
- @param anos - Anos a considerar na análise
- @returns Probabilidade de 0 a 100
-
- @example
- const prob = calcularProbabilidade(
- { id: 1, nome: 'Inquérito Policial' },
- { id: 2, nome: 'CESPE' },
- [2020, 2021, 2022, 2023, 2024]
- );
- console.log(prob); // 85.3
  \*/
  export function calcularProbabilidade(
  assunto: Assunto,
  banca: Banca,
  anos: number[]
  ): number {
  // Implementação...
  }

14. Error Boundaries e Tratamento de Erros
    typescript
    // ✅ BOM: Error boundary global
    // app/error.tsx
    'use client';

import { useEffect } from 'react';
import \* as Sentry from '@sentry/nextjs';

export default function Error({
error,
reset,
}: {
error: Error & { digest?: string };
reset: () => void;
}) {
useEffect(() => {
// Log para Sentry
Sentry.captureException(error);
}, [error]);

return (

<div className="flex flex-col items-center justify-center min-h-screen p-4">
<h2 className="text-2xl font-bold text-gray-900 mb-4">
Algo deu errado!
</h2>
<p className="text-gray-600 mb-6">
Nosso time foi notificado e está trabalhando para resolver.
</p>
<button
        onClick={reset}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
Tentar novamente
</button>
</div>
);
}

// ✅ BOM: Criar custom errors
export class QuestaoNaoEncontradaError extends Error {
constructor(questaoId: number) {
super(`Questão com ID ${questaoId} não encontrada`);
this.name = 'QuestaoNaoEncontradaError';
}
}

export class RespostaDuplicadaError extends Error {
constructor(userId: string, questaoId: number) {
super(`Usuário ${userId} já respondeu a questão ${questaoId}`);
this.name = 'RespostaDuplicadaError';
}
}

// Uso
async function processarResposta(userId: string, questaoId: number) {
const questao = await buscarQuestao(questaoId);
if (!questao) {
throw new QuestaoNaoEncontradaError(questaoId);
}

const jaRespondeu = await verificarResposta(userId, questaoId);
if (jaRespondeu) {
throw new RespostaDuplicadaError(userId, questaoId);
}

// ...
} 15. Testes como Documentação
typescript
// ✅ BOM: Testes descrevem comportamento esperado
describe('calcularProbabilidade', () => {
it('deve retornar 100 quando todos os fatores são máximos', () => {
const resultado = calcularProbabilidade({
incidenciaHistorica: 100,
tendenciaCrescimento: 100,
frequenciaAparece: 100,
relevanciaEdital: 100,
});

    expect(resultado).toBe(100);

});

it('deve retornar 0 quando todos os fatores são mínimos', () => {
const resultado = calcularProbabilidade({
incidenciaHistorica: 0,
tendenciaCrescimento: -100,
frequenciaAparece: 0,
relevanciaEdital: 0,
});

    expect(resultado).toBe(0);

});

it('deve dar mais peso à incidência histórica (35%)', () => {
const resultado = calcularProbabilidade({
incidenciaHistorica: 100, // Máximo
tendenciaCrescimento: 0,
frequenciaAparece: 0,
relevanciaEdital: 0,
});

    // 100 * 0.35 = 35
    expect(resultado).toBe(35);

});

it('deve limitar resultado entre 0 e 100', () => {
const resultado = calcularProbabilidade({
incidenciaHistorica: 150, // Além do limite
tendenciaCrescimento: 200,
frequenciaAparece: 150,
relevanciaEdital: 150,
});

    expect(resultado).toBeLessThanOrEqual(100);
    expect(resultado).toBeGreaterThanOrEqual(0);

});
});
📚 Leitura Recomendada
Livros:

Clean Code (Robert C. Martin)

The Pragmatic Programmer (Andrew Hunt, David Thomas)

Refactoring (Martin Fowler)

Domain-Driven Design (Eric Evans)

Artigos e Recursos:

TypeScript Deep Dive

React Best Practices

Next.js Documentation

Supabase Best Practices

Code Review Checklist:

Código TypeScript strict (sem any)

Funções pequenas (< 50 linhas)

Nomes descritivos

Error handling completo

**Testes** para lógica crítica  
**Acessibilidade** (ARIA, keyboard)  
**Performance** (memoização, lazy loading)  
**Segurança** (validação, RLS)  
**Documentação** (JSDoc quando necessário)  
**Responsividade** (mobile-first)

---

## 📝 Resumo das Mudanças v2.0

### Arquitetura Atualizada

**Rotas Principais:**

- ✅ `/dashboard/cadernos` → Rota principal (criar, listar, resolver)
- ✅ `/dashboard/cadernos/[id]` → Resolver questões do caderno específico
- ❌ Removido: `/dashboard/questoes` (questões avulsas)

**Novos Componentes:**

1. **Sistema de Comentários** (`components/comentarios/`)
   - `comentarios-section.tsx` - Container principal
   - `comentario-card.tsx` - Card individual
   - `comentario-form.tsx` - Form escrever (PREMIUM)
   - `paywall-comentarios.tsx` - Paywall FREE→BÁSICO
   - `votacao-comentario.tsx` - Upvote/downvote

2. **Sistema de Materiais** (`components/materiais/`)
   - `materiais-section.tsx` - Container principal
   - `video-player.tsx` - Player com tracking
   - `pdf-viewer.tsx` - Viewer inline
   - `paywall-materiais.tsx` - Paywall FREE/BÁSICO→PREMIUM

**Novos API Endpoints:**

- `POST /api/questoes/[id]/comentarios` - Criar comentário (PREMIUM)
- `GET /api/questoes/[id]/comentarios` - Listar comentários (BÁSICO+)
- `POST /api/questoes/[id]/comentarios/[id]/vote` - Votar (PREMIUM)
- `GET /api/questoes/[id]/materiais` - Listar materiais (PREMIUM)
- `PUT /api/questoes/[id]/materiais/[id]/progresso` - Atualizar progresso vídeo
- `POST /api/admin/comentarios/moderar` - Moderar comentários (Admin)
- `POST /api/admin/materiais` - Upload materiais (Admin)

**Validação de Planos:**

- Middleware verifica limites de cadernos (FREE: 2, BÁSICO: 10, PREMIUM: ∞)
- RLS policies no Supabase garantem acesso correto
- Paywalls visuais em comentários (FREE) e materiais (FREE/BÁSICO)

---

**Fim do arquivo 02-ARQUITETURA-SISTEMA.md v2.0** 🎯
