# 🔍 Insights de Mercado: Estudo de Lei Seca para Concursos

**Data:** 02/11/2025
**Fonte:** Pesquisa em plataformas concorrentes

---

## 📊 Plataformas Analisadas

### 1. **Juspodivm - Vade Mecum Amarelinho** (Líder de Mercado)
**Formato:** Material impresso + digital
**Posicionamento:** "Caderno de Estudos da Lei Seca para Concursos Públicos"

**Funcionalidades Principais:**
- ✅ **Índices como checklists** - Marcar artigos estudados
- ⭐ **Artigos mais cobrados destacados** - Badge visual
- 📝 **Espaços para anotações** - Margem larga
- 🔤 **Fonte maior** - Leitura confortável
- 📚 **Jurisprudência relacionada** - Transcrita junto ao artigo
- 🔄 **Atualizado semestralmente** (2025.1, 2025.2)

**Diferencial:**
> "Índices transformados em checklists onde você pode marcar o conteúdo revisado e quantas questões fez sobre o tema"

---

### 2. **Decorando a Lei Seca**
**Formato:** Plataforma digital
**Posicionamento:** "Estude a Legislação de maneira otimizada"

**Funcionalidades Principais:**
- 🗺️ **Mapas mentais** - Foco em pontos principais
- 📅 **Cronogramas de leitura diária** - Adaptado à rotina
- ❓ **+85 mil assertivas** - Questões vinculadas às leis
- 🏛️ **Questões por banca** - FGV, Cebraspe, Vunesp, FCC
- 📖 **Vade Mecum de Questões** - Questões extraídas de provas

**Diferencial:**
> Sistema de cronogramas diários para adaptar estudo de lei à rotina do candidato

---

### 3. **Gran Cursos Online - Leis Secas e Comentadas**
**Formato:** Plataforma digital (vídeos + PDFs)
**Posicionamento:** "Otimize o seu estudo de leis"

**Funcionalidades Principais:**
- 🎥 **Artigo por artigo** - Comentários em vídeo com professores
- 🎨 **Marcações em cores** - Destaques de pontos importantes
- ⭐ **Sistema de estrelas** - Relevância (baixa/média/alta) baseada em provas
- 📄 **"Lei em Questão"** - PDF + vídeo de análise
- 📖 **Gran Vade Mecum** - Formatação amigável

**Diferencial:**
> "Ferramenta que permite ter acesso a breves comentários de professores sobre as diferentes disposições legais essenciais, artigo por artigo"

**Sistema de Relevância:**
- ⭐ 1-2 estrelas: Baixa incidência em provas
- ⭐⭐⭐ 3 estrelas: Média incidência
- ⭐⭐⭐⭐⭐ 4-5 estrelas: Alta incidência (MUITO COBRADO)

---

### 4. **Estratégia Concursos - Sistema de Questões**
**Formato:** Plataforma digital (questões + PDFs)
**Posicionamento:** "2+ milhões de questões"

**Funcionalidades Principais:**
- 🔍 **Filtro por "Lei Seca/Normas"** - Busca de questões por lei
- 📋 **Busca por artigo específico** - Ex: "Artigo 3º do Código Civil"
- 🏷️ **Classificação múltipla** - Várias matérias por questão
- 📊 **Filtros avançados** - Banca, ano, dificuldade

**Diferencial:**
> Permite filtrar questões exclusivamente sobre um artigo específico (ex: apenas Art. 3º CC)

---

## 🎯 Padrões UX/UI Identificados (Best Practices)

### 1. **Estrutura Hierárquica**
```
Lei
 └─ Título
     └─ Capítulo
         └─ Seção
             └─ Artigo
                 └─ Incisos
                     └─ Alíneas
                         └─ Itens
```

**Implementação recomendada:**
- Índice colapsável (expandir/colapsar)
- Scroll suave ao clicar em artigo
- Breadcrumb no topo (Lei > Título > Capítulo > Art. X)

---

### 2. **Sistema de Marcação (Estudado/Não Estudado)**
**Padrão adotado por TODOS:**
- Checkbox ao lado de cada artigo
- Persiste entre sessões
- Visual claro (✅ verde quando marcado)

**Progress tracking:**
- Barra de progresso geral (% da lei)
- Contador "X/Y artigos estudados"
- Destaque quando completa 100% (badge, confetti)

---

### 3. **Artigos "Muito Cobrados"**
**Gran Cursos:** ⭐⭐⭐⭐⭐ (5 estrelas)
**Juspodivm:** Badge "MAIS COBRADO" (amarelo)
**KAV (nossa abordagem):** 🔥 Badge "Muito Cobrado" + peso_edital (1-5)

**Critério:**
- Análise de incidência em provas anteriores
- Peso definido manualmente (curadoria)
- Atualizado semestralmente

---

### 4. **Integração com Questões**
**Todos fazem isso!**
- Link direto: Artigo → "Ver Questões sobre este artigo"
- Contador: "123 questões sobre este artigo"
- Filtro reverso: Questão → Link para artigo relacionado

**Nossa implementação:**
```typescript
// Já temos questoes.artigo_id no banco!
SELECT COUNT(*) FROM questoes WHERE artigo_id = $1
```

---

### 5. **Sistema de Anotações**
**Juspodivm:** Margens largas no impresso
**Gran/Estratégia:** Editor de texto nas plataformas digitais

**Nossa abordagem:**
- Tabela `artigos_notas` (já planejada)
- Editor rich text (Tiptap)
- **BASIC+ only** (paywall)

---

### 6. **Formatação do Texto Legal**

**Elementos importantes:**
1. **Negrito em palavras-chave** (verbos, prazos, valores)
   - Exemplo: "Matar **alguém**: Pena - reclusão, de **seis a vinte anos**"

2. **Cores para destacar:**
   - 🔴 Vermelho: Proibições, crimes
   - 🟢 Verde: Direitos, garantias
   - 🟡 Amarelo: Prazos, valores

3. **Estrutura visual:**
   - Número do artigo em fonte maior
   - Título do artigo (quando existe)
   - Incisos indentados
   - Alíneas duplamente indentadas

---

## 💡 Insights Estratégicos

### 1. **Modelo Freemium Funciona**
- Gran/Estratégia: Oferecem amostras grátis (primeiros X artigos)
- Juspodivm: Versão impressa (paga) + PDF gratuito (parcial)

**Nossa estratégia:**
- FREE: 50 primeiros artigos de cada lei (suficiente para testar)
- BASIC: Todas as leis completas
- PREMIUM: + Anotações + Audio (TTS)

---

### 2. **Cronograma de Estudos é Muito Valorizado**
"Decorando a Lei Seca" destaca isso como diferencial.

**Oportunidade para KAV:**
- Feature futura: "Plano de Estudos da Lei Seca"
- Sugerir ordem de leitura (artigos mais importantes primeiro)
- Meta diária: "Estudar 10 artigos por dia" → Gamificação

---

### 3. **Vídeo-aulas são Premium**
Gran Cursos cobra separado por "artigo comentado em vídeo"

**Nossa estratégia:**
- MVP: Apenas texto (Lei Seca literal)
- PREMIUM (futuro): TTS (audio do artigo)
- PREMIUM+ (futuro): Vídeo-aulas de professores

---

### 4. **Atualização Frequente é Crítica**
Juspodivm atualiza **semestralmente** (Janeiro e Julho)

**Nossa abordagem:**
- Seed data inicial: Leis estáveis (CF/88, CP, CPP)
- Sistema de versionamento (lei_id + data_vigencia)
- Alertas: "CF/88 atualizada em 01/2025 com EC 132"

---

## 🚀 Diferenciais Competitivos do KAV

### O que NINGUÉM faz (mas vamos fazer):

1. **Integração Total 4-em-1:**
   ```
   Lei Seca ↔ Questões ↔ Mnemônicos ↔ Flashcards
   ```
   - Gran: Lei + Questões
   - Estratégia: Questões + PDFs de lei
   - Juspodivm: Lei impressa (sem integração digital)
   - **KAV: TUDO em um só lugar** ✅

2. **Gamificação de Progresso:**
   - Pontos por artigo estudado
   - Badges: "Mestre da CF/88" (100% estudado)
   - Ranking: "Top 10 estudantes de Lei Seca esta semana"
   - Streak: "7 dias consecutivos estudando legislação"

3. **Mnemônicos Comunitários:**
   - Usuários criam + votam em mnemônicos
   - Moderadores validam os melhores
   - Exibidos inline no artigo
   - **Ninguém faz isso digitalmente!**

4. **Smart Recommendations:**
   - "Você errou questões sobre Art. 121 CP → Revisar artigo"
   - "Artigos similares ao que você está estudando"
   - "Próximo artigo recomendado: Art. 5º, LXXIX (relacionado)"

---

## 📋 Checklist de Implementação (Baseado nos Insights)

### Must-Have (MVP - Sprint 1-2)
- [x] Estrutura hierárquica (Título > Capítulo > Artigo)
- [ ] Índice expansível/colapsável
- [ ] Checkbox "Marcar como Estudado"
- [ ] Progress bar (X/Y artigos - Z%)
- [ ] Badge "🔥 Muito Cobrado" em artigos importantes
- [ ] Formatação de texto (negrito em keywords)
- [ ] Link para questões relacionadas
- [ ] Paywall em 50 artigos (FREE)

### Should-Have (Sprint 3-4)
- [ ] Sistema de favoritos (estrela)
- [ ] Busca full-text (português)
- [ ] Filtro por disciplina
- [ ] Notas pessoais (BASIC+)
- [ ] Integração com mnemônicos (exibir se existir)
- [ ] Botão "Criar Flashcard" (pré-preenche)

### Nice-to-Have (Sprint 5-6+)
- [ ] Audio narração (TTS)
- [ ] Cronograma de estudos (plano diário)
- [ ] Comparação de versões (emendas constitucionais)
- [ ] Export notas para PDF
- [ ] "Lei em Questão" (estatísticas de cada artigo)

---

## 🎨 Wireframe Ajustado (Com Insights)

```
┌─────────────────────────────────────────────────────────────┐
│  CF/88 - Constituição Federal de 1988       [⭐ 45 favoritos]│
│  ━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░  127/250 artigos (51%)      │
├──────────────────────┬──────────────────────────────────────┤
│  ÍNDICE             │  Art. 5º, LXXVIII                     │
│                     │  ┌─────────────────────────────────┐  │
│  📂 Título I ▾      │  │ ✅ Estudado  🔥 Muito Cobrado   │  │
│    Princípios       │  └─────────────────────────────────┘  │
│    Fundamentais     │                                       │
│    □ Art. 1º        │  A todos, no âmbito judicial e        │
│    □ Art. 2º        │  administrativo, são assegurados a    │
│    ✅ Art. 3º       │  razoável duração do processo e os    │
│    □ Art. 4º        │  meios que garantam a celeridade de   │
│                     │  sua tramitação.                      │
│  📂 Título II ▾     │                                       │
│    Direitos e       │  ─────────────────────────────────    │
│    Garantias        │  💡 Mnemônico (42 👍)                 │
│    ├─ Art. 5º ▾     │  "DRR - Duração Razoável do pRocesso" │
│      I-X            │  por @usuario123 • ✅ Validado        │
│      XI-XX          │                                       │
│      XXI-XXX        │  ─────────────────────────────────    │
│      LXXVIII ◄──────┼─ VOCÊ ESTÁ AQUI                      │
│                     │                                       │
│  🔍 Buscar artigo   │  📊 Estatísticas:                     │
│  ⭐ Favoritos (45)  │  • 127 questões sobre este artigo     │
│  🏆 Mais Cobrados   │  • 85% de acerto médio                │
│                     │  • Última cobrança: PCDF 2024         │
│                     │                                       │
│                     │  [❓ Ver Questões] [🃏 Criar Flashcard│
│                     │  [📝 Adicionar Nota] [⭐ Favoritar]   │
└──────────────────────┴──────────────────────────────────────┘
```

---

## 📊 Conclusões

### Mercado está maduro para solução digital integrada
- Juspodivm domina mercado **impresso**
- Gran/Estratégia focam em **questões + vídeos**
- **Ninguém integra Lei Seca + Questões + Mnemônicos + Flashcards**

### Oportunidade clara para KAV
1. **Ser o "Notion do estudo de Lei Seca"** - Tudo em um lugar
2. **Gamificação** - Engajamento contínuo
3. **Comunidade** - Mnemônicos colaborativos
4. **Mobile-first** - Concorrentes são desktop-heavy

### Modelo de negócio validado
- **Freemium funciona** (50 artigos grátis)
- **BASIC a R$ 39,90** (15 leis completas) - competitivo
- **PREMIUM a R$ 79,90** (audio + notas ilimitadas) - diferenciado

---

**Próximo passo:** Implementar MVP com os Must-Haves identificados! 🚀
