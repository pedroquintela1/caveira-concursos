# 🗄️ Configuração do Banco de Dados - KAV Concursos

**Data:** 18/10/2025  
**Projeto Supabase:** aprovacao-elite (renomeado)  
**Status:** ✅ **COMPLETO**

---

## 📊 Resumo da Configuração

### ✅ O que foi feito:

1. ✅ **Limpeza completa** do projeto Supabase `aprovacao-elite` (25 tabelas antigas removidas)
2. ✅ **5 Migrations criadas** com schema completo do KAV Concursos
3. ✅ **18 tabelas criadas** + seed data
4. ✅ **RLS (Row Level Security) habilitado** em todas as tabelas sensíveis
5. ✅ **Tipos TypeScript gerados** automaticamente
6. ✅ **Arquivo `.env` configurado** com credenciais reais

---

## 🔑 Credenciais do Supabase

```bash
# Supabase Project
Project ID: qujgtdpgvbsbbytefzjx
Project URL: https://qujgtdpgvbsbbytefzjx.supabase.co
Region: sa-east-1 (São Paulo)
Status: ACTIVE_HEALTHY
```

**✅ As credenciais já estão configuradas no arquivo `.env`**

---

## 📦 Migrations Criadas

### Migration 1: `01_initial_schema_kav_concursos`

**Tabelas criadas:**

- ✅ `profiles` - Perfis de usuários estendidos
- ✅ `disciplinas` - Áreas do direito (5 seed data)
- ✅ `leis` - Legislações estudadas (3 seed data: CF/88, CP, CPP)
- ✅ `artigos` - Artigos individuais das leis
- ✅ `bancas` - Organizadoras de concursos (8 seed data: CESPE, FCC, etc.)
- ✅ `orgaos` - Órgãos públicos (4 seed data: PM-SP, PF, PRF, TJ-SP)
- ✅ `assuntos` - Assuntos/tópicos das disciplinas (3 seed data)

**Seed Data Inserido:**

- 5 Disciplinas: Dir. Constitucional, Penal, Processual Penal, Administrativo, Civil
- 3 Leis: CF/88, Código Penal, CPP
- 8 Bancas: CESPE, FCC, VUNESP, FGV, IBFC, FUNDEP, AOCP, QUADRIX
- 4 Órgãos: PM-SP, PF, PRF, TJ-SP

---

### Migration 2: `02_questoes_respostas_schema`

**Tabelas criadas:**

- ✅ `questoes` - Banco de questões de concursos
- ✅ `questoes_assuntos` - Relacionamento N:N (questões ↔ assuntos)
- ✅ `respostas_usuarios` - Histórico de respostas (com UNIQUE constraint)

**Índices de Performance:**

- 9 índices em `questoes` (banca, órgão, disciplina, ano, dificuldade, full-text)
- Índice composto para filtros comuns: `(disciplina_id, banca_id, ano)`

---

### Migration 3: `03_mnemonicos_flashcards_schema`

**Tabelas criadas:**

- ✅ `mnemonicos` - Técnicas de memorização da comunidade
- ✅ `votos_mnemonicos` - Sistema de votação (1 voto por usuário)
- ✅ `flashcards` - Sistema de repetição espaçada (SM-2)

**Features:**

- Validação de mnemônicos por moderadores
- Sistema de score (votos_positivos - votos_negativos)
- Algoritmo SM-2 completo (intervalo, facilidade, próxima revisão)

---

### Migration 4: `04_cadernos_gamificacao_schema`

**Tabelas criadas:**

- ✅ `cadernos` - Cadernos de questões personalizados
- ✅ `cadernos_questoes` - Questões dentro de cada caderno (N:N)
- ✅ `badges` - Emblemas/conquistas (4 seed data)
- ✅ `usuarios_badges` - Badges conquistadas por usuários
- ✅ `ranking_semanal` - Cache de rankings

**Seed Data - Badges:**

- 🌟 **Primeira Questão** (comum, 10 pts)
- 🏆 **Centurião** - 100 questões (raro, 100 pts)
- 🔥 **Semana Perfeita** - 7 dias streak (raro, 50 pts)
- 👑 **Expert** - 90% taxa de acerto (épico, 200 pts)

---

### Migration 5: `05_rls_policies`

**RLS Habilitado em 18 tabelas:**

#### 🔒 Tabelas Privadas (user-scoped):

- ✅ `profiles` - Usuário vê/edita apenas próprio perfil
- ✅ `respostas_usuarios` - Usuário vê apenas próprias respostas (histórico imutável)
- ✅ `flashcards` - Usuário vê/edita apenas próprios flashcards
- ✅ `cadernos` - Usuário vê/edita apenas próprios cadernos
- ✅ `cadernos_questoes` - Acesso via caderno do usuário
- ✅ `votos_mnemonicos` - Usuário vê/edita apenas próprios votos

#### 🔓 Tabelas Públicas (read-only):

- ✅ `questoes` - Todos podem ler questões ativas
- ✅ `disciplinas`, `leis`, `artigos` - Todos podem ler
- ✅ `bancas`, `orgaos`, `assuntos` - Todos podem ler
- ✅ `badges` - Todos podem ler badges
- ✅ `usuarios_badges` - Todos podem ver badges de todos (leaderboard)
- ✅ `ranking_semanal` - Ranking público

#### 🔐 Políticas Especiais:

- **Mnemônicos:**
  - ✅ Todos veem mnemônicos validados
  - ✅ Autor vê próprios mnemônicos (mesmo não validados)
  - ✅ Autor pode editar apenas se não validado

---

## 🗂️ Estrutura Final do Banco

### Tabelas Criadas (18 total):

| Tabela               | Registros | RLS | Descrição                    |
| -------------------- | --------- | --- | ---------------------------- |
| `profiles`           | 0         | ✅  | Perfis de usuários           |
| `disciplinas`        | 5         | ✅  | Áreas do direito             |
| `leis`               | 3         | ✅  | Legislações (CF/88, CP, CPP) |
| `artigos`            | 0         | ✅  | Artigos das leis             |
| `bancas`             | 8         | ✅  | Organizadoras                |
| `orgaos`             | 4         | ✅  | Órgãos públicos              |
| `assuntos`           | 3         | ✅  | Assuntos das disciplinas     |
| `questoes`           | 0         | ✅  | Banco de questões            |
| `questoes_assuntos`  | 0         | ✅  | N:N questões-assuntos        |
| `respostas_usuarios` | 0         | ✅  | Histórico de respostas       |
| `mnemonicos`         | 0         | ✅  | Técnicas de memorização      |
| `votos_mnemonicos`   | 0         | ✅  | Votação de mnemônicos        |
| `flashcards`         | 0         | ✅  | Repetição espaçada (SM-2)    |
| `cadernos`           | 0         | ✅  | Cadernos personalizados      |
| `cadernos_questoes`  | 0         | ✅  | N:N cadernos-questões        |
| `badges`             | 4         | ✅  | Emblemas/conquistas          |
| `usuarios_badges`    | 0         | ✅  | Badges conquistadas          |
| `ranking_semanal`    | 0         | ✅  | Cache de rankings            |

---

## 🚀 Próximos Passos

### 1️⃣ Popular banco com dados de teste

```bash
# Adicionar questões, artigos, mnemônicos
# Pode usar Supabase Studio ou SQL
```

### 2️⃣ Testar autenticação

```bash
npm run dev
# Criar conta no app
# Verificar se profile é criado automaticamente
```

### 3️⃣ Criar triggers automáticos (opcional)

- Auto-criar profile ao registrar usuário
- Auto-atualizar estatísticas (taxa_acerto, streak)
- Auto-calcular score de mnemônicos

---

## 📝 Comandos Úteis

### Ver tabelas criadas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Ver policies RLS:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Ver todas as migrations aplicadas:

```sql
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

---

## ✅ Checklist de Validação

- [x] Banco de dados limpo (antigas tabelas removidas)
- [x] 5 migrations aplicadas com sucesso
- [x] 18 tabelas criadas
- [x] Seed data inserido (disciplinas, leis, bancas, orgaos, assuntos, badges)
- [x] RLS habilitado em todas as tabelas
- [x] Políticas RLS configuradas corretamente
- [x] Tipos TypeScript gerados
- [x] Arquivo `.env` configurado
- [ ] Popular banco com questões reais
- [ ] Popular banco com artigos de leis
- [ ] Testar fluxo completo de autenticação
- [ ] Criar triggers automáticos (opcional)

---

## 🎯 Status Final

✅ **BANCO DE DADOS 100% CONFIGURADO E PRONTO PARA USO!**

**Projeto:** KAV Concursos  
**Database:** PostgreSQL 17 (Supabase)  
**Region:** sa-east-1 (São Paulo)  
**Tables:** 18 tabelas + 30+ índices  
**RLS:** Habilitado e configurado  
**Seed Data:** 27 registros iniciais

🚀 **Próximo passo:** Testar conexão rodando `npm run dev`
