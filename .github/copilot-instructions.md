# GitHub Copilot Instructions - KAV Concursos

**Versão:** 2.1  
**Última Atualização:** 18/10/2025 - Mudanças estratégicas v2.0

> **⚠️ MUDANÇAS CRÍTICAS v2.0 - LEIA ANTES DE CODIFICAR:**
>
> 1. **QUESTÕES AVULSAS REMOVIDAS**: Todas questões DEVEM estar em cadernos
> 2. **Validação de planos obrigatória**: FREE (2 cadernos, 5 questões/dia), BÁSICO (10 cadernos, comentários), PREMIUM (ilimitado, materiais)
> 3. **Novos sistemas**: Comentários (BÁSICO+) e Materiais Extras (PREMIUM)
> 4. **RLS policies estão ATIVAS**: Sempre usar Supabase RLS para controle de acesso
> 5. **Ver CHANGELOG-CADERNOS-v2.1.md** para detalhes completos da implementação

---

## 📋 Contexto do Projeto

**Plataforma:** SaaS de preparação para concursos públicos focada em "Lei Seca" (legislação literal) com mnemônicos, questões, gamificação e análise de bancas.

**Stack Tecnológica:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + Storage), Stripe

**MVP v2.0 (Expandido):** 12 semanas | Lançamento: Abril 2026  
**3 Planos:** FREE (5 questões/dia) | BÁSICO (R$ 39,90/mês) | PREMIUM (R$ 79,90/mês)

## ✅ Funcionalidades do MVP

✅ Sistema de Questões + Mnemônicos + Flashcards  
✅ **Gamificação completa** (pontos, badges, ranking, streak)  
✅ **Sistema de Cadernos Personalizados** (básico + inteligentes com IA)  
✅ **Análise de Inteligência de Bancas** (probabilidade de cobrança por tema)  
✅ 3 Planos de assinatura + Stripe (pagamentos recorrentes)  
✅ Sistema de moderação de conteúdo (questões/mnemônicos)  
✅ Rate limiting e segurança avançada (RLS + validação)

## 📚 Arquivos de Documentação

**SEMPRE consulte estes arquivos antes de implementar features:**

| Arquivo                          | Quando Usar                                            |
| -------------------------------- | ------------------------------------------------------ |
| `docs/01-PRD-COMPLETO.md`        | Entender visão geral, objetivos, MVP scope, cronograma |
| `docs/02-ARQUITETURA-SISTEMA.md` | Decisões arquiteturais, organização de pastas, padrões |
| `docs/03-DATABASE-SCHEMA.md`     | Schema do banco, tabelas, RLS policies, triggers       |
| `docs/04-FLUXOGRAMAS-MERMAID.md` | Fluxos de usuário, lógica de negócio visual            |
| `docs/05-COMPONENTES-UI.md`      | Templates de componentes, padrões de UI                |
| `docs/06-API-ENDPOINTS.md`       | Contratos de API, validações, responses                |
| `docs/07-REGRAS-NEGOCIO.md`      | Limites de planos, algoritmos, fórmulas específicas    |

## 🧠 MCPs Disponíveis

- **Sequential-Thinking**: Use para problemas complexos que requerem múltiplas etapas
- **Supabase**: Use para operações de banco de dados, auth, storage, migrations
- **Deepwiki**: Use para buscar informações técnicas e best practices

## 🎯 Princípios de Código

### 1. TypeScript Strict Mode

```typescript
// ✅ SEMPRE tipificar tudo com types do Supabase
import { Database } from '@/types/database.types';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type QuestaoInsert = Database['public']['Tables']['questoes']['Insert'];

interface UserProps {
  user: Usuario;
  onUpdate: (user: Usuario) => void;
}

// ❌ NUNCA usar 'any' ou 'unknown' sem validação
const data: any = {}; // PROIBIDO
```

---

### 2. React Server Components (RSC)

```typescript
// ✅ PADRÃO: Server Components por padrão, Client apenas quando necessário
// app/questoes/page.tsx (Server Component - sem 'use client')
import { createClient } from "@/lib/supabase/server";

export default async function QuestoesPage() {
  const supabase = createClient();
  const { data: questoes } = await supabase
    .from("questoes")
    .select("*")
    .order("created_at", { ascending: false });

  return <QuestoesList questoes={questoes} />;
}

// ✅ Client Component apenas para interatividade
// components/questao-card.tsx
("use client");

import { useState } from "react";

export function QuestaoCard({ questao }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (alternativa: string) => {
    setSelected(alternativa);
  };

  return <Card>{/* ... */}</Card>;
}
```

---

### 3. Supabase + Row Level Security (RLS)

```typescript
// ✅ PADRÃO: Sempre usar RLS policies
// Server-side (app/actions.ts)
import { createClient } from "@/lib/supabase/server";

export async function getMinhasQuestoes() {
  const supabase = createClient();

  // RLS automaticamente filtra por auth.uid()
  const { data, error } = await supabase
    .from("questoes")
    .select("*")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

  if (error) throw error;
  return data;
}

// Client-side (components/questoes-list.tsx)
("use client");

import { createClient } from "@/lib/supabase/client";

export function QuestoesList() {
  const supabase = createClient();

  // RLS policies aplicadas automaticamente
  const { data } = useQuery({
    queryKey: ["questoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("questoes").select("*");
      if (error) throw error;
      return data;
    },
  });

  return <div>{/* ... */}</div>;
}
```

---

### 4. Error Handling Robusto

```typescript
// ✅ SEMPRE usar try-catch + tipos de erro específicos
import { PostgrestError } from '@supabase/supabase-js';

export async function saveResposta(
  userId: string,
  questaoId: number,
  resposta: string
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('respostas_usuarios')
      .insert({
        user_id: userId,
        questao_id: questaoId,
        resposta_escolhida: resposta,
        tempo_resposta: 45,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    if (error instanceof PostgrestError) {
      console.error('Erro no banco:', error.message, error.code);
    } else {
      console.error('Erro desconhecido:', error);
    }

    return {
      success: false,
      error: 'Não foi possível salvar a resposta. Tente novamente.',
    };
  }
}
```

---

### 5. API Routes (Next.js 14 App Router)

```typescript
// ✅ PADRÃO: app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema de validação
const RespostaSchema = z.object({
  questao_id: z.number().int().positive(),
  resposta_escolhida: z.enum(['A', 'B', 'C', 'D', 'E']),
  tempo_resposta: z.number().int().min(0).max(3600),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Validação do body
    const body = await request.json();
    const validated = RespostaSchema.parse(body);

    // 3. Lógica de negócio
    const { data, error } = await supabase
      .from('respostas_usuarios')
      .insert({
        user_id: user.id,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Resposta
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

---

### 6. Validação com Zod

```typescript
// ✅ SEMPRE validar input do usuário
import { z } from 'zod';

// Schema
const CadernoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(100),
  descricao: z.string().max(500).optional(),
  tipo: z.enum(['manual', 'inteligente']),
  questoes_ids: z.array(z.number().int().positive()).max(100),
});

// Inferir tipo do schema
type CadernoInput = z.infer<typeof CadernoSchema>;

// Usar em função
export async function createCaderno(input: unknown) {
  // Valida e retorna tipado
  const validated = CadernoSchema.parse(input);

  // 'validated' é do tipo CadernoInput
  const { data } = await supabase.from('cadernos').insert(validated);

  return data;
}
```

---

### 7. React Query (TanStack Query v5)

```typescript
// ✅ SEMPRE usar React Query para cache e estado de servidor
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook customizado
export function useQuestoes(filtros: QuestaoFiltros) {
  return useQuery({
    queryKey: ['questoes', filtros],
    queryFn: () => fetchQuestoes(filtros),
    gcTime: 5 * 60 * 1000, // 5 minutos (antes era 'cacheTime' no v4)
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

// Mutation com invalidação de cache
export function useResponderQuestao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RespostaInput) => responderQuestao(data),
    onSuccess: () => {
      // Invalida cache de questões
      queryClient.invalidateQueries({ queryKey: ['questoes'] });
      queryClient.invalidateQueries({ queryKey: ['estatisticas'] });
    },
  });
}
```

---

### 8. Styling com Tailwind + shadcn/ui

```typescript
// ✅ PADRÃO: Usar classes utilitárias, agrupar por categoria
import { cn } from "@/lib/utils";

export function QuestaoCard({ questao, className }: Props) {
  return (
    <div
      className={cn(
        // Layout
        "flex flex-col gap-4",
        // Sizing
        "w-full max-w-2xl",
        // Spacing
        "p-6 mx-auto",
        // Visual
        "bg-white rounded-lg shadow-md border border-gray-200",
        // Interactive
        "hover:shadow-lg transition-shadow duration-200",
        // Responsive
        "md:p-8",
        // Custom classes
        className
      )}
    >
      {/* Content */}
    </div>
  );
}
```

---

### 9. Performance Optimization

```typescript
// ✅ useMemo para cálculos pesados
import { useMemo } from "react";

export function DashboardStats({ respostas }: Props) {
  const estatisticas = useMemo(() => {
    return calcularEstatisticas(respostas); // Cálculo pesado
  }, [respostas]);

  return <div>{/* usar estatisticas */}</div>;
}

// ✅ useCallback para funções em props
import { useCallback } from "react";

export function QuestoesList() {
  const handleItemClick = useCallback((id: number) => {
    // Lógica...
  }, []); // Dependências

  return (
    <div>
      {questoes.map((q) => (
        <QuestaoItem key={q.id} onClick={handleItemClick} />
      ))}
    </div>
  );
}

// ✅ React.memo para prevenir re-renders desnecessários
export const QuestaoCard = React.memo(
  ({ questao }: Props) => {
    // ...
  },
  (prevProps, nextProps) => {
    // Custom comparison (opcional)
    return prevProps.questao.id === nextProps.questao.id;
  }
);

// ✅ Dynamic imports para componentes pesados
import dynamic from "next/dynamic";

const GraficoDesempenho = dynamic(
  () => import("@/components/dashboard/grafico-desempenho"),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false, // Não renderizar no servidor
  }
);

// ✅ Next.js Image para otimização automática
import Image from "next/image";

<Image
  src="/logo.png"
  alt="KAV Concursos"
  width={200}
  height={80}
  priority // Above-the-fold
/>;
```

---

### 10. Acessibilidade (WCAG 2.1 AA)

```typescript
// ✅ Checklist obrigatório em TODOS os componentes interativos

export function AccessibleButton() {
  return (
    <div>
      {/* 1. ARIA Labels */}
      <button aria-label="Fechar modal" onClick={onClose}>
        <IconX />
      </button>

      {/* 2. Keyboard Navigation */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
        onClick={handleClick}
      >
        Clicável por teclado
      </div>

      {/* 3. Focus Visible */}
      <input
        type="text"
        className="focus:ring-2 focus:ring-primary focus:outline-none"
      />

      {/* 4. Screen Reader Only Text */}
      <span className="sr-only">Texto apenas para leitores de tela</span>

      {/* 5. Estados Claros */}
      <button disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? "Carregando..." : "Enviar"}
      </button>

      {/* 6. Contraste Adequado */}
      <p className="text-gray-900">Texto com contraste 4.5:1 mínimo</p>
    </div>
  );
}
```

---

## 🎨 Design System

### Cores (Tailwind)

```typescript
const colors = {
  // Brand
  primary: 'blue-600', // #2563EB

  // Feedback
  success: 'green-600', // #10B981
  error: 'red-600', // #DC2626
  warning: 'orange-500', // #F59E0B
  info: 'blue-500', // #3B82F6

  // Text
  text: {
    primary: 'gray-900', // #111827
    secondary: 'gray-600', // #4B5563
    disabled: 'gray-400', // #9CA3AF
  },

  // Backgrounds
  bg: {
    primary: 'white', // #FFFFFF
    secondary: 'gray-50', // #F9FAFB
    tertiary: 'gray-100', // #F3F4F6
  },

  // Borders
  border: 'gray-200', // #E5E7EB
};
```

### Espaçamento

```typescript
// Usar escala Tailwind: 4px base
gap - 2; // 8px
gap - 4; // 16px
gap - 6; // 24px
gap - 8; // 32px

p - 4; // padding: 16px
m - 6; // margin: 24px
```

---

## 📝 Padrões de Nomenclatura

```typescript
// Componentes
QuestaoCard.tsx; // PascalCase
DashboardStats.tsx;

// Hooks
use - questoes.ts; // kebab-case, prefixo 'use'
use - auth.ts;

// Utils/Helpers
format - date.ts; // kebab-case, verbo-substantivo
calculate - score.ts;

// Types/Interfaces
questao.types.ts; // kebab-case, sufixo '.types'
database.types.ts;

// Constantes
export const MAX_QUESTOES_PER_DAY = 5; // UPPER_SNAKE_CASE
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Variáveis
const userName = 'Pedro'; // camelCase
const isAuthenticated = true; // camelCase, boolean com 'is/has/can'
const hasPermission = false;

// Funções
function fetchQuestoes() {} // camelCase, verbo no infinitivo
function calculateTaxaAcerto() {}

// Handlers
const handleClick = () => {}; // camelCase, prefixo 'handle'
const handleSubmit = () => {};
const handleChange = () => {};

// Interfaces/Types
interface QuestaoCardProps {} // PascalCase, sufixo 'Props'
type QuestaoData = {
  /* ... */
}; // PascalCase, sufixo descritivo
```

---

## ⚠️ Evitar Absolutamente

```typescript
// ❌ NUNCA
const data: any = {};                   // Usar 'any'
fetch('/api/questoes');                 // Fetch direto (usar React Query)
console.log('Debug');                   // Console.log (usar logger)
if (value == null) {}                   // == (usar ===)
const x = a ? b : c ? d : e ? f : g;    // Ternários nested
state.count = 1;                        // Mutação direta
'use client' em Server Component        // Client desnecessário

// ❌ EVITAR
const magic = 42;                       // Magic numbers (usar constantes)
<div onClick={() => handleClick(item.id)}>  // Arrow function em JSX (usar useCallback)

// ✅ CORRETO
const MAX_ATTEMPTS = 42;
const handleItemClick = useCallback((id: number) => {
  handleClick(id);
}, [handleClick]);

<div onClick={() => handleItemClick(item.id)}>
```

---

## 🆕 Mudanças v2.0 - Regras Críticas

### 1. Sistema de Cadernos Obrigatório

```typescript
// ❌ PROIBIDO: Questões avulsas (rota removida)
GET /api/questoes // REMOVIDO
POST /api/questoes/responder // REMOVIDO (sem caderno_id)

// ✅ CORRETO: Sempre usar cadernos
GET /api/cadernos
POST /api/cadernos
GET /api/cadernos/[id]/questoes
POST /api/questoes/[id]/responder
  body: {
    questao_id: number,
    caderno_id: number, // ⚠️ OBRIGATÓRIO v2.0
    resposta_escolhida: string
  }

// ✅ Validação obrigatória
if (!caderno_id) {
  throw new Error('caderno_id é obrigatório');
}
```

---

### 2. Validação de Planos (FREE/BÁSICO/PREMIUM)

```typescript
// ✅ Helper para verificar limites
async function checkPlanLimits(userId: string, action: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', userId)
    .single();

  // FREE: 2 cadernos, 5 questões/dia
  if (profile.plano === 'free') {
    if (action === 'criar_caderno') {
      const { count } = await supabase
        .from('cadernos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count >= 2) {
        return {
          allowed: false,
          paywall: {
            feature: 'cadernos',
            planoMinimo: 'basic',
            preco: 39.9,
            cta: 'Assine BÁSICO para criar até 10 cadernos',
          },
        };
      }
    }

    if (action === 'responder_questao') {
      const { count } = await supabase
        .from('respostas_usuarios')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', new Date().setHours(0, 0, 0, 0).toISOString());

      if (count >= 5) {
        return {
          allowed: false,
          paywall: {
            feature: 'questoes_ilimitadas',
            planoMinimo: 'basic',
            preco: 39.9,
            cta: 'Assine BÁSICO para questões ilimitadas',
          },
        };
      }
    }
  }

  // BÁSICO: 10 cadernos, ilimitado questões
  if (profile.plano === 'basic' && action === 'criar_caderno') {
    const { count } = await supabase
      .from('cadernos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count >= 10) {
      return {
        allowed: false,
        paywall: {
          feature: 'cadernos_ilimitados',
          planoMinimo: 'premium',
          preco: 79.9,
          cta: 'Assine PREMIUM para cadernos ilimitados',
        },
      };
    }
  }

  return { allowed: true };
}
```

---

### 3. Sistema de Comentários (BÁSICO+ vê, PREMIUM escreve)

```typescript
// ✅ Validação no componente
'use client';

export function ComentariosSection({ questaoId, userPlano }: Props) {
  // FREE: Mostrar paywall
  if (userPlano === 'free') {
    return (
      <PaywallComentarios
        feature="ver_comentarios"
        planoMinimo="basic"
        preco={39.90}
        cta="Assine BÁSICO para ver comentários da comunidade"
      />
    );
  }

  // BÁSICO: Mostrar comentários (leitura apenas)
  if (userPlano === 'basic') {
    return (
      <div>
        <ComentariosList questaoId={questaoId} />
        <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded">
          💡 Assine PREMIUM para escrever comentários e ajudar outros concurseiros
        </div>
      </div>
    );
  }

  // PREMIUM: Mostrar comentários + form escrever
  return (
    <div>
      <ComentariosList questaoId={questaoId} />
      <ComentarioForm questaoId={questaoId} />
    </div>
  );
}

// ✅ Validação no endpoint
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', userId)
    .single();

  if (profile.plano !== 'premium') {
    return NextResponse.json({
      error: 'Escrever comentários é exclusivo para assinantes PREMIUM',
      paywall: {
        feature: 'escrever_comentarios',
        planoMinimo: 'premium',
        preco: 79.90,
        cta: 'Assine PREMIUM para comentar'
      }
    }, { status: 403 });
  }

  // Continuar lógica de criar comentário...
}
```

---

### 4. Materiais Extras (PREMIUM apenas)

```typescript
// ✅ Componente com paywall
'use client';

export function MateriaisSection({ questaoId, userPlano }: Props) {
  // FREE/BÁSICO: Mostrar paywall
  if (userPlano !== 'premium') {
    return (
      <PaywallMateriais
        feature="materiais_extras"
        planoMinimo="premium"
        preco={79.90}
        beneficios={[
          'Vídeo-aulas explicativas',
          'PDFs de resumo',
          'Links externos de aprofundamento'
        ]}
        cta="Assine PREMIUM e turbine seus estudos!"
      />
    );
  }

  // PREMIUM: Mostrar materiais
  return (
    <div>
      <MateriaisVideos questaoId={questaoId} />
      <MateriaisPDFs questaoId={questaoId} />
      <MateriaisLinks questaoId={questaoId} />
    </div>
  );
}

// ✅ Endpoint com RLS
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // RLS vai filtrar automaticamente (apenas PREMIUM vê)
  const { data: materiais, error } = await supabase
    .from('questoes_materiais_extras')
    .select('*')
    .eq('questao_id', params.id)
    .eq('is_active', true);

  // Se não retornar nada, usuário não é PREMIUM
  if (!materiais || materiais.length === 0) {
    return NextResponse.json({
      error: 'Materiais extras são exclusivos para assinantes PREMIUM',
      paywall: { /* ... */ }
    }, { status: 403 });
  }

  return NextResponse.json({ data: materiais });
}
```

---

### 5. RLS Policies - Sempre Ativas

```typescript
// ✅ SEMPRE usar Supabase client (server ou browser)
// RLS policies são aplicadas AUTOMATICAMENTE

// ❌ NUNCA fazer queries SQL diretas sem RLS
// ❌ NUNCA usar service_role key no frontend

// ✅ Server Component
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createClient(); // RLS ativo
  const { data } = await supabase.from('cadernos').select('*');
  // Retorna apenas cadernos do usuário autenticado
}

// ✅ Client Component
('use client');
import { createClient } from '@/lib/supabase/client';

export function Component() {
  const supabase = createClient(); // RLS ativo
  const { data } = useQuery({
    queryKey: ['cadernos'],
    queryFn: async () => {
      const { data } = await supabase.from('cadernos').select('*');
      return data; // RLS filtra automaticamente
    },
  });
}
```

---

### 6. Checklist v2.0 - Antes de Criar Feature

Ao criar qualquer feature relacionada a questões/cadernos/comentários/materiais:

- [ ] ✅ **Verificar plano do usuário** (FREE/BÁSICO/PREMIUM)
- [ ] ✅ **Validar limites** (cadernos, questões/dia, etc.)
- [ ] ✅ **Mostrar paywall** se feature bloqueada
- [ ] ✅ **Usar RLS policies** para controle de acesso
- [ ] ✅ **Adicionar `caderno_id`** em respostas (obrigatório)
- [ ] ✅ **TypeScript strict** com tipos do Supabase
- [ ] ✅ **Error handling** completo (try-catch + tipos)
- [ ] ✅ **Zod validation** em API routes
- [ ] ✅ **Consultar docs** (`07-REGRAS-NEGOCIO.md` para limites)

---

## 🔄 Workflow de Desenvolvimento

**Ao criar nova feature:**

- ✅ Ler `docs/07-REGRAS-NEGOCIO.md` para regras específicas
- ✅ Consultar `docs/04-FLUXOGRAMAS-MERMAID.md` para fluxo
- ✅ Verificar `docs/03-DATABASE-SCHEMA.md` se precisa nova tabela
- ✅ Criar migration no Supabase (se banco)
- ✅ Gerar types: `npx supabase gen types typescript > src/types/database.types.ts`
- ✅ Criar API route com template de `docs/06-API-ENDPOINTS.md`
- ✅ Adicionar validação Zod
- ✅ Criar hook com React Query
- ✅ Criar componentes seguindo templates de `docs/05-COMPONENTES-UI.md`
- ✅ Verificar acessibilidade (ARIA, keyboard, contraste)
- ✅ Testar responsividade (mobile → desktop)
- ✅ Escrever testes (se lógica crítica)

---

## 🧪 Testes

```typescript
// ✅ Testes unitários (Vitest)
import { describe, it, expect } from 'vitest';
import { calcularProximaRevisao } from '@/lib/flashcards';

describe('calcularProximaRevisao', () => {
  it('deve retornar intervalo de 1 dia para resposta difícil', () => {
    const resultado = calcularProximaRevisao('dificil', 5, 2, 2.5);
    expect(resultado.novoIntervalo).toBe(1);
  });

  it('deve dobrar intervalo para resposta fácil', () => {
    const resultado = calcularProximaRevisao('facil', 5, 2, 2.5);
    expect(resultado.novoIntervalo).toBe(10);
  });
});

// ✅ Testes de integração (Playwright) - features críticas
import { test, expect } from '@playwright/test';

test('deve responder questão corretamente', async ({ page }) => {
  await page.goto('/questoes');
  await page.click('[data-testid="alternativa-a"]');
  await page.click('button:has-text("Responder")');
  await expect(page.locator('[data-testid="feedback"]')).toContainText(
    'Correto'
  );
});
```

---

## 📞 Quando Pedir Ajuda ao Desenvolvedor

- ❓ Decisões de arquitetura (nova feature grande, nova tabela complexa)
- ❓ Regras de negócio ambíguas não documentadas
- ❓ Performance issues complexos (após 3 tentativas de otimização)
- ❓ Bugs que não consegue resolver após 3 abordagens diferentes
- ❓ Dúvidas sobre UX/UI não especificadas no design
- ❓ Integração com APIs de terceiros (Stripe edge cases)

---

## 🎯 Comandos Úteis para Copilot

### Criar Componente

```
Crie componente [Nome]Card seguindo template Card Component:
- Props: data (tipo [Tipo]), onAction opcional
- Usar shadcn/ui Card
- Badge com categoria
- Botão de ação principal
- Hover effect (shadow)
- Acessibilidade WCAG 2.1 AA
- TypeScript strict
- Consultar: docs/05-COMPONENTES-UI.md seção 3.1
```

### Criar API Route

```
Crie endpoint POST /api/[resource]/route.ts seguindo template POST:
- Autenticação obrigatória via Supabase
- Schema Zod: [especificar campos]
- Verificar limites do plano [free/basic/premium]
- Salvar em tabela [nome_tabela]
- Retornar 201 Created
- Error handling completo
- TypeScript strict
- Consultar: docs/06-API-ENDPOINTS.md seção 3.2
```

### Criar Hook

```
Crie hook use[Nome] que:
- Usa React Query para cache
- Busca [recurso] do Supabase com filtros
- Retorna { data, isLoading, error, refetch }
- Stale time de 5 minutos
- TypeScript genérico
- Consultar: docs/06-API-ENDPOINTS.md seção 5.2
```

### Implementar Regra de Negócio

```
Implemente regra: [descrever regra]
- Conforme docs/07-REGRAS-NEGOCIO.md seção X.Y
- Validações necessárias com Zod
- Error messages em PT-BR
- TypeScript strict
- Testes unitários
```

---

## 🚀 Prioridades de Desenvolvimento

1. 🔐 **Segurança** - RLS policies, validação, sanitização, HTTPS
2. ⚡ **Performance** - React Query, lazy loading, memoização, otimização de queries
3. ♿ **Acessibilidade** - ARIA labels, keyboard navigation, contraste, screen readers
4. 📱 **Responsividade** - Mobile-first, breakpoints, touch-friendly
5. 🧪 **Testabilidade** - Funções puras, injeção de dependências, testes automatizados
6. 📝 **Manutenibilidade** - Código limpo, auto-documentado, comentários apenas quando necessário

---

## 💡 Filosofia de Código

> **"Código deve ser escrito para humanos lerem, não apenas para máquinas executarem."**

- ✅ Priorizar clareza sobre cleverness
- ✅ Priorizar qualidade sobre velocidade
- ✅ Priorizar manutenibilidade sobre otimização prematura
- ✅ Priorizar segurança sobre conveniência
- ✅ Priorizar acessibilidade como requisito, não feature

---

## 📊 Métricas de Qualidade

**Código deve passar em TODAS antes de commit:**

- ✅ `npm run type-check` - 0 erros TypeScript
- ✅ `npm run lint` - 0 warnings ESLint
- ✅ `npm run format:check` - Código formatado (Prettier)
- ✅ `npm run test` - Todos testes passando
- ✅ Lighthouse Score > 90 (Performance, A11y, Best Practices, SEO)
- ✅ 0 erros no console do browser

---

## 🎯 Lembre-se

**Este projeto será desenvolvido PRINCIPALMENTE com IA (GitHub Copilot + ChatGPT).** Cada linha de código deve ser clara, tipada, testável e auto-documentada. Sempre priorize qualidade sobre velocidade.

---

**Versão:** 2.0  
**Última Atualização:** 18/10/2025  
**Próxima Revisão:** Após MVP (abril 2026)
