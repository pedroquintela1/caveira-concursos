# Regras de Negócio - KAV Concursos

**Versão:** 2.0  
**Data:** 18/10/2025  
**Última Atualização:** 18/10/2025 - Revisão Estratégica de Questões  
**Objetivo:** Documentar todas as regras de negócio específicas do domínio

> **⚠️ MUDANÇA ESTRATÉGICA v2.0:**
>
> - **Removido sistema de questões avulsas**
> - **Todas as questões são resolvidas APENAS através de Cadernos Personalizados**
> - FREE agora permite 2 cadernos ativos
> - BÁSICO inclui comentários (comunidade + professor)
> - PREMIUM inclui materiais extras (vídeos, PDFs)

---

## 📑 Índice

1. [Planos e Limites](#1-planos-e-limites)
2. [Sistema de Cadernos](#2-sistema-de-cadernos)
3. [Sistema de Questões (dentro de Cadernos)](#3-sistema-de-questões-dentro-de-cadernos)
4. [Sistema de Mnemônicos](#4-sistema-de-mnemônicos)
5. [Sistema de Flashcards](#5-sistema-de-flashcards)
6. [Gamificação e Pontos](#6-gamificação-e-pontos)
7. [Estatísticas e Análises](#7-estatísticas-e-análises)
8. [Assinaturas e Pagamentos](#8-assinaturas-e-pagamentos)
9. [Moderação de Conteúdo](#9-moderação-de-conteúdo)
10. [Limites e Rate Limiting](#10-limites-e-rate-limiting)

---

## 1. Planos e Limites

### 1.1 Plano FREE

**Limites:**

```typescript
const FREE_LIMITS = {
  // Cadernos (OBRIGATÓRIO para resolver questões)
  cadernos_ativos: 2, // Pode ter 2 cadernos ativos
  questoes_por_caderno: 50, // Máximo 50 questões por caderno

  // Questões
  questoes_por_dia: 5, // Limite diário total
  pode_resolver_questoes_avulsas: false, // REMOVIDO - apenas via cadernos

  // Comentários
  ver_comentarios_comunidade: false, // NÃO pode ver
  ver_comentarios_professor: false, // NÃO pode ver
  pode_comentar: false, // NÃO pode comentar

  // Materiais Extras
  acessar_materiais_extras: false, // NÃO tem acesso (vídeos, PDFs)

  // Leis
  leis_disponiveis: 3, // CF/88 (parcial), CP (parcial), CPP (parcial)
  artigos_por_lei: 50, // Primeiros 50 artigos de cada

  // Mnemônicos
  visualizar_mnemonicos: 3, // Top 3 por artigo
  criar_mnemonicos: 3, // Por dia

  // Flashcards
  flashcards_ativos: 10, // Máximo 10 simultâneos

  // Estatísticas
  estatisticas_basicas: true,
  analise_bancas: 'top3', // Ver apenas top 3 assuntos

  // Ads
  mostrar_anuncios: true,
};
```

**Regras Específicas:**

1. ✅ Pode criar até **2 cadernos ativos** simultaneamente
2. ✅ Cada caderno pode ter no máximo **50 questões**
3. ✅ Pode responder até **5 questões por dia** (total de todos cadernos, reset às 00:00 BRT)
4. ❌ **NÃO** pode ver comentários da comunidade ou do professor
5. ❌ **NÃO** pode acessar materiais extras (vídeos, PDFs)
6. ✅ Vê apenas **top 3 mnemônicos** mais votados por artigo
7. ✅ Pode ter até **10 flashcards ativos**
8. ✅ Análise de bancas: apenas **top 3 assuntos** mais cobrados
9. ❌ **NÃO** pode exportar cadernos em PDF
10. ❌ **NÃO** tem acesso a cadernos inteligentes (IA)

**Paywall:**

- Ao atingir 5 questões/dia: "Limite atingido! Upgrade para continuar"
- Ao tentar criar 3º caderno: "Plano FREE permite apenas 2 cadernos"
- Ao clicar em comentário: "Assine BÁSICO para ver comentários"
- Ao clicar em material extra: "Assine PREMIUM para acessar materiais extras"

---

### 1.2 Plano BÁSICO (R$ 39,90/mês)

**Limites:**

```typescript
const BASIC_LIMITS = {
  // Cadernos
  cadernos_ativos: 10, // Até 10 cadernos
  questoes_por_caderno: 200, // Máximo 200 por caderno

  // Questões
  questoes_por_dia: Infinity, // ILIMITADO

  // Comentários (DIFERENCIAL BÁSICO)
  ver_comentarios_comunidade: true, // ✅ PODE VER
  ver_comentarios_professor: true, // ✅ PODE VER
  pode_comentar: true, // ✅ PODE COMENTAR

  // Materiais Extras
  acessar_materiais_extras: false, // ❌ NÃO tem acesso (apenas Premium)

  // Leis
  leis_disponiveis: 15, // Todas as leis principais
  artigos_por_lei: Infinity, // Sem limite

  // Mnemônicos
  visualizar_mnemonicos: Infinity, // Todos
  criar_mnemonicos: 10, // Por dia

  // Flashcards
  flashcards_ativos: 200, // Máximo 200 simultâneos
  repetição_espaçada: true,

  // Estatísticas
  estatisticas_avancadas: true,
  analise_bancas: 'top10', // Ver top 10 assuntos

  // Ads
  mostrar_anuncios: false,

  // Cadernos
  exportar_pdf: false, // Apenas Premium
  cadernos_inteligentes: false, // Apenas Premium
};
```

**Regras Específicas:**

1. ✅ **Questões ilimitadas** por dia
2. ✅ Até **10 cadernos ativos** com 200 questões cada
3. ✅ **VER comentários** da comunidade e do professor
4. ✅ **PODE comentar** nas questões
5. ❌ **NÃO** tem acesso a materiais extras (vídeos, PDFs)
6. ✅ Acesso completo a todas as leis
7. ✅ Todos os mnemônicos visíveis
8. ✅ Sistema de flashcards (máx 200 ativos)
9. ✅ Estatísticas detalhadas por disciplina
10. ✅ Análise de bancas: **top 10 assuntos** mais cobrados
11. ❌ **NÃO** pode exportar cadernos em PDF
12. ❌ **NÃO** tem cadernos inteligentes (IA)
13. ✅ Sem anúncios

**Paywall BÁSICO:**

- Ao tentar criar 11º caderno: "Plano BÁSICO permite até 10 cadernos"
- Ao clicar em material extra: "Assine PREMIUM para acessar vídeos e PDFs"
- Ao tentar exportar PDF: "Feature exclusiva do plano PREMIUM"
- Badge "PREMIUM" aparece em features bloqueadas

---

### 1.3 Plano PREMIUM (R$ 79,90/mês)

**Limites:**

```typescript
const PREMIUM_LIMITS = {
  // Cadernos
  cadernos_ativos: Infinity, // ILIMITADO
  questoes_por_caderno: 500, // Máximo 500 por caderno

  // Questões
  questoes_por_dia: Infinity, // ILIMITADO

  // Comentários
  ver_comentarios_comunidade: true, // ✅ PODE VER
  ver_comentarios_professor: true, // ✅ PODE VER
  pode_comentar: true, // ✅ PODE COMENTAR

  // Materiais Extras (DIFERENCIAL PREMIUM)
  acessar_materiais_extras: true, // ✅ TEM ACESSO
  pode_baixar_materiais: true, // ✅ PODE BAIXAR

  // Leis
  leis_disponiveis: Infinity, // Todas
  artigos_por_lei: Infinity, // Sem limite

  // Mnemônicos
  visualizar_mnemonicos: Infinity, // Todos
  criar_mnemonicos: Infinity, // Ilimitado

  // Flashcards
  flashcards_ativos: Infinity, // Ilimitado
  repetição_espaçada: true,

  // Estatísticas
  estatisticas_avancadas: true,
  analise_bancas: 'completa', // Análise completa + heatmap + comparador

  // Cadernos (DIFERENCIAIS PREMIUM)
  exportar_pdf: true, // ✅ PODE EXPORTAR
  cadernos_inteligentes: true, // ✅ IA cria cadernos
  compartilhar_cadernos: true, // ✅ PODE COMPARTILHAR
  duplicar_cadernos_comunidade: true, // ✅ PODE DUPLICAR

  // Ads
  mostrar_anuncios: false,

  // Suporte
  suporte_prioritario: true,
  response_time_max: '2h', // Resposta em até 2h
};
```

**Regras Específicas:**

1. ✅ **Cadernos ilimitados** (sem limite de ativos)
2. ✅ Até **500 questões por caderno**
3. ✅ **Questões ilimitadas** por dia
4. ✅ **Comentários** da comunidade e professor
5. ✅ **Materiais extras completos** (vídeo-aulas, PDFs, links externos)
6. ✅ **Pode baixar** materiais para estudo offline
7. ✅ **Cadernos inteligentes** criados por IA (analisa pontos fracos + bancas)
8. ✅ **Exportar cadernos** em PDF com gabaritos
9. ✅ **Compartilhar cadernos** com a comunidade
10. ✅ **Duplicar cadernos** públicos de outros usuários
11. ✅ **Análise completa** de bancas (heatmap, comparador, tendências)
12. ✅ **Flashcards ilimitados** com repetição espaçada
13. ✅ **Mnemônicos ilimitados** (criar sem limite diário)
14. ✅ **Suporte prioritário** (resposta em até 2h)
15. ✅ Acesso antecipado a **novas features**

---

### 1.3 Plano PREMIUM (R$ 79,90/mês)

**Limites:**
const PREMIUM_LIMITS = {
// Tudo ilimitado
questoes_por_dia: Infinity,
leis_disponiveis: Infinity,
artigos_por_lei: Infinity,
visualizar_mnemonicos: Infinity,
criar_mnemonicos: 50, // Por dia
flashcards_ativos: Infinity,
cadernos_ativos: Infinity,
questoes_por_caderno: 500,

// Recursos exclusivos
analise_bancas: true,
cadernos_inteligentes: true,
export_pdf: true,
suporte_prioritario: true,

// Ads
mostrar_anuncios: false,
};

**Regras Específicas:**

1. ✅ **TUDO** ilimitado
2. ✅ Análise de inteligência de bancas (diferencial)
3. ✅ Cadernos inteligentes criados por IA
4. ✅ Exportar cadernos em PDF
5. ✅ Suporte prioritário via email
6. ✅ Acesso antecipado a novas features

---

### 1.4 Verificação de Limites

// src/lib/utils/check-limits.ts

export async function checkQuestoesLimit(userId: string): Promise<{
allowed: boolean;
remaining: number;
resetAt: Date;
}> {
const supabase = createClient();

// Buscar plano do usuário
const { data: profile } = await supabase
.from('profiles')
.select('plano')
.eq('id', userId)
.single();

// Se não for free, retornar ilimitado
if (profile?.plano !== 'free') {
return { allowed: true, remaining: Infinity, resetAt: new Date() };
}

// Contar questões respondidas hoje
const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

const { count } = await supabase
.from('respostas_usuarios')
.select('\*', { count: 'exact', head: true })
.eq('user_id', userId)
.gte('respondida_em', hoje.toISOString());

const used = count || 0;
const limit = FREE_LIMITS.questoes_por_dia;
const remaining = Math.max(0, limit - used);

// Próximo reset (00:00 amanhã)
const resetAt = new Date(hoje);
resetAt.setDate(resetAt.getDate() + 1);

return {
allowed: remaining > 0,
remaining,
resetAt,
};
}

---

## 2. Sistema de Questões

### 2.1 Responder Questão

**Regras:**

1. **Unicidade de Resposta**
   - Usuário pode responder cada questão **apenas uma vez**
   - Tentativa de responder novamente retorna erro 400
   - Não é possível "refazer" questão (histórico imutável)

2. **Verificação de Plano**
   // Plano FREE: Verificar limite diário
   if (plano === 'free') {
   const { allowed } = await checkQuestoesLimit(userId);
   if (!allowed) {
   return { error: 'Limite diário atingido. Upgrade para continuar.' };
   }
   }

3. **Cálculo de Pontos**
   const pontos = correta ? 5 : 0;

// Bonus por streak
if (streak >= 7) pontos += 2;
if (streak >= 30) pontos += 5;

// Bonus por tempo (se < 30s)
if (tempo_resposta < 30) pontos += 3;

4. **Atualização Automática de Estatísticas**

- Trigger atualiza `questoes.taxa_acerto`
- Trigger atualiza `profiles.total_questoes_respondidas`
- Trigger atualiza `profiles.taxa_acerto_geral`
- Trigger atualiza `profiles.pontos_totais`

---

### 2.2 Dificuldade de Questão

**Cálculo Automático:**
function calcularDificuldade(taxaAcerto: number): 'facil' | 'medio' | 'dificil' {
if (taxaAcerto >= 70) return 'facil';
if (taxaAcerto >= 40) return 'medio';
return 'dificil';
}

// Atualizar a cada 50 respostas
if (questao.total_respostas % 50 === 0) {
await supabase
.from('questoes')
.update({ dificuldade: calcularDificuldade(questao.taxa_acerto) })
.eq('id', questao.id);
}

---

### 2.3 Questões Anuladas

**Regras:**

1. Admin pode marcar questão como anulada (`is_anulada = true`)
2. Questões anuladas **NÃO** aparecem em filtros normais
3. Respostas já salvas permanecem no banco (histórico)
4. Pontos de questões anuladas **NÃO** são revertidos
5. Taxa de acerto **NÃO** é recalculada para questões anuladas

---

## 3. Sistema de Mnemônicos

### 3.1 Criar Mnemônico

**Regras:**

1. **Limite Diário por Plano**
   const DAILY_LIMITS = {
   free: 3,
   basic: 10,
   premium: 50,
   };

2. **Validação de Conteúdo**
   const MnemonicoSchema = z.object({
   texto: z.string()
   .min(10, 'Mínimo 10 caracteres')
   .max(500, 'Máximo 500 caracteres')
   .refine(
   (texto) => !texto.includes('http'),
   'Links não são permitidos'
   ),
   artigo_id: z.number().int().positive(),
   });

3. **Anti-Spam**

- Máximo 5 mnemônicos por hora por usuário
- Bloqueio automático se detectar padrão de spam
- Moderação obrigatória para novos usuários (< 7 dias cadastro)

4. **Status Inicial**
   {
   is_validado: false, // Sempre começa não validado
   is_active: true,
   votos_positivos: 0,
   votos_negativos: 0,
   score: 0,
   }

---

### 3.2 Votar em Mnemônico

**Regras:**

1. **Um Voto por Usuário por Mnemônico**

- Constraint no banco: `PRIMARY KEY (user_id, mnemonico_id)`
- Usuário pode mudar seu voto (update)
- Usuário pode remover seu voto (delete)

2. **Tipos de Voto**
   type Voto = 1 | -1; // 1 = útil, -1 = não útil

3. **Cálculo de Score**
   score = votos_positivos - votos_negativos

// Trigger recalcula automaticamente a cada voto

4. **Não Pode Votar no Próprio Mnemônico**
   if (mnemonico.autor_id === user.id) {
   return { error: 'Não pode votar no próprio mnemônico' };
   }

---

### 3.3 Validação de Mnemônico (Admin)

**Regras:**

1. **Critérios de Aprovação**

- ✅ Texto claro e objetivo
- ✅ Realmente ajuda a memorizar o artigo
- ✅ Sem erros de português graves
- ✅ Sem conteúdo ofensivo
- ✅ Sem informações incorretas

2. **Ações Disponíveis**
   type AcaoModeracao = 'aprovar' | 'reprovar' | 'editar';

// Aprovar
UPDATE mnemonicos SET
is_validado = true,
validado_por = admin_id,
validado_em = NOW()

// Reprovar (soft delete)
UPDATE mnemonicos SET is_active = false

// Editar + Aprovar
UPDATE mnemonicos SET
texto = '[texto_corrigido]',
is_validado = true,
validado_por = admin_id

3. **Badge de Validado**

- Mnemônicos validados aparecem primeiro
- Badge verde "✓ Validado" na UI
- Ordenação: `ORDER BY is_validado DESC, score DESC`

---

## 4. Sistema de Flashcards

### 4.1 Criar Flashcard

**Regras:**

1. **Limite por Plano**
   const MAX_FLASHCARDS = {
   free: 0, // Não pode criar
   basic: 200, // Máximo 200 ativos
   premium: Infinity,
   };

2. **Verificação de Duplicata**
   // Não permitir flashcard duplicado do mesmo artigo
   // Constraint: UNIQUE(user_id, artigo_id) WHERE is_active = TRUE

3. **Valores Iniciais**
   {
   intervalo: 1, // 1 dia até primeira revisão
   repeticoes: 0, // Nunca revisado
   facilidade: 2.5, // Fator padrão SM-2
   proxima_revisao: CURRENT_DATE, // Revisar hoje
   is_active: true,
   }

---

### 4.2 Revisar Flashcard (Algoritmo SM-2)

**Regras:**

1. **Respostas Possíveis**
   type RespostaFlashcard = 'dificil' | 'medio' | 'facil' | 'muito_facil';

2. **Cálculo de Próxima Revisão**
   function calcularProximaRevisao(
   resposta: RespostaFlashcard,
   intervalo_atual: number,
   repeticoes: number,
   facilidade: number
   ): { novoIntervalo: number; novaFacilidade: number } {

let novaFacilidade = facilidade;
let novoIntervalo: number;

// Ajustar facilidade baseado na resposta
switch (resposta) {
case 'dificil':
novaFacilidade = Math.max(1.3, facilidade - 0.2);
novoIntervalo = 1; // Resetar para 1 dia
break;

case 'medio':
// Facilidade inalterada
novoIntervalo = Math.round(intervalo_atual \* 1.5);
break;

case 'facil':
novaFacilidade += 0.1;
novoIntervalo = Math.round(intervalo_atual \* 2);
break;

case 'muito_facil':
novaFacilidade += 0.15;
novoIntervalo = Math.round(intervalo_atual \* 3);
break;
}

// Garantir mínimo de 1 dia
novoIntervalo = Math.max(1, novoIntervalo);

return { novoIntervalo, novaFacilidade };
}

3. **Atualização no Banco**
   UPDATE flashcards SET
   intervalo = [novo_intervalo],
   repeticoes = repeticoes + 1,
   facilidade = [nova_facilidade],
   proxima_revisao = CURRENT_DATE + [novo_intervalo],
   ultima_revisao = NOW(),
   ultima_resposta = [resposta]
   WHERE id = [flashcard_id]

4. **Ordem de Apresentação**
   SELECT \* FROM flashcards
   WHERE user_id = [user_id]
   AND is_active = true
   AND proxima_revisao <= CURRENT_DATE
   ORDER BY proxima_revisao ASC, created_at ASC
   LIMIT 20

---

### 4.3 Desativar Flashcard

**Regras:**

1. Usuário pode desativar a qualquer momento
2. Soft delete: `UPDATE flashcards SET is_active = false`
3. Não conta no limite de flashcards ativos
4. Pode reativar posteriormente (cria novo com valores padrão)

---

## 5. Gamificação e Pontos

### 5.1 Sistema de Pontos

**Ganho de Pontos:**
const PONTOS = {
// Questões
questao_correta: 5,
questao_correta_rapida: 8, // < 30 segundos
questao_dificil_correta: 10,

// Streak
streak_7_dias: 50,
streak_30_dias: 200,
streak_100_dias: 1000,

// Flashcards
revisar_flashcard: 2,
completar_sessao_revisao: 10, // Revisar todos pendentes

// Mnemônicos
criar_mnemonico: 5,
mnemonico_validado: 20,
mnemonico_10_votos_positivos: 30,
mnemonico_100_votos_positivos: 100,

// Leis
completar_lei: 100, // Marcar todos artigos como estudados

// Cadernos
completar_caderno: 50,
caderno_100_acerto: 150,
};

**Perda de Pontos:**

- ❌ **NÃO** perde pontos por resposta errada
- ❌ **NÃO** perde pontos se quebrar streak
- Filosofia: gamificação positiva, nunca punitiva

---

### 5.2 Sistema de Níveis

**Cálculo de Nível:**
function calcularNivel(pontos: number): number {
// Progressão exponencial
// Nível 1: 0 pontos
// Nível 2: 100 pontos
// Nível 3: 300 pontos (100 + 200)
// Nível 4: 600 pontos (100 + 200 + 300)
// ...

let pontosAcumulados = 0;
let nivel = 1;

while (pontosAcumulados <= pontos) {
pontosAcumulados += nivel \* 100;
nivel++;
}

return nivel - 1;
}

// Atualizar automaticamente via trigger quando pontos mudam

**Benefícios por Nível:**
const BENEFICIOS_NIVEL = {
5: 'Badge Iniciante',
10: 'Badge Estudioso',
20: 'Badge Dedicado',
50: 'Badge Mestre',
100: 'Badge Lenda',
};

---

### 5.3 Sistema de Streak

**Regras:**

1. **Incremento de Streak**
   // Executar diariamente ao primeiro acesso
   async function atualizarStreak(userId: string) {
   const { data: profile } = await supabase
   .from('profiles')
   .select('ultimo_acesso, streak_dias')
   .eq('id', userId)
   .single();

const hoje = new Date().toISOString().split('T');
const ultimo = profile.ultimo_acesso;

if (ultimo === hoje) {
// Já acessou hoje, não fazer nada
return;
}

const ontem = new Date();
ontem.setDate(ontem.getDate() - 1);
const ontemStr = ontem.toISOString().split('T');

if (ultimo === ontemStr) {
// Acessou ontem, incrementar streak
await supabase
.from('profiles')
.update({
streak_dias: profile.streak_dias + 1,
ultimo_acesso: hoje,
})
.eq('id', userId);
} else {
// Não acessou ontem, resetar streak
await supabase
.from('profiles')
.update({
streak_dias: 1,
ultimo_acesso: hoje,
})
.eq('id', userId);
}
}

2. **Proteção de Streak (Plano Premium)**

- Premium tem 1 "vida" por mês
- Se quebrar streak, pode recuperar uma vez
- Implementar em fase 2

---

## 6. Sistema de Cadernos

### 6.1 Criar Caderno

**Regras:**

1. **Limite por Plano**
   const MAX_CADERNOS = {
   free: 0,
   basic: 10,
   premium: Infinity,
   };

2. **Validação**
   const CadernoSchema = z.object({
   nome: z.string().min(3).max(100),
   descricao: z.string().max(500).optional(),
   pasta: z.string().default('GERAL'),
   filtros: z.object({
   disciplina_ids: z.array(z.number()).optional(),
   banca_ids: z.array(z.number()).optional(),
   ano_min: z.number().min(2000).max(2030).optional(),
   dificuldade: z.enum(['facil', 'medio', 'dificil']).optional(),
   }),
   });

3. **Limite de Questões por Caderno**
   const MAX_QUESTOES_POR_CADERNO = {
   basic: 200,
   premium: 500,
   };

4. **Seleção de Questões**

- Aplicar filtros definidos pelo usuário
- Ordenação aleatória (shuffle) para variedade
- Salvar em `cadernos_questoes` com campo `ordem`

---

### 6.2 Resolver Caderno

**Regras:**

1. **Progresso Salvo**

- Atualizar `questoes_respondidas` a cada resposta
- Usuário pode pausar e continuar depois
- Marcar `is_concluido = true` quando terminar todas

2. **Cálculo de Taxa de Acerto**
   UPDATE cadernos
   SET taxa_acerto = (
   SELECT
   (COUNT() FILTER (WHERE ru.correta = true)::DECIMAL / COUNT()::DECIMAL) \* 100
   FROM cadernos_questoes cq
   LEFT JOIN respostas_usuarios ru ON ru.questao_id = cq.questao_id
   WHERE cq.caderno_id = cadernos.id
   AND ru.user_id = [user_id]
   )
   WHERE id = [caderno_id]

3. **Filtrar Questões Já Respondidas**

- Opção: "Apenas questões não respondidas anteriormente"
- Implementar filtro ao buscar questões do caderno

---

### 6.3 Cadernos Inteligentes (Premium)

**Regras:**

1. **Algoritmo de Seleção**
   async function criarCadernoInteligente(
   userId: string,
   concursoAlvo: string,
   quantidadeQuestoes: number = 50
   ) {
   // 1. Buscar estatísticas da banca do concurso
   const estatisticas = await buscarEstatisticasBanca(concursoAlvo);

// 2. Buscar pontos fracos do usuário
const pontosFracos = await analisarDesempenhoUsuario(userId);

// 3. Calcular score de prioridade para cada assunto
const prioridades = calcularPrioridades(estatisticas, pontosFracos);

// 4. Distribuir questões proporcionalmente
const distribuicao = distribuirQuestoes(prioridades, quantidadeQuestoes);

// 5. Selecionar questões
const questoes = await selecionarQuestoes(distribuicao);

// 6. Criar caderno
return criarCaderno({
nome: `Caderno Inteligente - ${concursoAlvo}`,
questoes,
algoritmo_usado: 'v1.0',
});
}

2. **Fórmula de Prioridade**
   score*prioridade =
   (incidencia_banca * 0.35) +
   (relevancia*edital * 0.25) +
   (1 - taxa*acerto_usuario / 100) * 0.25 +
   (tendencia*crescimento * 0.15)

---

## 7. Estatísticas e Análises

### 7.1 Taxa de Acerto

**Cálculo:**
-- Geral
SELECT
(COUNT() FILTER (WHERE correta = true)::DECIMAL / COUNT()::DECIMAL) \* 100 AS taxa_acerto
FROM respostas_usuarios
WHERE user_id = [user_id]

-- Por disciplina
SELECT
d.nome,
(COUNT() FILTER (WHERE ru.correta = true)::DECIMAL / COUNT()::DECIMAL) \* 100 AS taxa_acerto
FROM respostas_usuarios ru
JOIN questoes q ON ru.questao_id = q.id
JOIN disciplinas d ON q.disciplina_id = d.id
WHERE ru.user_id = [user_id]
GROUP BY d.id, d.nome

**Atualização:**

- Trigger atualiza `profiles.taxa_acerto_geral` a cada resposta
- Recalcular completamente uma vez por semana (cron job)

---

### 7.2 Análise de Bancas (Premium)

**Dados Disponíveis:**

1. **Incidência por Assunto**
   {
   assunto: 'Inquérito Policial',
   total_questoes: 155,
   percentual_total: 28.65,
   taxa_acerto_comunidade: 62.5,
   taxa_acerto_usuario: 58.3,
   dificuldade: 'medio',
   }

2. **Tendência Temporal**
   {
   assunto: 'Prisão em Flagrante',
   questoes_ultimos_2_anos: 45,
   questoes_ultimos_5_anos: 89,
   taxa_crescimento: 15.5, // %
   tendencia: 'crescente',
   }

3. **Artigos Mais Cobrados**
   {
   assunto: 'Ação Penal',
   top_artigos: [
   { artigo: 'CPP Art. 24', questoes: 38 },
   { artigo: 'CPP Art. 100', questoes: 31 },
   { artigo: 'CPP Art. 395', questoes: 28 },
   ],
   }

4. **Probabilidade de Cobrança**
   // Fórmula (simplificada)
   probabilidade = (
   (incidencia*historica * 0.4) +
   (frequencia*aparicao * 0.3) +
   (tendencia*crescimento * 0.2) +
   (relevancia*edital * 0.1)
   )

// Escala: 0-100

**Atualização:**

- Recalcular toda vez que 50+ novas questões forem adicionadas
- Ou semanalmente via cron job

---

## 8. Assinaturas e Pagamentos

### 8.1 Fluxo de Upgrade

**Regras:**

1. **Checkout**

- Criar Stripe Customer (se não existir)
- Salvar `customer_id` em `profiles.stripe_customer_id`
- Criar Checkout Session com metadata: `{ user_id }`
- Redirect para Stripe

2. **Webhook: checkout.completed**
   // Atualizar imediatamente
   UPDATE profiles SET
   plano = 'premium',
   stripe_subscription_id = [subscription_id],
   plano_expira_em = [period_end]
   WHERE id = [user_id]

3. **Ativação Instantânea**

- Usuário pode usar features premium imediatamente
- Verificar sempre `profiles.plano` (não `subscriptions.status`)

---

### 8.2 Cancelamento

**Regras:**

1. **Cancelamento Imediato vs Fim do Período**
   // Padrão: Fim do período (recomendado)
   stripe.subscriptions.update(subscription_id, {
   cancel_at_period_end: true,
   });

// Usuário mantém acesso até [period_end]

2. **Retenção: Oferecer Desconto**
   // Se usuário clicar cancelar, mostrar modal:
   "Que tal 20% de desconto por 3 meses?"

// Se aceitar, aplicar cupom e NÃO cancelar

3. **Downgrade Automático**
   // Webhook: subscription.deleted
   UPDATE profiles SET
   plano = 'free',
   stripe_subscription_id = NULL,
   plano_expira_em = NULL
   WHERE stripe_subscription_id = [subscription_id]

4. **Aplicar Limites FREE**

- Desativar flashcards extras (> 0)
- Manter cadernos existentes (read-only)
- Bloquear criação de novos cadernos

---

### 8.3 Falha de Pagamento

**Regras:**

1. **Tentativas Automáticas (Stripe)**

- Stripe tenta cobrar automaticamente 4x ao longo de ~3 semanas
- 1ª tentativa: imediato
- 2ª tentativa: +3 dias
- 3ª tentativa: +5 dias
- 4ª tentativa: +7 dias

2. **Emails de Lembrete**

- Após 1ª falha: "Problema com pagamento"
- Após 2ª falha: "Urgente: Atualize forma de pagamento"
- Após 3ª falha: "Última chance para manter plano"
- Após 4ª falha: "Assinatura cancelada"

3. **Status da Assinatura**
   // webhook: invoice.payment_failed
   UPDATE subscriptions SET status = 'past_due'

// Usuário MANTÉM acesso durante tentativas
// Apenas após 4ª falha: downgrade para free

---

## 9. Moderação de Conteúdo

### 9.1 Mnemônicos

**Fila de Moderação:**
SELECT \* FROM mnemonicos
WHERE is_validado = false
AND is_active = true
ORDER BY created_at ASC

**Critérios de Reprovação:**

1. ❌ Conteúdo ofensivo/inapropriado
2. ❌ Spam/autopromoção
3. ❌ Informação incorreta sobre a lei
4. ❌ Link externo
5. ❌ Não ajuda a memorizar (ex: apenas copia do artigo)

**Ação Admin:**

- Aprovar: `is_validado = true`
- Reprovar: `is_active = false`
- Editar: corrigir texto + aprovar

---

### 9.2 Questões

**Revisão Obrigatória:**

- Todas questões importadas passam por revisão manual
- Admin verifica: gabarito correto, formatação, fonte

**Questões Anuladas:**

- Admin pode marcar como anulada
- Não remover do banco (histórico)
- Não aparecer em filtros

---

## 10. Limites e Rate Limiting

### 10.1 Rate Limiting por Endpoint

const RATE_LIMITS = {
// Autenticação
'POST /api/auth/signup': { requests: 5, window: '1h' },
'POST /api/auth/login': { requests: 10, window: '15m' },

// Questões
'POST /api/questoes/responder': { requests: 100, window: '1h' },

// Mnemônicos
'POST /api/mnemonicos': { requests: 10, window: '1h' },
'POST /api/mnemonicos/vote': { requests: 50, window: '1h' },

// Geral
'GET _': { requests: 1000, window: '1h' },
'POST _': { requests: 100, window: '1h' },
};

**Implementação:**

- Usar Redis (futuro) ou Upstash Redis (sem infra)
- Chave: `rate_limit:[user_id]:[endpoint]:[window]`
- Retornar 429 quando exceder

---

### 10.2 Limites de Conteúdo

const CONTENT_LIMITS = {
// Texto
mnemonico_texto: { min: 10, max: 500 },
caderno_nome: { min: 3, max: 100 },
comentario: { min: 1, max: 1000 },

// Arquivos (futuro)
avatar*size: 5 * 1024 \_ 1024, // 5 MB

// Listas
caderno_questoes: { basic: 200, premium: 500 },
filtros_simultaneos: 10,
};

---

## 11. Regras de LGPD

### 11.1 Dados Coletados

**Essenciais:**

- Email (autenticação)
- Nome completo (perfil)
- Respostas de questões (funcionalidade core)
- Histórico de estudo (estatísticas)

**Opcionais:**

- Avatar (perfil)
- Concurso alvo (personalização)

**NÃO Coletamos:**

- CPF/RG
- Telefone
- Endereço completo
- Dados sensíveis

---

### 11.2 Direitos do Usuário

1. **Exportar Dados**
   GET /api/user/export-data

// Retorna JSON com:
// - Profile completo
// - Todas respostas
// - Todos mnemônicos criados
// - Todos flashcards
// - Todos cadernos

2. **Deletar Conta**
   DELETE /api/user/account

// Confirmação dupla obrigatória
// Remove:
// - Profile (cascade remove respostas, flashcards, etc)
// - Stripe customer
// - Auth user

3. **Anonimização de Dados**

- Após 2 anos de inatividade, anonimizar dados
- Manter estatísticas agregadas (sem identificação)

---

## 12. Resumo: Comandos para Copilot

### Verificar Limite de Plano

Implemente função checkPlanLimit que:

Recebe userId e recurso (questoes/flashcards/cadernos)

Busca plano do usuário

Verifica limite do recurso para aquele plano

Retorna { allowed: boolean, remaining: number, upgrade_required: boolean }

Seguir constantes FREE_LIMITS, BASIC_LIMITS, PREMIUM_LIMITS do docs/07-REGRAS-NEGOCIO.md

### Implementar Algoritmo SM-2

Implemente função calcularProximaRevisao seguindo:

Algoritmo SM-2 descrito em docs/07-REGRAS-NEGOCIO.md seção 4.2

Recebe: resposta, intervalo_atual, repeticoes, facilidade

Retorna: { novoIntervalo, novaFacilidade, proximaRevisao }

TypeScript strict

### Aplicar Regra de Negócio

Implemente regra: [especificar regra do docs/07-REGRAS-NEGOCIO.md]

Seção X.Y

Validações necessárias

Error messages em PT-BR

TypeScript strict

---

**Fim do arquivo `07-REGRAS-NEGOCIO.md`**
