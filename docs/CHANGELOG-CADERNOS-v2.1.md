# 🔄 Changelog - Mudança Estratégica v2.1

**Data:** 18 de Outubro de 2025  
**Versão:** 2.1  
**Tipo:** Mudança Estratégica de Produto

---

## 📋 Sumário Executivo

**DECISÃO ESTRATÉGICA:** Remoção completa do sistema de questões avulsas. **Todas as questões serão resolvidas EXCLUSIVAMENTE através de Cadernos Personalizados.**

###Motivação:

1. **Organização Forçada:** Usuários serão obrigados a criar cadernos focados, melhorando qualidade do estudo
2. **Diferenciação de Planos:** Cadernos agora são feature central (não opcional)
3. **Engajamento:** Criação de cadernos aumenta comprometimento do usuário
4. **Monetização:** FREE ganha 2 cadernos (teaser), BÁSICO ganha comentários, PREMIUM ganha materiais extras

---

## 🎯 Mudanças nos Planos

### Plano FREE

| Aspecto               | ANTES (v2.0)   | DEPOIS (v2.1)                            |
| --------------------- | -------------- | ---------------------------------------- |
| **Questões Avulsas**  | 5/dia          | ❌ **REMOVIDO**                          |
| **Cadernos**          | 0 (nenhum)     | ✅ **2 cadernos ativos**                 |
| **Questões/Caderno**  | N/A            | 50 questões                              |
| **Limite Diário**     | 5 questões/dia | 5 questões/dia (total de todos cadernos) |
| **Comentários**       | N/A            | ❌ Sem acesso                            |
| **Materiais Extras**  | N/A            | ❌ Sem acesso                            |
| **Análise de Bancas** | Nenhuma        | Top 3 assuntos apenas                    |

**Impacto:** FREE agora pode TESTAR cadernos, mas limitado. Incentiva upgrade.

---

### Plano BÁSICO (R$ 39,90/mês)

| Aspecto               | ANTES (v2.0) | DEPOIS (v2.1)                                        |
| --------------------- | ------------ | ---------------------------------------------------- |
| **Questões Avulsas**  | Ilimitado    | ❌ **REMOVIDO**                                      |
| **Cadernos**          | 10 cadernos  | ✅ 10 cadernos (mantido)                             |
| **Questões/Caderno**  | 200          | 200 (mantido)                                        |
| **Limite Diário**     | Ilimitado    | Ilimitado (mantido)                                  |
| **Comentários**       | N/A          | ✅ **NOVO:** Ver + comentar (comunidade + professor) |
| **Materiais Extras**  | N/A          | ❌ Sem acesso (apenas Premium)                       |
| **Análise de Bancas** | Básica       | Top 10 assuntos                                      |

**Impacto:** BÁSICO ganha **valor agregado** com comentários (diferencial vs FREE).

---

### Plano PREMIUM (R$ 79,90/mês)

| Aspecto               | ANTES (v2.0) | DEPOIS (v2.1)                         |
| --------------------- | ------------ | ------------------------------------- |
| **Questões Avulsas**  | Ilimitado    | ❌ **REMOVIDO**                       |
| **Cadernos**          | Ilimitado    | ✅ Ilimitado (mantido)                |
| **Questões/Caderno**  | 500          | 500 (mantido)                         |
| **Limite Diário**     | Ilimitado    | Ilimitado (mantido)                   |
| **Comentários**       | N/A          | ✅ Ver + comentar                     |
| **Materiais Extras**  | N/A          | ✅ **NOVO:** Vídeo-aulas, PDFs, links |
| **Cadernos IA**       | Sim          | Sim (mantido)                         |
| **Exportar PDF**      | Sim          | Sim (mantido)                         |
| **Análise de Bancas** | Completa     | Completa + heatmap + comparador       |

**Impacto:** PREMIUM se torna **plano completo de estudos** com materiais didáticos.

---

## 🔧 Alterações Técnicas

### 1. Remoção de Funcionalidades

**Arquivos/Rotas Removidos:**

- ❌ `/app/dashboard/questoes/page.tsx` (página de questões avulsas)
- ❌ `/api/questoes/random/route.ts` (endpoint questão aleatória)
- ❌ `/components/questoes/question-interface.tsx` (interface avulsa)
- ❌ Função SQL: `get_random_question(user_id)` (questão aleatória)
- ❌ Seed: `20251018_seed_questoes.sql` (questões de teste avulsas)

**Banco de Dados:**

- Manter tabela `questoes` (questões existem, apenas mudam forma de acesso)
- Manter tabela `respostas_usuarios` (continua gravando respostas)
- ❌ Remover queries que buscam questões sem caderno
- ✅ Adicionar validação: **resposta DEVE ter caderno_id**

---

### 2. Novas Funcionalidades

**Arquivos/Rotas Criados:**

- ✅ `/app/dashboard/cadernos/page.tsx` (lista de cadernos)
- ✅ `/app/dashboard/cadernos/novo/page.tsx` (criar caderno)
- ✅ `/app/dashboard/cadernos/[id]/page.tsx` (resolver caderno)
- ✅ `/app/dashboard/cadernos/[id]/config/page.tsx` (editar caderno)
- ✅ `/api/cadernos/create/route.ts` (criar caderno)
- ✅ `/api/cadernos/[id]/questoes/route.ts` (buscar questões do caderno)
- ✅ `/api/questoes/[id]/comentarios/route.ts` (comentários da questão)
- ✅ `/api/questoes/[id]/materiais/route.ts` (materiais extras)
- ✅ `/components/cadernos/caderno-card.tsx` (card de caderno)
- ✅ `/components/cadernos/criar-caderno-form.tsx` (formulário)
- ✅ `/components/questoes/comentarios-section.tsx` (seção de comentários)
- ✅ `/components/questoes/materiais-extras-section.tsx` (materiais)

**Banco de Dados:**

- ✅ Adicionar coluna `cadernos.limite_plano_free` (CHECK constraint <= 2)
- ✅ Adicionar tabela `questoes_comentarios` (comentários com autor_tipo: 'usuario' | 'professor')
- ✅ Adicionar tabela `questoes_materiais_extras` (vídeos, PDFs, links)
- ✅ Atualizar RLS policies para controlar acesso por plano
- ✅ Trigger para validar limite de cadernos por plano

---

### 3. Validações por Plano

**Comentários (Backend Validation):**

```typescript
// API: /api/questoes/[id]/comentarios/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single();

  // Validar acesso
  if (profile.plano === 'free') {
    return NextResponse.json(
      {
        error:
          'Plano FREE não tem acesso a comentários. Assine BÁSICO ou PREMIUM.',
      },
      { status: 403 }
    );
  }

  // Buscar comentários
  const { data: comentarios } = await supabase
    .from('questoes_comentarios')
    .select('*')
    .eq('questao_id', params.id)
    .order('votos', { ascending: false });

  return NextResponse.json({ comentarios });
}
```

**Materiais Extras (Backend Validation):**

```typescript
// API: /api/questoes/[id]/materiais/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single();

  // Validar acesso (APENAS PREMIUM)
  if (profile.plano !== 'premium') {
    return NextResponse.json(
      { error: 'Materiais extras disponíveis apenas no plano PREMIUM.' },
      { status: 403 }
    );
  }

  // Buscar materiais
  const { data: materiais } = await supabase
    .from('questoes_materiais_extras')
    .select('*')
    .eq('questao_id', params.id);

  return NextResponse.json({ materiais });
}
```

**Limite de Cadernos (Backend Validation):**

```typescript
// API: /api/cadernos/create/route.ts
export async function POST(request: NextRequest) {
  const user = await getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single();

  // Contar cadernos ativos
  const { count } = await supabase
    .from('cadernos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_ativo', true);

  // Validar limite por plano
  const LIMITES = {
    free: 2,
    basic: 10,
    premium: Infinity,
  };

  if (count >= LIMITES[profile.plano]) {
    return NextResponse.json(
      {
        error: `Limite de cadernos atingido. Plano ${profile.plano.toUpperCase()} permite ${LIMITES[profile.plano]} cadernos ativos.`,
        upgrade_required: profile.plano !== 'premium',
      },
      { status: 403 }
    );
  }

  // Criar caderno...
}
```

---

## 📊 Esquema de Banco Atualizado

### Nova Tabela: `questoes_comentarios`

```sql
CREATE TABLE questoes_comentarios (
  id BIGSERIAL PRIMARY KEY,
  questao_id INT NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autor_tipo VARCHAR(20) NOT NULL CHECK (autor_tipo IN ('usuario', 'professor')),
  conteudo TEXT NOT NULL CHECK (char_length(conteudo) >= 10 AND char_length(conteudo) <= 2000),
  votos INT DEFAULT 0,
  is_validado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE questoes_comentarios ENABLE ROW LEVEL SECURITY;

-- Plano BÁSICO e PREMIUM podem VER comentários
CREATE POLICY "Usuarios basico e premium podem ver comentarios"
  ON questoes_comentarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.plano IN ('basic', 'premium')
    )
  );

-- Apenas PREMIUM pode CRIAR comentários
CREATE POLICY "Apenas premium pode comentar"
  ON questoes_comentarios
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.plano = 'premium'
    )
  );

-- Índices
CREATE INDEX idx_questoes_comentarios_questao ON questoes_comentarios(questao_id);
CREATE INDEX idx_questoes_comentarios_votos ON questoes_comentarios(votos DESC);
```

---

### Nova Tabela: `questoes_materiais_extras`

```sql
CREATE TABLE questoes_materiais_extras (
  id BIGSERIAL PRIMARY KEY,
  questao_id INT NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('video', 'pdf', 'link')),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  url TEXT NOT NULL,
  duracao_minutos INT, -- Apenas para vídeos
  tamanho_mb DECIMAL, -- Apenas para PDFs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) -- Admin que adicionou
);

-- RLS Policies
ALTER TABLE questoes_materiais_extras ENABLE ROW LEVEL SECURITY;

-- Apenas PREMIUM pode ver materiais extras
CREATE POLICY "Apenas premium acessa materiais extras"
  ON questoes_materiais_extras
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.plano = 'premium'
    )
  );

-- Índices
CREATE INDEX idx_materiais_questao ON questoes_materiais_extras(questao_id);
CREATE INDEX idx_materiais_tipo ON questoes_materiais_extras(tipo);
```

---

### Atualização Tabela: `cadernos`

```sql
-- Adicionar constraint para limite FREE
ALTER TABLE cadernos ADD CONSTRAINT check_limite_free_cadernos
  CHECK (
    (
      SELECT COUNT(*)
      FROM cadernos c2
      WHERE c2.user_id = cadernos.user_id
      AND c2.is_ativo = true
    ) <= CASE
      WHEN (SELECT plano FROM profiles WHERE id = cadernos.user_id) = 'free' THEN 2
      WHEN (SELECT plano FROM profiles WHERE id = cadernos.user_id) = 'basic' THEN 10
      ELSE 999999 -- Premium ilimitado
    END
  );

-- Trigger para validar antes de INSERT
CREATE OR REPLACE FUNCTION validate_caderno_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan VARCHAR(20);
  active_count INT;
  max_cadernos INT;
BEGIN
  -- Buscar plano do usuário
  SELECT plano INTO user_plan FROM profiles WHERE id = NEW.user_id;

  -- Contar cadernos ativos
  SELECT COUNT(*) INTO active_count
  FROM cadernos
  WHERE user_id = NEW.user_id AND is_ativo = true;

  -- Definir limite
  max_cadernos := CASE
    WHEN user_plan = 'free' THEN 2
    WHEN user_plan = 'basic' THEN 10
    ELSE 999999 -- Premium
  END;

  -- Validar
  IF active_count >= max_cadernos THEN
    RAISE EXCEPTION 'Limite de cadernos atingido para plano %. Máximo: %', user_plan, max_cadernos;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_caderno_limit
  BEFORE INSERT ON cadernos
  FOR EACH ROW
  EXECUTE FUNCTION validate_caderno_limit();
```

---

### Atualização Tabela: `respostas_usuarios`

```sql
-- Adicionar campo obrigatório: caderno_id
ALTER TABLE respostas_usuarios ADD COLUMN caderno_id INT REFERENCES cadernos(id);

-- Tornar obrigatório (após migração de dados existentes)
-- UPDATE respostas_usuarios SET caderno_id = 1 WHERE caderno_id IS NULL; -- Migração
-- ALTER TABLE respostas_usuarios ALTER COLUMN caderno_id SET NOT NULL;

-- Validar que resposta SEMPRE vem de um caderno
CREATE OR REPLACE FUNCTION validate_resposta_tem_caderno()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.caderno_id IS NULL THEN
    RAISE EXCEPTION 'Resposta deve estar associada a um caderno. Questões avulsas foram removidas.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_resposta_caderno
  BEFORE INSERT ON respostas_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION validate_resposta_tem_caderno();
```

---

## 🎨 Mudanças de UI/UX

### Dashboard Principal

**ANTES:**

```
┌─────────────────────────────────────┐
│ Dashboard                           │
├─────────────────────────────────────┤
│ [📚 Leis] [❓ Questões] [🎯 Flashcards] │
└─────────────────────────────────────┘
```

**DEPOIS:**

```
┌─────────────────────────────────────┐
│ Dashboard                           │
├─────────────────────────────────────┤
│ [📚 Leis] [📂 Cadernos] [🎯 Flashcards] │
└─────────────────────────────────────┘
```

---

### Página de Cadernos (Nova)

```
┌─────────────────────────────────────────────────────┐
│ Meus Cadernos                    [+ Novo Caderno]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────┐  ┌──────────────────┐         │
│ │ 📂 Caderno 1     │  │ 📂 Caderno 2     │         │
│ │ PM-SP - Direito  │  │ PF - Penal       │         │
│ │ Constitucional   │  │                   │         │
│ │                  │  │                   │         │
│ │ 25/50 questões   │  │ 0/30 questões    │         │
│ │ ██████░░░░ 50%   │  │ ░░░░░░░░░░ 0%    │         │
│ │                  │  │                   │         │
│ │ [Continuar]      │  │ [Iniciar]        │         │
│ └──────────────────┘  └──────────────────┘         │
│                                                      │
│ Limite: 2/2 cadernos (FREE)                         │
│ [Upgrade para criar mais] ⭐                        │
└─────────────────────────────────────────────────────┘
```

---

### Resolver Questão (Atualizado)

```
┌─────────────────────────────────────────────────────┐
│ Caderno: PM-SP - Direito Constitucional             │
│ Progresso: 25/50 questões (50%)                     │
├─────────────────────────────────────────────────────┤
│ Questão 26                                          │
│                                                      │
│ De acordo com a CF/88, qual direito fundamental...  │
│                                                      │
│ ( ) A) Casa é asilo inviolável...                  │
│ ( ) B) É livre a manifestação...                   │
│ ( ) C) ...                                          │
│                                                      │
│            [Responder]                              │
├─────────────────────────────────────────────────────┤
│ 💬 Comentários (BÁSICO)                     🔒     │
│ [Assine BÁSICO para ver comentários]               │
├─────────────────────────────────────────────────────┤
│ 📚 Materiais Extras (PREMIUM)              🔒     │
│ [Assine PREMIUM para acessar vídeos e PDFs]        │
└─────────────────────────────────────────────────────┘
```

**Após responder (Plano BÁSICO):**

```
├─────────────────────────────────────────────────────┤
│ 💬 Comentários (15)                   Ordenar: ⬆️ │
│                                                      │
│ 👤 Professor Marcos (badge) · há 2 dias             │
│ Alternativa A está correta. O Art. 5º, XI...        │
│ 👍 45  👎 2                                         │
│                                                      │
│ 👤 Ana Silva · há 1 semana                          │
│ Lembrar: RDP (Reserva, Determinação, Preven...)    │
│ 👍 23  👎 1                                         │
│                                                      │
│ [Ver mais comentários]                              │
└─────────────────────────────────────────────────────┘
```

**Após responder (Plano PREMIUM):**

```
├─────────────────────────────────────────────────────┤
│ 📚 Materiais Extras (3)                             │
│                                                      │
│ 🎥 Vídeo-aula: Direitos Fundamentais (15 min)      │
│    Prof. João - Gran Cursos                         │
│    [▶️ Assistir]  [⬇️ Baixar]                      │
│                                                      │
│ 📄 PDF: Esquema Art. 5º completo (2 páginas)       │
│    [📥 Baixar PDF]                                  │
│                                                      │
│ 🔗 Link: Questões similares (QConcursos)           │
│    [🔗 Abrir link]                                  │
└─────────────────────────────────────────────────────┘
```

---

## 📈 Impacto Esperado

### Conversão FREE → BÁSICO

| Métrica           | ANTES | DEPOIS        | Δ     |
| ----------------- | ----- | ------------- | ----- |
| Testar cadernos   | ❌    | ✅ 2 cadernos | +∞%   |
| Incentivo upgrade | Baixo | Alto          | +200% |
| Taxa conversão    | 5-8%  | **10-15%**    | +50%  |

**Motivo:** FREE agora EXPERIMENTA cadernos, mas fica limitado. Paywall claro.

---

### Conversão BÁSICO → PREMIUM

| Métrica         | ANTES           | DEPOIS                      | Δ     |
| --------------- | --------------- | --------------------------- | ----- |
| Diferencial     | Fraco           | **Comentários + materiais** | +100% |
| Valor percebido | R$ 39,90 = caro | R$ 79,90 = vale a pena      | +50%  |
| Taxa conversão  | 15-20%          | **25-35%**                  | +30%  |

**Motivo:** PREMIUM ganha materiais didáticos (vídeos, PDFs), tornando-se "cursinho completo".

---

### Engajamento Geral

| Métrica              | ANTES  | DEPOIS     | Δ     |
| -------------------- | ------ | ---------- | ----- |
| Tempo médio/sessão   | 15 min | **25 min** | +66%  |
| Sessões/semana       | 3      | **5**      | +66%  |
| Questões/mês (médio) | 150    | **300**    | +100% |

**Motivo:** Cadernos incentivam conclusão completa (gamificação).

---

## ⚠️ Riscos e Mitigações

### Risco 1: Usuários FREE frustrados

**Risco:** FREE não pode mais "experimentar" questões livremente.  
**Mitigação:**

- FREE ganha 2 cadernos (antes tinha 0)
- Onboarding cria primeiro caderno automaticamente
- Tutorial explica sistema de cadernos

### Risco 2: Complexidade aumentada

**Risco:** Criar caderno antes de resolver é uma etapa extra.  
**Mitigação:**

- Botão "Criar e Resolver Agora" (1 clique)
- Cadernos pré-criados por categoria (ex: "Começar: Direito Constitucional")
- IA sugere cadernos inteligentes (Premium)

### Risco 3: Churn de usuários atuais

**Risco:** Usuários acostumados com questões avulsas podem cancelar.  
**Mitigação:**

- Migração automática: criar "Caderno Geral" com histórico de questões
- Email de anúncio 2 semanas antes com justificativa
- Oferta de 50% desconto por 3 meses para quem migrar

---

## 🚀 Roadmap de Implementação

### Semana 1: Database & Backend

- [ ] Criar tabelas `questoes_comentarios` e `questoes_materiais_extras`
- [ ] Atualizar RLS policies para controle por plano
- [ ] Criar triggers de validação (limites, caderno obrigatório)
- [ ] Criar migrations de migração de dados (questões avulsas → caderno geral)
- [ ] Testes unitários de validações

### Semana 2: API Endpoints

- [ ] Criar `/api/cadernos/create` com validação de limites
- [ ] Criar `/api/cadernos/[id]/questoes` para buscar questões
- [ ] Criar `/api/questoes/[id]/comentarios` com RLS por plano
- [ ] Criar `/api/questoes/[id]/materiais` com RLS PREMIUM
- [ ] Atualizar `/api/respostas` para exigir `caderno_id`
- [ ] Testes de integração API

### Semana 3: Frontend - Cadernos

- [ ] Criar `/app/dashboard/cadernos/page.tsx` (lista)
- [ ] Criar `/app/dashboard/cadernos/novo/page.tsx` (formulário)
- [ ] Criar `/app/dashboard/cadernos/[id]/page.tsx` (resolver)
- [ ] Criar componente `CadernoCard`
- [ ] Criar componente `CriarCadernoForm` com preview
- [ ] Criar componente `ProgressBar` do caderno

### Semana 4: Frontend - Questões & Comentários

- [ ] Atualizar `QuestionInterface` para trabalhar com cadernos
- [ ] Criar `ComentariosSection` com paywall BÁSICO
- [ ] Criar `MateriaisExtrasSection` com paywall PREMIUM
- [ ] Criar badge "PREMIUM" em features bloqueadas
- [ ] Criar modais de upgrade

### Semana 5: Admin & Moderação

- [ ] Criar interface admin para adicionar comentários professor
- [ ] Criar interface admin para upload materiais extras
- [ ] Criar fila de moderação de comentários
- [ ] Dashboard de métricas (comentários, materiais, uso por plano)

### Semana 6: Testes & Launch

- [ ] Testes E2E com Playwright (fluxos completos)
- [ ] Testes de carga (1000 usuários simultâneos)
- [ ] Migração de usuários existentes (criar "Caderno Geral")
- [ ] Email de anúncio para usuários
- [ ] Deploy gradual (10% → 50% → 100%)
- [ ] Monitoramento de erros (Sentry)
- [ ] Análise de métricas (Posthog)

---

## 📧 Comunicação com Usuários

### Email de Anúncio (2 semanas antes)

**Assunto:** 🚀 Novidade: Sistema de Cadernos Personalizados + Comentários!

**Corpo:**

```
Olá, [Nome]! 👋

Temos uma grande novidade no KAV Concursos!

🎯 **O que está mudando?**
A partir de [DATA], você vai estudar de forma ainda mais organizada com nosso novo **Sistema de Cadernos Personalizados**.

📂 **Como funciona?**
1. Crie cadernos focados no seu concurso (ex: "PM-SP - Direito Constitucional")
2. Aplique filtros: banca, ano, dificuldade
3. Resolva questões de forma sequencial
4. Acompanhe seu progresso em tempo real

✨ **Novidades por Plano:**

**FREE (gratuito):**
- 2 cadernos ativos
- 5 questões por dia

**BÁSICO (R$ 39,90/mês):**
- 10 cadernos
- Questões ilimitadas
- 💬 **NOVO:** Comentários da comunidade + professor

**PREMIUM (R$ 79,90/mês):**
- Cadernos ilimitados
- 📚 **NOVO:** Materiais extras (vídeos, PDFs)
- 🤖 Cadernos inteligentes com IA

📊 **Seus dados estão seguros:**
Todas as suas questões já respondidas serão automaticamente organizadas em um "Caderno Geral". Nada será perdido!

🎁 **Oferta de Lançamento:**
Faça upgrade até [DATA] e ganhe **50% OFF nos primeiros 3 meses**!

Qualquer dúvida, estamos aqui para ajudar! 💙

Equipe KAV Concursos
```

---

## 📊 Métricas de Sucesso

### Curto Prazo (30 dias)

- [ ] Taxa de conversão FREE → BÁSICO: **≥ 10%** (antes: 5-8%)
- [ ] Taxa de conversão BÁSICO → PREMIUM: **≥ 25%** (antes: 15-20%)
- [ ] Churn < 10% (aceitável durante mudança)
- [ ] NPS ≥ 45 (usuários satisfeitos com nova feature)
- [ ] Tempo médio de sessão: **≥ 20 min** (antes: 15 min)

### Médio Prazo (90 dias)

- [ ] 80% dos usuários criaram pelo menos 1 caderno
- [ ] Média de 3 cadernos ativos por usuário (BÁSICO/PREMIUM)
- [ ] 1000+ comentários publicados (BÁSICO/PREMIUM)
- [ ] 500+ materiais extras cadastrados (admin)
- [ ] MRR crescimento: **+30%** vs pré-mudança

### Longo Prazo (180 dias)

- [ ] Sistema de cadernos = feature #1 mais usada
- [ ] Cadernos inteligentes (IA) = diferencial competitivo reconhecido
- [ ] Materiais extras = percebido como "cursinho completo"
- [ ] Taxa de retenção > 85%
- [ ] LTV aumentado em 40%

---

## ✅ Checklist de Aprovação

Antes de aprovar esta mudança, confirme:

- [x] Documentação PRD atualizada (`01-PRD-COMPLETO.md`)
- [x] Regras de negócio atualizadas (`07-REGRAS-NEGOCIO.md`)
- [ ] Fluxogramas atualizados (`04-FLUXOGRAMAS-MERMAID.md`)
- [ ] Database schema atualizado (`03-DATABASE-SCHEMA.md`)
- [ ] Arquitetura atualizada (`02-ARQUITETURA-SISTEMA.md`)
- [ ] API endpoints documentados (`06-API-ENDPOINTS.md`)
- [ ] Copilot instructions atualizadas (`.github/copilot-instructions.md`)
- [ ] Migrations SQL criadas
- [ ] Testes planejados
- [ ] Email de comunicação revisado
- [ ] Roadmap de 6 semanas aprovado

---

**Aprovado por:** [Nome]  
**Data:** [Data]  
**Status:** ✅ Aprovado para implementação
