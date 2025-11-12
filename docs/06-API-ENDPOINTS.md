# API Endpoints - Design Patterns & Templates

**Versão:** 2.0  
**Data:** 18/10/2025  
**Framework:** Next.js 14 App Router  
**Objetivo:** Estabelecer padrões reutilizáveis para criação consistente de API Routes

> **⚠️ MUDANÇAS ESTRATÉGICAS v2.0:**
>
> - **Endpoints de questões avulsas REMOVIDOS**: `GET /api/questoes` (listar sem caderno)
> - **Novos endpoints**: Comentários (BÁSICO+), Materiais Extras (PREMIUM), Admin (moderação)
> - **Validação de planos**: Middleware valida FREE (5 questões/dia), BÁSICO (comentários), PREMIUM (materiais)
> - **Ver CHANGELOG-CADERNOS-v2.1.md** para detalhes completos

---

## 📑 Índice

1. [Princípios de API Design](#1-princípios-de-api-design)
2. [Estrutura de Pastas](#2-estrutura-de-pastas)
3. [Templates de Endpoints](#3-templates-de-endpoints)
4. [Padrões de Autenticação](#4-padrões-de-autenticação)
5. [Padrões de Validação](#5-padrões-de-validação)
6. [Padrões de Resposta](#6-padrões-de-resposta)
7. [Padrões de Error Handling](#7-padrões-de-error-handling)
8. [Checklist de Criação](#8-checklist-de-criação)

---

## 1. Princípios de API Design

### 1.1 RESTful Conventions

// ✅ PADRÃO: Seguir convenções HTTP

GET /api/questoes // Listar todos
GET /api/questoes/:id // Buscar um
POST /api/questoes // Criar novo
PUT /api/questoes/:id // Atualizar completo
PATCH /api/questoes/:id // Atualizar parcial
DELETE /api/questoes/:id // Deletar

// Ações específicas (POST para operações não-CRUD)
POST /api/questoes/:id/responder
POST /api/cadernos/:id/export-pdf
POST /api/mnemonicos/:id/vote

---

### 1.2 Nomenclatura de Endpoints

// ✅ BOM: Substantivos no plural, kebab-case
/api/questoes
/api/mnemonicos
/api/cadernos-personalizados

// ❌ RUIM: Verbos, camelCase, singular
/api/getQuestoes
/api/createQuestao
/api/questao

---

### 1.3 Estrutura de Arquivos (v2.0 - Atualizada)

```
src/app/api/
├── auth/
│   ├── callback/
│   │   └── route.ts              # GET /api/auth/callback
│   ├── signup/
│   │   └── route.ts              # POST /api/auth/signup
│   └── logout/
│       └── route.ts              # POST /api/auth/logout
│
├── cadernos/                      # 🆕 Endpoints principais v2.0
│   ├── route.ts                   # GET (listar), POST (criar)
│   └── [id]/
│       ├── route.ts               # GET, PUT, DELETE
│       ├── questoes/
│       │   └── route.ts           # GET questões do caderno
│       └── export-pdf/
│           └── route.ts           # POST export caderno
│
├── questoes/
│   └── [id]/
│       ├── route.ts               # GET questão específica
│       ├── responder/
│       │   └── route.ts           # POST responder questão
│       ├── comentarios/           # 🆕 Sistema comentários (BÁSICO+)
│       │   ├── route.ts           # GET (BÁSICO+), POST (PREMIUM)
│       │   └── [comentarioId]/
│       │       ├── vote/
│       │       │   └── route.ts   # POST upvote/downvote
│       │       └── report/
│       │           └── route.ts   # POST reportar
│       └── materiais/             # 🆕 Materiais extras (PREMIUM)
│           ├── route.ts           # GET materiais (PREMIUM only)
│           └── [materialId]/
│               ├── download/
│               │   └── route.ts   # POST registrar download
│               └── progresso/
│                   └── route.ts   # PUT atualizar progresso vídeo
│
├── mnemonicos/
│   ├── route.ts                   # GET, POST
│   ├── [id]/
│   │   └── route.ts               # GET, PUT, DELETE
│   └── vote/
│       └── route.ts               # POST votar
│
├── admin/                         # 🆕 Endpoints administrativos
│   ├── comentarios/
│   │   └── moderar/
│   │       └── route.ts           # POST aprovar/rejeitar
│   └── materiais/
│       └── route.ts               # POST upload materiais
│
└── stripe/
    ├── checkout/
    │   └── route.ts               # POST criar checkout session
    ├── portal/
    │   └── route.ts               # POST customer portal
    └── webhook/
        └── route.ts               # POST webhook events
```

**Mudanças v2.0:**

- ❌ **Removido**: `GET /api/questoes` (listar questões sem caderno)
- ✅ **Adicionado**: `/api/cadernos` como rota principal
- ✅ **Adicionado**: `/api/questoes/[id]/comentarios` (BÁSICO+ vê, PREMIUM escreve)
- ✅ **Adicionado**: `/api/questoes/[id]/materiais` (PREMIUM apenas)
- ✅ **Adicionado**: `/api/admin/*` (moderação e upload)

---

│
├── stripe/
│ ├── checkout/
│ │ └── route.ts # POST /api/stripe/checkout
│ ├── portal/
│ │ └── route.ts # POST /api/stripe/portal
│ └── webhook/
│ └── route.ts # POST /api/stripe/webhook
│
└── admin/
├── questoes/
│ └── import/
│ └── route.ts # POST /api/admin/questoes/import
└── stats/
└── route.ts # GET /api/admin/stats

---

## 2. Estrutura de Pastas

### 2.1 Convenções

app/api/[resource]/
├── route.ts # Collection endpoint (GET, POST)
├── [id]/
│ └── route.ts # Item endpoint (GET, PUT, DELETE)
└── [action]/
└── route.ts # Action endpoint (POST)

---

## 3. Templates de Endpoints

### 3.1 Template: GET Collection (Listar)

// src/app/api/[resource]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 1. Schema de query params (opcional)
const QuerySchema = z.object({
page: z.coerce.number().int().positive().default(1),
limit: z.coerce.number().int().positive().max(100).default(20),
disciplina_id: z.coerce.number().int().positive().optional(),
search: z.string().optional(),
});

// 2. GET Handler
export async function GET(request: NextRequest) {
try {
// 3. Autenticação (se necessário)
const supabase = createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
return NextResponse.json(
{ error: 'Não autenticado' },
{ status: 401 }
);
}

// 4. Validar query params
const searchParams = request.nextUrl.searchParams;
const params = QuerySchema.parse({
page: searchParams.get('page'),
limit: searchParams.get('limit'),
disciplina_id: searchParams.get('disciplina_id'),
search: searchParams.get('search'),
});

// 5. Calcular offset
const offset = (params.page - 1) \* params.limit;

// 6. Query no banco
let query = supabase
.from('[table_name]')
.select('\*', { count: 'exact' })
.order('created_at', { ascending: false })
.range(offset, offset + params.limit - 1);

// 7. Aplicar filtros opcionais
if (params.disciplina_id) {
query = query.eq('disciplina_id', params.disciplina_id);
}

if (params.search) {
query = query.ilike('nome', `%${params.search}%`);
}

// 8. Executar query
const { data, error, count } = await query;

if (error) throw error;

// 9. Retornar resposta paginada
return NextResponse.json({
data,
pagination: {
page: params.page,
limit: params.limit,
total: count || 0,
totalPages: Math.ceil((count || 0) / params.limit),
},
});
} catch (error) {
// 10. Error handling
if (error instanceof z.ZodError) {
return NextResponse.json(
{ error: 'Parâmetros inválidos', details: error.errors },
{ status: 400 }
);
}

console.error('[GET /api/[resource]]:', error);
return NextResponse.json(
{ error: 'Erro interno do servidor' },
{ status: 500 }
);
}
}

---

### 3.2 Template: POST (Criar)

// src/app/api/[resource]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 1. Schema de validação do body
const CreateSchema = z.object({
nome: z.string().min(3, 'Mínimo 3 caracteres').max(100),
descricao: z.string().optional(),
categoria: z.enum(['cat1', 'cat2', 'cat3']),
// ... outros campos
});

// 2. POST Handler
export async function POST(request: NextRequest) {
try {
// 3. Autenticação
const supabase = createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
return NextResponse.json(
{ error: 'Não autenticado' },
{ status: 401 }
);
}

// 4. Parse e validar body
const body = await request.json();
const validated = CreateSchema.parse(body);

// 5. Verificar permissões (se necessário)
const { data: profile } = await supabase
.from('profiles')
.select('plano')
.eq('id', user.id)
.single();

if (profile?.plano === 'free') {
// Verificar limites do plano free
const { count } = await supabase
.from('[table_name]')
.select('\*', { count: 'exact', head: true })
.eq('user_id', user.id);

if ((count || 0) >= 10) {
return NextResponse.json(
{ error: 'Limite do plano free atingido. Faça upgrade.' },
{ status: 403 }
);
}
}

// 6. Inserir no banco
const { data, error } = await supabase
.from('[table_name]')
.insert({
...validated,
user_id: user.id,
})
.select()
.single();

if (error) throw error;

// 7. Retornar sucesso
return NextResponse.json(
{ message: 'Criado com sucesso', data },
{ status: 201 }
);
} catch (error) {
if (error instanceof z.ZodError) {
return NextResponse.json(
{ error: 'Dados inválidos', details: error.errors },
{ status: 400 }
);
}

console.error('[POST /api/[resource]]:', error);
return NextResponse.json(
{ error: 'Erro interno do servidor' },
{ status: 500 }
);
}
}

---

### 3.3 Template: GET Item (Buscar Um)

// src/app/api/[resource]/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Params {
params: {
id: string;
};
}

// 1. GET Handler
export async function GET(request: NextRequest, { params }: Params) {
try {
// 2. Validar ID
const id = parseInt(params.id);
if (isNaN(id)) {
return NextResponse.json(
{ error: 'ID inválido' },
{ status: 400 }
);
}

// 3. Autenticação (se necessário)
const supabase = createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
return NextResponse.json(
{ error: 'Não autenticado' },
{ status: 401 }
);
}

// 4. Buscar no banco
const { data, error } = await supabase
.from('[table_name]')
.select('\*')
.eq('id', id)
.single();

// 5. Verificar se existe
if (error || !data) {
return NextResponse.json(
{ error: 'Recurso não encontrado' },
{ status: 404 }
);
}

// 6. Verificar permissão (se recurso é privado)
if (data.user_id !== user.id) {
return NextResponse.json(
{ error: 'Sem permissão para acessar este recurso' },
{ status: 403 }
);
}

// 7. Retornar dados
return NextResponse.json({ data });
} catch (error) {
console.error('[GET /api/[resource]/:id]:', error);
return NextResponse.json(
{ error: 'Erro interno do servidor' },
{ status: 500 }
);
}
}

---

### 3.4 Template: PUT/PATCH (Atualizar)

// src/app/api/[resource]/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 1. Schema de validação (campos opcionais para PATCH)
const UpdateSchema = z.object({
nome: z.string().min(3).max(100).optional(),
descricao: z.string().optional(),
categoria: z.enum(['cat1', 'cat2', 'cat3']).optional(),
});

interface Params {
params: {
id: string;
};
}

// 2. PUT/PATCH Handler
export async function PUT(request: NextRequest, { params }: Params) {
try {
// 3. Validar ID
const id = parseInt(params.id);
if (isNaN(id)) {
return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
}

// 4. Autenticação
const supabase = createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
}

// 5. Validar body
const body = await request.json();
const validated = UpdateSchema.parse(body);

// 6. Verificar se recurso existe e pertence ao usuário
const { data: existing } = await supabase
.from('[table_name]')
.select('user_id')
.eq('id', id)
.single();

if (!existing) {
return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 });
}

if (existing.user_id !== user.id) {
return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
}

// 7. Atualizar
const { data, error } = await supabase
.from('[table_name]')
.update({
...validated,
updated_at: new Date().toISOString(),
})
.eq('id', id)
.select()
.single();

if (error) throw error;

// 8. Retornar atualizado
return NextResponse.json({ message: 'Atualizado com sucesso', data });
} catch (error) {
if (error instanceof z.ZodError) {
return NextResponse.json(
{ error: 'Dados inválidos', details: error.errors },
{ status: 400 }
);
}

console.error('[PUT /api/[resource]/:id]:', error);
return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
}
}

---

### 3.5 Template: DELETE (Deletar)

// src/app/api/[resource]/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Params {
params: {
id: string;
};
}

export async function DELETE(request: NextRequest, { params }: Params) {
try {
// 1. Validar ID
const id = parseInt(params.id);
if (isNaN(id)) {
return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
}

// 2. Autenticação
const supabase = createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
}

// 3. Verificar permissão
const { data: existing } = await supabase
.from('[table_name]')
.select('user_id')
.eq('id', id)
.single();

if (!existing) {
return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 });
}

if (existing.user_id !== user.id) {
return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
}

// 4. Deletar (ou soft delete)
// Opção 1: Hard delete
const { error } = await supabase
.from('[table_name]')
.delete()
.eq('id', id);

// Opção 2: Soft delete (preferível)
// const { error } = await supabase
// .from('[table_name]')
// .update({ is_active: false, deleted_at: new Date().toISOString() })
// .eq('id', id);

if (error) throw error;

// 5. Retornar sucesso
return NextResponse.json({ message: 'Deletado com sucesso' });
} catch (error) {
console.error('[DELETE /api/[resource]/:id]:', error);
return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
}
}

---

### 3.6 Template: Action Endpoint (POST específico)

// src/app/api/questoes/responder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 1. Schema
const ResponderSchema = z.object({
questao_id: z.number().int().positive(),
resposta_escolhida: z.enum(['A', 'B', 'C', 'D', 'E']),
tempo_resposta: z.number().int().min(0).max(3600).optional(),
caderno_id: z.number().int().positive().optional(),
});

// 2. POST Handler
export async function POST(request: NextRequest) {
try {
// 3. Autenticação
const supabase = createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
}

// 4. Validar body
const body = await request.json();
const validated = ResponderSchema.parse(body);

// 5. Verificar se já respondeu
const { data: existing } = await supabase
.from('respostas_usuarios')
.select('id')
.eq('user_id', user.id)
.eq('questao_id', validated.questao_id)
.single();

if (existing) {
return NextResponse.json(
{ error: 'Você já respondeu esta questão' },
{ status: 400 }
);
}

// 6. Buscar questão para verificar gabarito
const { data: questao } = await supabase
.from('questoes')
.select('gabarito, explicacao, artigo_id')
.eq('id', validated.questao_id)
.single();

if (!questao) {
return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
}

// 7. Verificar se está correta
const correta = validated.resposta_escolhida === questao.gabarito;

// 8. Salvar resposta
const { data: resposta, error } = await supabase
.from('respostas_usuarios')
.insert({
user_id: user.id,
questao_id: validated.questao_id,
resposta_escolhida: validated.resposta_escolhida,
correta,
tempo_resposta: validated.tempo_resposta,
caderno_id: validated.caderno_id,
modo: validated.caderno_id ? 'caderno' : 'pratica',
})
.select()
.single();

if (error) throw error;

// 9. Trigger vai atualizar estatísticas automaticamente

// 10. Retornar feedback
return NextResponse.json({
success: true,
correta,
gabarito: questao.gabarito,
explicacao: questao.explicacao,
artigo_id: questao.artigo_id,
pontos_ganhos: correta ? 5 : 0,
});
} catch (error) {
if (error instanceof z.ZodError) {
return NextResponse.json(
{ error: 'Dados inválidos', details: error.errors },
{ status: 400 }
);
}

    console.error('[POST /api/questoes/responder]:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });

}
}

````

---

### 3.7 Template: GET Comentários com Validação de Plano (🆕 v2.0)

```typescript
// src/app/api/questoes/[id]/comentarios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 1. Schema query params
const QuerySchema = z.object({
  ordem: z.enum(['votos', 'recente']).default('votos'),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// 2. GET Handler - BÁSICO e PREMIUM podem ver
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // 3. Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 4. Verificar plano (BÁSICO ou PREMIUM)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single();

    if (!profile || profile.plano === 'free') {
      return NextResponse.json({
        error: 'Comentários disponíveis apenas para assinantes',
        paywall: {
          feature: 'comentarios',
          planoMinimo: 'basic',
          preco: 39.90,
          cta: 'Assine o plano BÁSICO para ver comentários da comunidade'
        }
      }, { status: 403 });
    }

    // 5. Validar query params
    const searchParams = request.nextUrl.searchParams;
    const { ordem, limit } = QuerySchema.parse({
      ordem: searchParams.get('ordem'),
      limit: searchParams.get('limit'),
    });

    // 6. Buscar comentários (RLS vai filtrar por plano automaticamente)
    let query = supabase
      .from('questoes_comentarios')
      .select(`
        *,
        autor:profiles!user_id (
          nome_completo,
          avatar_url
        )
      `)
      .eq('questao_id', params.id)
      .eq('is_validado', true);

    // 7. Aplicar ordenação
    if (ordem === 'votos') {
      // Professores primeiro, depois por votos
      query = query.order('autor_tipo', { ascending: true });  // 'professor' < 'usuario'
      query = query.order('votos', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data: comentarios, error } = await query;
    if (error) throw error;

    // 8. Buscar votos do usuário
    const { data: userVotos } = await supabase
      .from('comentarios_votos')
      .select('comentario_id, tipo')
      .eq('user_id', user.id)
      .in('comentario_id', comentarios?.map(c => c.id) || []);

    const votosMap = new Map(userVotos?.map(v => [v.comentario_id, v.tipo]));

    // 9. Adicionar informação de voto do usuário
    const comentariosComVotos = comentarios?.map(c => ({
      ...c,
      user_votou: votosMap.get(c.id) || null,
    }));

    return NextResponse.json({
      data: comentariosComVotos,
      total: comentariosComVotos?.length || 0,
      ordem,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Parâmetros inválidos', details: error.errors }, { status: 400 });
    }

    console.error('[GET /api/questoes/[id]/comentarios]:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
````

---

### 3.8 Template: POST Comentário (PREMIUM apenas) (🆕 v2.0)

```typescript
// src/app/api/questoes/[id]/comentarios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 1. Schema validação
const ComentarioSchema = z.object({
  conteudo: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(2000, 'Máximo 2000 caracteres'),
  autor_tipo: z.enum(['usuario', 'professor']).default('usuario'),
});

// 2. POST Handler - Apenas PREMIUM pode comentar
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // 3. Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 4. Verificar plano (PREMIUM ou role = 'admin')
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano, role')
      .eq('id', user.id)
      .single();

    const isPremiumOrAdmin =
      profile?.plano === 'premium' || profile?.role === 'admin';

    if (!isPremiumOrAdmin) {
      return NextResponse.json(
        {
          error: 'Escrever comentários é exclusivo para assinantes PREMIUM',
          paywall: {
            feature: 'escrever_comentarios',
            planoMinimo: 'premium',
            preco: 79.9,
            cta: 'Assine o plano PREMIUM para comentar e ajudar outros concurseiros',
          },
        },
        { status: 403 }
      );
    }

    // 5. Verificar limite diário (5 comentários/dia para prevenir spam)
    const { count } = await supabase
      .from('questoes_comentarios')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte(
        'created_at',
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      );

    if (count && count >= 5) {
      return NextResponse.json(
        {
          error: 'Limite diário de 5 comentários atingido',
          resetAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
        },
        { status: 429 }
      );
    }

    // 6. Validar body
    const body = await request.json();
    const validated = ComentarioSchema.parse(body);

    // 7. Determinar tipo de autor (admins podem ser 'professor')
    const autorTipo =
      profile.role === 'admin' && validated.autor_tipo === 'professor'
        ? 'professor'
        : 'usuario';

    // 8. Criar comentário
    const { data: comentario, error } = await supabase
      .from('questoes_comentarios')
      .insert({
        questao_id: parseInt(params.id),
        user_id: user.id,
        autor_tipo: autorTipo,
        conteudo: validated.conteudo,
        is_validado: autorTipo === 'professor', // Auto-aprovar professores
      })
      .select(
        `
        *,
        autor:profiles!user_id (
          nome_completo,
          avatar_url
        )
      `
      )
      .single();

    if (error) throw error;

    // 9. Notificar moderadores se não for auto-aprovado
    if (autorTipo === 'usuario') {
      // TODO: Enviar notificação para moderadores
      console.log('[TODO] Notificar moderadores:', comentario.id);
    }

    return NextResponse.json(
      {
        success: true,
        data: comentario,
        message:
          autorTipo === 'professor'
            ? 'Comentário publicado imediatamente'
            : 'Comentário enviado para aprovação',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[POST /api/questoes/[id]/comentarios]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

---

### 3.9 Template: GET Materiais Extras (PREMIUM apenas) (🆕 v2.0)

```typescript
// src/app/api/questoes/[id]/materiais/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 1. Schema query params
const QuerySchema = z.object({
  tipo: z.enum(['video', 'pdf', 'link_externo']).optional(),
});

// 2. GET Handler - Apenas PREMIUM
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // 3. Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 4. Verificar plano (PREMIUM ou Admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano, role')
      .eq('id', user.id)
      .single();

    const isPremiumOrAdmin =
      profile?.plano === 'premium' || profile?.role === 'admin';

    if (!isPremiumOrAdmin) {
      return NextResponse.json(
        {
          error: 'Materiais extras são exclusivos para assinantes PREMIUM',
          paywall: {
            feature: 'materiais_extras',
            planoMinimo: 'premium',
            preco: 79.9,
            beneficios: [
              'Vídeo-aulas explicativas',
              'PDFs de resumo',
              'Links externos de aprofundamento',
            ],
            cta: 'Assine PREMIUM e turbine seus estudos!',
          },
        },
        { status: 403 }
      );
    }

    // 5. Validar query params
    const searchParams = request.nextUrl.searchParams;
    const { tipo } = QuerySchema.parse({
      tipo: searchParams.get('tipo'),
    });

    // 6. Buscar materiais (RLS vai filtrar automaticamente)
    let query = supabase
      .from('questoes_materiais_extras')
      .select('*')
      .eq('questao_id', params.id)
      .eq('is_active', true)
      .order('tipo', { ascending: true })
      .order('ordem', { ascending: true });

    // 7. Filtrar por tipo se especificado
    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data: materiais, error } = await query;
    if (error) throw error;

    // 8. Buscar progresso do usuário (vídeos assistidos, PDFs baixados)
    const { data: interacoes } = await supabase
      .from('materiais_interacoes')
      .select('material_id, acao, progresso_percentual')
      .eq('user_id', user.id)
      .in('material_id', materiais?.map((m) => m.id) || []);

    const interacoesMap = new Map(interacoes?.map((i) => [i.material_id, i]));

    // 9. Adicionar progresso aos materiais
    const materiaisComProgresso = materiais?.map((m) => ({
      ...m,
      progresso: interacoesMap.get(m.id) || null,
    }));

    // 10. Agrupar por tipo
    const agrupados = {
      videos: materiaisComProgresso?.filter((m) => m.tipo === 'video') || [],
      pdfs: materiaisComProgresso?.filter((m) => m.tipo === 'pdf') || [],
      links:
        materiaisComProgresso?.filter((m) => m.tipo === 'link_externo') || [],
    };

    return NextResponse.json({
      data: tipo ? materiaisComProgresso : agrupados,
      total: materiaisComProgresso?.length || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[GET /api/questoes/[id]/materiais]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

---## 4. Padrões de Autenticação

### 4.1 Helper: Verificar Autenticação

// src/lib/api/auth.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAuth() {
const supabase = createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
return {
error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
user: null,
};
}

return { user, error: null };
}

// Uso:
export async function POST(request: NextRequest) {
const { user, error } = await requireAuth();
if (error) return error;

// Continuar com lógica...
}

---

### 4.2 Helper: Verificar Permissão de Admin

// src/lib/api/auth.ts

export async function requireAdmin() {
const { user, error } = await requireAuth();
if (error) return { error, user: null, profile: null };

const supabase = createClient();
const { data: profile } = await supabase
.from('profiles')
.select('role')
.eq('id', user.id)
.single();

if (profile?.role !== 'admin') {
return {
error: NextResponse.json({ error: 'Sem permissão' }, { status: 403 }),
user: null,
profile: null,
};
}

return { user, profile, error: null };
}

---

### 4.3 Helper: Verificar Plano

// src/lib/api/auth.ts

export async function requirePlan(minPlan: 'basic' | 'premium') {
const { user, error } = await requireAuth();
if (error) return { error, user: null, profile: null };

const supabase = createClient();
const { data: profile } = await supabase
.from('profiles')
.select('plano')
.eq('id', user.id)
.single();

const planHierarchy = { free: 0, basic: 1, premium: 2 };
const userPlanLevel = planHierarchy[profile?.plano as keyof typeof planHierarchy] || 0;
const requiredLevel = planHierarchy[minPlan];

if (userPlanLevel < requiredLevel) {
return {
error: NextResponse.json(
{ error: Plano ${minPlan} ou superior necessário },
{ status: 403 }
),
user: null,
profile: null,
};
}

return { user, profile, error: null };
}

---

## 5. Padrões de Validação

### 5.1 Schemas Reutilizáveis

// src/lib/validations/common.ts

import { z } from 'zod';

// Pagination
export const PaginationSchema = z.object({
page: z.coerce.number().int().positive().default(1),
limit: z.coerce.number().int().positive().max(100).default(20),
});

// ID
export const IdSchema = z.coerce.number().int().positive();

// Date range
export const DateRangeSchema = z.object({
start: z.coerce.date(),
end: z.coerce.date(),
}).refine(data => data.end >= data.start, {
message: 'Data final deve ser maior ou igual à inicial',
});

// Search
export const SearchSchema = z.object({
q: z.string().min(1).max(100),
});

---

### 5.2 Validação de Query Params

import { NextRequest } from 'next/server';
import { z } from 'zod';

function parseQueryParams<T extends z.ZodTypeAny>(
request: NextRequest,
schema: T
): z.infer<T> {
const searchParams = request.nextUrl.searchParams;
const params = Object.fromEntries(searchParams.entries());
return schema.parse(params);
}

// Uso:
const params = parseQueryParams(request, z.object({
page: z.coerce.number().default(1),
limit: z.coerce.number().default(20),
}));

---

## 6. Padrões de Resposta

### 6.1 Estruturas Padrão

// src/lib/api/responses.ts

import { NextResponse } from 'next/server';

// Sucesso com dados
export function successResponse<T>(data: T, status = 200) {
return NextResponse.json({ data }, { status });
}

// Sucesso com dados paginados
export function paginatedResponse<T>(
data: T[],
pagination: {
page: number;
limit: number;
total: number;
totalPages: number;
}
) {
return NextResponse.json({ data, pagination });
}

// Sucesso com mensagem
export function messageResponse(message: string, status = 200) {
return NextResponse.json({ message }, { status });
}

// Erro
export function errorResponse(
message: string,
status = 500,
details?: unknown
) {
return NextResponse.json(
{ error: message, ...(details && { details }) },
{ status }
);
}

---

### 6.2 Status Codes Padrão

// ✅ Usar códigos HTTP apropriados

200 OK // GET, PUT, PATCH bem-sucedidos
201 Created // POST bem-sucedido (criar)
204 No Content // DELETE bem-sucedido

400 Bad Request // Validação falhou, dados inválidos
401 Unauthorized // Não autenticado
403 Forbidden // Autenticado mas sem permissão
404 Not Found // Recurso não existe
409 Conflict // Conflito (ex: email já existe)
422 Unprocessable // Validação de negócio falhou

500 Internal Error // Erro inesperado do servidor
503 Service Unavailable // Serviço temporariamente indisponível

---

## 7. Padrões de Error Handling

### 7.1 Try-Catch Completo

export async function POST(request: NextRequest) {
try {
// Lógica...

} catch (error) {
// 1. Zod validation error
if (error instanceof z.ZodError) {
return NextResponse.json(
{ error: 'Dados inválidos', details: error.errors },
{ status: 400 }
);
}

// 2. Supabase error
if (error && typeof error === 'object' && 'code' in error) {
const dbError = error as { code: string; message: string };

// Duplicate key
if (dbError.code === '23505') {
return NextResponse.json(
{ error: 'Recurso já existe' },
{ status: 409 }
);
}

// Foreign key violation
if (dbError.code === '23503') {
return NextResponse.json(
{ error: 'Referência inválida' },
{ status: 400 }
);
}
}

// 3. Custom app errors
if (error instanceof AppError) {
return NextResponse.json(
{ error: error.message },
{ status: error.statusCode }
);
}

// 4. Unknown error
console.error('[API Error]:', error);
return NextResponse.json(
{ error: 'Erro interno do servidor' },
{ status: 500 }
);
}
}

---

### 7.2 Custom Error Classes

// src/lib/api/errors.ts

export class AppError extends Error {
constructor(
public message: string,
public statusCode: number = 500
) {
super(message);
this.name = 'AppError';
}
}

export class NotFoundError extends AppError {
constructor(resource: string) {
super(${resource} não encontrado, 404);
this.name = 'NotFoundError';
}
}

export class ValidationError extends AppError {
constructor(message: string) {
super(message, 400);
this.name = 'ValidationError';
}
}

export class UnauthorizedError extends AppError {
constructor(message = 'Não autenticado') {
super(message, 401);
this.name = 'UnauthorizedError';
}
}

export class ForbiddenError extends AppError {
constructor(message = 'Sem permissão') {
super(message, 403);
this.name = 'ForbiddenError';
}
}

// Uso:
if (!user) throw new UnauthorizedError();
if (!questao) throw new NotFoundError('Questão');

---

## 8. Checklist de Criação

### 8.1 Checklist de API Route

Antes de criar um endpoint, verificar:

1. Design
   Segue convenções RESTful?

Nomenclatura correta (plural, kebab-case)?

Localização correta na estrutura de pastas?

Método HTTP apropriado?

2. Segurança
   Autenticação verificada?

Autorização verificada?

RLS habilitado na tabela?

Validação de input (Zod)?

Rate limiting configurado? (produção)

3. Validação
   Schema Zod definido?

Query params validados?

Body validado?

IDs validados?

Mensagens de erro claras?

4. Database
   Queries otimizadas (índices)?

Transações quando necessário?

Paginação implementada?

Filtros aplicados corretamente?

RLS policies testadas?

5. Respostas
   Status codes corretos?

Estrutura de resposta consistente?

Mensagens de erro em PT-BR?

Dados sensíveis filtrados?

6. Error Handling
   Try-catch completo?

Todos tipos de erro tratados?

Logs de erro implementados?

Não expõe stack trace em produção?

7. Performance
   Queries N+1 evitadas?

Caching implementado? (quando apropriado)

Timeout configurado?

Payload limitado?

8. Documentação
   Comentários em lógica complexa?

Endpoint documentado?

Exemplos de request/response?

---

## 9. Exemplos de Endpoints Específicos

### 9.1 Stripe Webhook

// src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
try {
// 1. Verificar assinatura do webhook
const body = await request.text();
const signature = headers().get('stripe-signature')!;

let event: Stripe.Event;
try {
event = stripe.webhooks.constructEvent(
body,
signature,
process.env.STRIPE_WEBHOOK_SECRET!
);
} catch (err) {
console.error('Webhook signature verification failed:', err);
return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
}

// 2. Processar evento
const supabase = createClient();

switch (event.type) {
case 'checkout.session.completed': {
const session = event.data.object as Stripe.Checkout.Session;

    // Atualizar profile do usuário
    await supabase
      .from('profiles')
      .update({
        plano: 'premium',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
      })
      .eq('id', session.metadata?.user_id);

    break;

}

case 'customer.subscription.deleted': {
const subscription = event.data.object as Stripe.Subscription;

    // Downgrade para free
    await supabase
      .from('profiles')
      .update({ plano: 'free' })
      .eq('stripe_subscription_id', subscription.id);

    break;

}

// Outros eventos...
}

return NextResponse.json({ received: true });
} catch (error) {
console.error('Webhook error:', error);
return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
}
}

---

## 10. Comandos para Copilot

### Criar Endpoint GET Collection

Crie endpoint GET /api/[resource]/route.ts seguindo template GET Collection:

Autenticação obrigatória

Query params: page, limit, [filtro_especifico]

Paginação com count

Validação Zod

Error handling completo

TypeScript strict

### Criar Endpoint POST

Crie endpoint POST /api/[resource]/route.ts seguindo template POST:

Autenticação obrigatória

Schema Zod: [especificar campos]

Verificar permissões [free/basic/premium]

Salvar em tabela [nome_tabela]

Retornar 201 Created

TypeScript strict

### Criar Action Endpoint

Crie endpoint POST /api/[resource]/[action]/route.ts seguindo template Action:

Autenticação obrigatória

Schema Zod: [especificar campos]

Lógica: [descrever ação específica]

Verificar duplicatas

Retornar feedback completo

TypeScript strict

---

## 📝 Resumo das Mudanças v2.0

### Endpoints Removidos

❌ `GET /api/questoes` (listar questões sem caderno)  
❌ `POST /api/questoes` (criar questão avulsa - apenas admins agora)

### Novos Endpoints v2.0

#### **Cadernos (Principal)**

✅ `GET /api/cadernos` - Listar cadernos do usuário  
✅ `POST /api/cadernos` - Criar caderno (validar limite por plano)  
✅ `GET /api/cadernos/[id]` - Buscar caderno específico  
✅ `PUT /api/cadernos/[id]` - Atualizar caderno  
✅ `DELETE /api/cadernos/[id]` - Deletar caderno  
✅ `GET /api/cadernos/[id]/questoes` - Listar questões do caderno

#### **Comentários (BÁSICO+ vê, PREMIUM escreve)**

✅ `GET /api/questoes/[id]/comentarios` - Listar comentários (BÁSICO+)  
✅ `POST /api/questoes/[id]/comentarios` - Criar comentário (PREMIUM)  
✅ `POST /api/questoes/[id]/comentarios/[id]/vote` - Votar (upvote/downvote)  
✅ `POST /api/questoes/[id]/comentarios/[id]/report` - Reportar comentário

#### **Materiais Extras (PREMIUM apenas)**

✅ `GET /api/questoes/[id]/materiais` - Listar materiais (PREMIUM)  
✅ `POST /api/questoes/[id]/materiais/[id]/download` - Registrar download PDF  
✅ `PUT /api/questoes/[id]/materiais/[id]/progresso` - Atualizar progresso vídeo

#### **Admin (Moderação)**

✅ `POST /api/admin/comentarios/moderar` - Aprovar/rejeitar comentário  
✅ `POST /api/admin/materiais` - Upload de materiais extras

### Validações Por Plano

| Endpoint                              | FREE       | BÁSICO     | PREMIUM   |
| ------------------------------------- | ---------- | ---------- | --------- |
| `POST /api/cadernos`                  | Max 2      | Max 10     | Ilimitado |
| `GET /api/questoes/[id]/comentarios`  | 🔒 Paywall | ✅ Sim     | ✅ Sim    |
| `POST /api/questoes/[id]/comentarios` | 🔒 Paywall | 🔒 Paywall | ✅ Sim    |
| `GET /api/questoes/[id]/materiais`    | 🔒 Paywall | 🔒 Paywall | ✅ Sim    |
| `POST /api/questoes/[id]/responder`   | Max 5/dia  | Ilimitado  | Ilimitado |

### Paywalls

Todos endpoints retornam **HTTP 403** com estrutura:

```json
{
  "error": "Funcionalidade exclusiva",
  "paywall": {
    "feature": "nome_feature",
    "planoMinimo": "basic" | "premium",
    "preco": 39.90 | 79.90,
    "beneficios": ["Benefício 1", "Benefício 2"],
    "cta": "Assine e desbloqueie!"
  }
}
```

---

**Fim do arquivo `06-API-ENDPOINTS.md` v2.0** 🎯
