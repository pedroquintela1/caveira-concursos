# 📖 Proposta Completa: Feature "Estudo da Lei Seca"

**Data:** 01/11/2025
**Status:** Proposta para aprovação
**Prioridade:** 🔴 ALTA (Core do produto)

---

## 📊 Executive Summary

### Situação Atual
- ✅ **Documentação completa** existe (PRD, Arquitetura, Schema DB)
- ❌ **0% implementado** (sem tabelas, sem frontend, sem API)
- ⚠️ **Sidebar tem item "Leis"** mas retorna 404

### O que é "Lei Seca"?
**Lei Seca** = texto literal da legislação brasileira estudado sem interpretações doutrinárias. É o **CORE VALUE** da plataforma KAV Concursos.

### Proposta
Implementar módulo completo de estudo de leis com:
- 📚 Biblioteca de legislações (CF/88, CP, CPP, etc.)
- 📝 Navegação por artigos com índice hierárquico
- ✅ Sistema de progresso (marcar artigos como "estudados")
- ⭐ Favoritos + notas pessoais
- 🔗 Integração com questões, mnemônicos e flashcards

---

## 🎯 Objetivos da Feature

### Objetivo Principal
**Permitir que usuários estudem legislações de forma estruturada, progressiva e integrada com outras ferramentas de estudo (questões, mnemônicos, flashcards).**

### Objetivos Secundários
1. **Diferenciação competitiva:** Nenhum concorrente tem legislação formatada + integrada
2. **Retenção:** Sistema de progresso cria hábito de estudo diário
3. **Monetização:** Paywall em 50 artigos para FREE (CF/88 tem 250 artigos)
4. **Engajamento:** Integração com sistema de pontos e gamificação

---

## 🎨 UX/UI Design

### 1. Página Principal: `/dashboard/leis`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Estudo da Lei Seca                                         │
│  Domine a legislação literal para concursos públicos        │
├─────────────────────────────────────────────────────────────┤
│  [🔍 Buscar leis...]                      [Filtros ▾]       │
├─────────────────────────────────────────────────────────────┤
│  📊 Seu Progresso                                           │
│  ┌───────────┬───────────┬───────────┐                     │
│  │ 3 Leis    │ 127/500   │ 25%       │                     │
│  │ Estudando │ Artigos   │ Completo  │                     │
│  └───────────┴───────────┴───────────┘                     │
├─────────────────────────────────────────────────────────────┤
│  🏆 Leis Mais Cobradas                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📘 Constituição Federal de 1988 (CF/88)             │   │
│  │    250 artigos • Direito Constitucional             │   │
│  │    ━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░ 45/250 (18%)     │   │
│  │    [📖 Continuar Estudando] [⭐ Ver Favoritos]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📕 Código Penal (CP) - Decreto-Lei 2.848/1940       │   │
│  │    361 artigos • Direito Penal                      │   │
│  │    ━━━━━━━━━━━━━━━━━━░░░░░░░░░░░ 180/361 (50%)     │   │
│  │    [📖 Continuar Estudando] [⭐ Ver Favoritos]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📗 Código de Processo Penal (CPP)                   │   │
│  │    811 artigos • Direito Processual Penal           │   │
│  │    ━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 15/811 (2%)    │   │
│  │    [📖 Iniciar Estudo] [🔒 BASIC+]                  │   │
│  │    └─ Desbloqueie com BASIC para ver todos artigos │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**
- `<LeiCard>` - Card de cada lei com progress bar
- `<ProgressStats>` - Cards de estatísticas do usuário
- `<SearchBar>` - Busca por nome ou sigla
- `<FilterDropdown>` - Filtrar por disciplina

---

### 2. Página de Visualização: `/dashboard/leis/[id]`

**Layout Split Screen:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Voltar  |  Constituição Federal de 1988 (CF/88)  |  45/250 (18%) │
├──────────────────────┬──────────────────────────────────────────────┤
│  ÍNDICE             │  CONTEÚDO DO ARTIGO                          │
│                     │                                              │
│  📂 Título I        │  ┌────────────────────────────────────────┐ │
│    Princípios       │  │ Art. 5º, LXXVIII                       │ │
│    Fundamentais     │  │ ✅ Marcado como estudado               │ │
│    ├─ Art. 1º       │  │                                        │ │
│    ├─ Art. 2º       │  │ A todos, no âmbito judicial e         │ │
│    ├─ Art. 3º       │  │ administrativo, são assegurados a     │ │
│    └─ Art. 4º       │  │ razoável duração do processo e os     │ │
│                     │  │ meios que garantam a celeridade       │ │
│  📂 Título II ▾     │  │ de sua tramitação.                    │ │
│    Direitos Fund.   │  │                                        │ │
│    ├─ Art. 5º ▾     │  │ ────────────────────────────────────  │ │
│      │ I-X         │  │                                        │ │
│      │ XI-XX       │  │ 💡 Mnemônico (42 votos)                │ │
│      │ XXI-XXX     │  │ "DRR - Duração Razoável do pRocesso"  │ │
│      │ ... ►       │  │                                        │ │
│      └ LXXVIII ◄──────┼─ (você está aqui)                     │ │
│    ├─ Art. 6º       │  │                                        │ │
│    └─ Art. 7º       │  │ ────────────────────────────────────  │ │
│                     │  │                                        │ │
│  🔍 Buscar artigo   │  │ [✅ Marcar como Estudado]             │ │
│  ⭐ Meus Favoritos  │  │ [⭐ Adicionar aos Favoritos]          │ │
│                     │  │ [📝 Criar Nota Pessoal]               │ │
│                     │  │ [🃏 Criar Flashcard] [❓ Ver Questões]│ │
│                     │  └────────────────────────────────────────┘ │
└──────────────────────┴──────────────────────────────────────────────┘
```

**Funcionalidades:**
1. **Índice Hierárquico**
   - Expansível/colapsável
   - Scroll suave ao clicar em artigo
   - Destacar artigo atual
   - Badge "Muito Cobrado" em artigos importantes

2. **Visualização do Artigo**
   - Texto formatado (negrito em palavras-chave)
   - Checkbox "Marcar como Estudado" (persiste no banco)
   - Botão Favoritar (estrela)
   - Integração com mnemônicos (mostrar se existir)

3. **Ações Rápidas**
   - Criar flashcard deste artigo
   - Ver questões relacionadas
   - Adicionar nota pessoal (BASIC+)

---

### 3. Paywall para FREE Users

**Comportamento:**
- FREE pode ver primeiros **50 artigos** de cada lei
- Ao tentar acessar artigo 51+, mostrar modal:

```
┌──────────────────────────────────────────────┐
│         🔒 Desbloqueie Todo o Conteúdo       │
│                                              │
│  Você atingiu o limite de 50 artigos         │
│  gratuitos da CF/88.                         │
│                                              │
│  Faça upgrade para BASIC e tenha acesso a:   │
│  ✓ Todas as 15 leis principais               │
│  ✓ Todos os 5.000+ artigos                   │
│  ✓ Notas pessoais ilimitadas                 │
│  ✓ Sistema de favoritos                      │
│                                              │
│  [Ver Planos] [Continuar no FREE]            │
└──────────────────────────────────────────────┘
```

---

## 🔄 Flowchart do Processo

```
┌─────────────┐
│   USUÁRIO   │
│  acessa     │
│ /leis       │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Lista de Leis       │
│ (disciplinas +leis) │
└──────┬──────────────┘
       │
       │ Clica em lei
       ▼
┌──────────────────────────────┐
│ Carregar lei + artigos       │
│ + progresso do usuário       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐      ┌───────────────┐
│ FREE user?                   │──Sim─→│ Limitar a 50  │
│ total_artigos > 50?          │      │ artigos       │
└──────┬───────────────────────┘      └───────────────┘
       │
       │ Não (BASIC/PREMIUM)
       ▼
┌──────────────────────────────┐
│ Exibir lei completa          │
│ - Índice hierárquico         │
│ - Artigos navegáveis         │
└──────┬───────────────────────┘
       │
       │ Usuário interage
       ▼
┌────────────────────────────────────────────┐
│ Ações possíveis:                           │
│ 1. Marcar artigo como "Estudado"           │
│    └─→ INSERT artigos_estudados            │
│        └─→ Recalcular progresso (%)        │
│                                            │
│ 2. Favoritar artigo                        │
│    └─→ INSERT artigos_favoritos            │
│                                            │
│ 3. Criar nota pessoal (BASIC+)             │
│    └─→ INSERT artigos_notas                │
│                                            │
│ 4. Criar flashcard                         │
│    └─→ Redirecionar para /flashcards/novo │
│        (pré-preencher com artigo_id)       │
│                                            │
│ 5. Ver questões relacionadas               │
│    └─→ Query: SELECT * FROM questoes       │
│        WHERE artigo_id = [id]              │
│        └─→ Exibir modal com questões       │
└────────────────────────────────────────────┘
```

---

## 🗄️ Arquitetura do Banco de Dados

### Tabelas Necessárias

#### 1. `disciplinas` (já documentada, precisa criar)
```sql
CREATE TABLE disciplinas (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT,
  icone TEXT,                    -- Nome do ícone Lucide React
  ordem INT DEFAULT 0,
  cor_destaque TEXT DEFAULT '#2563EB',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO disciplinas (nome, slug, icone, ordem) VALUES
  ('Direito Constitucional', 'direito-constitucional', 'Scale', 1),
  ('Direito Penal', 'direito-penal', 'Gavel', 2),
  ('Direito Processual Penal', 'direito-processual-penal', 'FileText', 3),
  ('Direito Administrativo', 'direito-administrativo', 'Building', 4),
  ('Direito Civil', 'direito-civil', 'Users', 5),
  ('Legislação Especial', 'legislacao-especial', 'BookOpen', 6);
```

---

#### 2. `leis` (já documentada, precisa criar)
```sql
CREATE TABLE leis (
  id SERIAL PRIMARY KEY,
  disciplina_id INT NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,

  nome TEXT NOT NULL,                   -- "Constituição Federal de 1988"
  nome_curto TEXT NOT NULL,             -- "CF/88"
  sigla TEXT,                           -- "CF"
  numero_lei TEXT,                      -- "Lei 12.850/2013" (se aplicável)

  ementa TEXT,                          -- Resumo da lei
  data_publicacao DATE,
  link_oficial TEXT,                    -- URL do Planalto

  total_artigos INT DEFAULT 0,
  ordem INT DEFAULT 0,

  is_mais_cobrada BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_leis_disciplina_id ON leis(disciplina_id);
CREATE INDEX idx_leis_sigla ON leis(sigla);

-- RLS
ALTER TABLE leis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active leis"
  ON leis FOR SELECT
  USING (is_active = TRUE);

-- Seed data (MVP)
INSERT INTO leis (disciplina_id, nome, nome_curto, sigla, total_artigos, is_mais_cobrada, ordem) VALUES
  (1, 'Constituição Federal de 1988', 'CF/88', 'CF', 250, TRUE, 1),
  (2, 'Código Penal - Decreto-Lei 2.848/1940', 'Código Penal', 'CP', 361, TRUE, 2),
  (3, 'Código de Processo Penal - Decreto-Lei 3.689/1941', 'CPP', 'CPP', 811, TRUE, 3);
```

---

#### 3. `artigos` (CORE TABLE)
```sql
CREATE TABLE artigos (
  id SERIAL PRIMARY KEY,
  lei_id INT NOT NULL REFERENCES leis(id) ON DELETE CASCADE,

  numero TEXT NOT NULL,                 -- "Art. 121", "Art. 5º, LXXVIII"
  titulo TEXT,                          -- "Homicídio Simples"

  texto_completo TEXT NOT NULL,         -- Texto literal do artigo
  texto_formatado TEXT,                 -- HTML com <strong> em palavras-chave

  capitulo TEXT,                        -- "Título I - Dos Direitos Fundamentais"
  secao TEXT,                           -- "Capítulo II - Dos Direitos Sociais"

  is_muito_cobrado BOOLEAN DEFAULT FALSE,
  peso_edital INT DEFAULT 1 CHECK (peso_edital BETWEEN 1 AND 5),

  ordem INT NOT NULL,                   -- Ordem sequencial dentro da lei
  palavras_chave TEXT[],                -- ['homicídio', 'matar', 'doloso']

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(lei_id, numero)
);

-- Índices para performance
CREATE INDEX idx_artigos_lei_id ON artigos(lei_id);
CREATE INDEX idx_artigos_numero ON artigos(numero);
CREATE INDEX idx_artigos_palavras_chave ON artigos USING GIN(palavras_chave);
CREATE INDEX idx_artigos_texto ON artigos USING GIN(to_tsvector('portuguese', texto_completo));

-- RLS
ALTER TABLE artigos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active artigos"
  ON artigos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM leis WHERE leis.id = artigos.lei_id AND leis.is_active = TRUE
  ));
```

---

#### 4. `artigos_estudados` (NOVA TABELA - Tracking de Progresso)
```sql
CREATE TABLE artigos_estudados (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artigo_id INT NOT NULL REFERENCES artigos(id) ON DELETE CASCADE,
  estudado_em TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, artigo_id)
);

-- Índices
CREATE INDEX idx_artigos_estudados_user_id ON artigos_estudados(user_id);
CREATE INDEX idx_artigos_estudados_artigo_id ON artigos_estudados(artigo_id);

-- RLS
ALTER TABLE artigos_estudados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own artigos_estudados"
  ON artigos_estudados FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own artigos_estudados"
  ON artigos_estudados FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own artigos_estudados"
  ON artigos_estudados FOR DELETE
  USING (auth.uid() = user_id);
```

---

#### 5. `artigos_favoritos` (NOVA TABELA - Sistema de Favoritos)
```sql
CREATE TABLE artigos_favoritos (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artigo_id INT NOT NULL REFERENCES artigos(id) ON DELETE CASCADE,
  favoritado_em TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, artigo_id)
);

-- Índices
CREATE INDEX idx_artigos_favoritos_user_id ON artigos_favoritos(user_id);

-- RLS
ALTER TABLE artigos_favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favoritos"
  ON artigos_favoritos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

#### 6. `artigos_notas` (NOVA TABELA - Notas Pessoais BASIC+)
```sql
CREATE TABLE artigos_notas (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artigo_id INT NOT NULL REFERENCES artigos(id) ON DELETE CASCADE,

  conteudo TEXT NOT NULL CHECK (char_length(conteudo) >= 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, artigo_id)
);

-- Índices
CREATE INDEX idx_artigos_notas_user_id ON artigos_notas(user_id);
CREATE INDEX idx_artigos_notas_artigo_id ON artigos_notas(artigo_id);

-- RLS
ALTER TABLE artigos_notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notas"
  ON artigos_notas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### Queries de Exemplo

#### Listar leis com progresso do usuário
```sql
SELECT
  l.id,
  l.nome,
  l.nome_curto,
  l.total_artigos,
  COUNT(DISTINCT ae.artigo_id) as artigos_estudados,
  ROUND((COUNT(DISTINCT ae.artigo_id)::NUMERIC / l.total_artigos) * 100, 1) as progresso_percentual
FROM leis l
LEFT JOIN artigos a ON a.lei_id = l.id
LEFT JOIN artigos_estudados ae ON ae.artigo_id = a.id AND ae.user_id = $1
WHERE l.is_active = TRUE
GROUP BY l.id
ORDER BY l.ordem;
```

#### Buscar artigos de uma lei com status de estudado
```sql
SELECT
  a.*,
  EXISTS(
    SELECT 1 FROM artigos_estudados ae
    WHERE ae.artigo_id = a.id AND ae.user_id = $1
  ) as is_estudado,
  EXISTS(
    SELECT 1 FROM artigos_favoritos af
    WHERE af.artigo_id = a.id AND af.user_id = $1
  ) as is_favorito,
  n.conteudo as minha_nota
FROM artigos a
LEFT JOIN artigos_notas n ON n.artigo_id = a.id AND n.user_id = $1
WHERE a.lei_id = $2
ORDER BY a.ordem;
```

---

## 🛤️ Roadmap de Implementação

### Sprint 1: Foundation (Semana 1)
**Objetivo:** Criar estrutura básica do banco + seed data

✅ **Database:**
1. Criar migration `20251101_create_leis_tables.sql`
2. Criar tabelas: `disciplinas`, `leis`, `artigos`
3. Criar tabelas de tracking: `artigos_estudados`, `artigos_favoritos`
4. Seed data: CF/88 (primeiros 10 artigos), CP (primeiros 10 artigos)
5. Testes de queries de progresso

✅ **API:**
1. `GET /api/leis` - Listar leis com progresso
2. `GET /api/leis/[id]` - Ver lei completa + artigos
3. `GET /api/leis/[id]/artigos` - Listar artigos da lei
4. `POST /api/artigos/[id]/marcar-estudado` - Toggle estudado
5. `POST /api/artigos/[id]/favoritar` - Toggle favorito

---

### Sprint 2: Frontend Core (Semana 2)
**Objetivo:** Páginas básicas funcionando

✅ **Páginas:**
1. `/app/dashboard/leis/page.tsx` - Lista de leis
2. `/app/dashboard/leis/[id]/page.tsx` - Visualizador de lei

✅ **Componentes:**
1. `<LeiCard>` - Card com progress bar
2. `<LeiViewer>` - Split screen (índice + conteúdo)
3. `<ArtigoCard>` - Exibição de artigo individual
4. `<IndiceLei>` - Índice hierárquico expansível

✅ **Features:**
- Navegação por índice (scroll suave)
- Marcar/desmarcar como estudado (persiste)
- Progress bar atualiza em tempo real

---

### Sprint 3: Enhanced UX (Semana 3)
**Objetivo:** Funcionalidades premium

✅ **Features:**
1. Sistema de favoritos (estrela)
2. Busca full-text (português)
3. Filtros por disciplina
4. Paywall para FREE (50 artigos)
5. Modal de upgrade

✅ **Integrações:**
1. Link para questões relacionadas
2. Exibir mnemônicos existentes
3. Botão "Criar Flashcard" (pré-preenche)

---

### Sprint 4: Notas Pessoais (Semana 4) - BASIC+
**Objetivo:** Editor de notas

✅ **Features:**
1. Criar tabela `artigos_notas`
2. API: `POST/PUT/DELETE /api/artigos/[id]/notas`
3. Editor de texto rico (Tiptap ou similar)
4. Busca em notas pessoais
5. Export notas para PDF (futuro)

---

### Sprint 5: Conteúdo (Semana 5-6)
**Objetivo:** Popular banco com leis principais

✅ **Seed Data:**
1. **CF/88 completa** (250 artigos)
   - Foco: Art. 1º-5º (Direitos Fundamentais)
2. **CP completo** (361 artigos)
   - Foco: Art. 121-155 (Crimes contra vida)
3. **CPP completo** (811 artigos)
   - Foco: Art. 1-60 (Inquérito policial)

---

### Sprint 6: Polish & Analytics (Semana 7)
**Objetivo:** Analytics e gamificação

✅ **Features:**
1. Dashboard de progresso (gráficos)
2. Heatmap de estudo (streak)
3. Badges por leis concluídas
4. Pontos por artigo estudado

---

## 📈 Métricas de Sucesso

### KPIs da Feature
1. **Engajamento:**
   - % de usuários que acessam Lei Seca > 50%
   - Tempo médio na página > 5min
   - Artigos estudados/dia > 10

2. **Conversão:**
   - FREE → BASIC por paywall Lei Seca > 15%
   - Usuários com >50 artigos estudados → 80% retention

3. **Retenção:**
   - D7 retention de usuários que marcaram ≥10 artigos > 60%
   - D30 retention > 40%

---

## 💰 Business Rules

### Limites por Plano
```typescript
const LEI_SECA_LIMITS = {
  free: {
    leis_disponiveis: 3,        // CF/88, CP, CPP (parciais)
    artigos_por_lei: 50,        // Primeiros 50 artigos
    criar_notas: false,
    ver_artigos_completos: false, // Truncar artigos longos
  },
  basic: {
    leis_disponiveis: 15,       // Todas as principais
    artigos_por_lei: Infinity,
    criar_notas: true,          // ✅
    ver_artigos_completos: true,
  },
  premium: {
    leis_disponiveis: Infinity,
    artigos_por_lei: Infinity,
    criar_notas: true,
    audio_narrado: true,        // TTS (futuro)
    export_pdf: true,           // Export notas (futuro)
  },
};
```

---

## 🚀 Próximos Passos Imediatos

### Aprovação Necessária
- [ ] Aprovar UX/UI proposto
- [ ] Aprovar flowchart de navegação
- [ ] Aprovar schema do banco de dados
- [ ] Priorizar sprints (1-4 ou completo?)

### Após Aprovação
1. Criar migration completa
2. Aplicar no banco Supabase
3. Seed data CF/88 (primeiros 10 artigos)
4. Implementar Sprint 1 (Foundation)

---

**Aguardando feedback para prosseguir com implementação! 🚀**
