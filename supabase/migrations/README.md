# 📦 Database Migrations - KAV Concursos

## 🎯 Ordem de Execução das Migrations

**IMPORTANTE:** Execute na ordem abaixo para evitar erros de foreign keys!

1. ✅ `20251022_create_base_tables.sql` - Tabelas base (disciplinas, bancas, orgaos)
2. ✅ `20251023_create_questoes_table.sql` - Questões, leis, artigos, respostas
3. ✅ `20251023_create_cadernos_table.sql` - Sistema de cadernos (v2.1)
4. ✅ `20251023_create_comments_and_materials.sql` - Comentários e materiais extras

---

## 🚀 Como Aplicar as Migrations

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Dashboard:**
   - URL: https://supabase.com/dashboard/project/qujgtdpgvbsbbytefzjx
   - Faça login

2. **Abra o SQL Editor:**
   - No menu lateral, clique em **"SQL Editor"**
   - Ou acesse: https://supabase.com/dashboard/project/qujgtdpgvbsbbytefzjx/sql

3. **Execute cada migration na ordem:**

   **Migration 1 - Base Tables:**
   - Clique em **"+ New query"**
   - Copie todo o conteúdo de `20251022_create_base_tables.sql`
   - Cole no editor
   - Clique em **"Run"** (ou Ctrl/Cmd + Enter)
   - ✅ Verifique se apareceu "Success. No rows returned"

   **Migration 2 - Questões:**
   - Clique em **"+ New query"** novamente
   - Copie todo o conteúdo de `20251023_create_questoes_table.sql`
   - Cole no editor
   - Clique em **"Run"**
   - ✅ Verifique se inseriu 5 questões de exemplo

   **Migration 3 - Cadernos:**
   - Repita o processo com `20251023_create_cadernos_table.sql`

   **Migration 4 - Comentários e Materiais:**
   - Repita o processo com `20251023_create_comments_and_materials.sql`

4. **Verificar sucesso:**
   - Vá para **"Table Editor"** no menu lateral
   - Você deve ver as seguintes tabelas:
     - ✅ `disciplinas` (5 registros)
     - ✅ `bancas` (8 registros)
     - ✅ `orgaos` (8 registros)
     - ✅ `leis` (3 registros)
     - ✅ `questoes` (5 registros)
     - ✅ `cadernos` (vazio)
     - ✅ `respostas_usuarios` (vazio)
     - ✅ `questoes_comentarios` (vazio)
     - ✅ `questoes_materiais_extras` (vazio)

---

### Opção 2: Via Supabase CLI (Alternativa)

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Link com o projeto
supabase link --project-ref qujgtdpgvbsbbytefzjx

# 4. Aplicar migrations
supabase db push

# 5. Verificar status
supabase db status
```

---

## 🔍 Validar que Tudo Funcionou

### Teste 1: Verificar Tabelas

```sql
-- No SQL Editor do Supabase, execute:
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'disciplinas', 'bancas', 'orgaos', 'leis', 'artigos',
    'questoes', 'cadernos', 'respostas_usuarios',
    'questoes_comentarios', 'questoes_materiais_extras'
  )
ORDER BY table_name;
```

**Resultado esperado:**
```
artigos               6 colunas
bancas                7 colunas
cadernos             17 colunas
disciplinas           9 colunas
leis                  8 colunas
orgaos                8 colunas
questoes             22 colunas
questoes_comentarios  9 colunas
questoes_materiais_extras 13 colunas
respostas_usuarios    8 colunas
```

### Teste 2: Verificar Dados Seed

```sql
SELECT
  (SELECT COUNT(*) FROM disciplinas) as disciplinas,
  (SELECT COUNT(*) FROM bancas) as bancas,
  (SELECT COUNT(*) FROM orgaos) as orgaos,
  (SELECT COUNT(*) FROM leis) as leis,
  (SELECT COUNT(*) FROM questoes) as questoes;
```

**Resultado esperado:**
```
disciplinas: 5
bancas: 8
orgaos: 8
leis: 3
questoes: 5
```

### Teste 3: Verificar RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  COUNT(*) as num_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```

**Resultado esperado:**
```
cadernos: 4 policies
questoes: 1 policy
respostas_usuarios: 2 policies
```

### Teste 4: Testar Query de Questões (como seria no frontend)

```sql
-- Simular query da página de cadernos
SELECT
  q.*,
  b.nome as banca_nome,
  b.sigla as banca_sigla,
  o.nome as orgao_nome,
  o.sigla as orgao_sigla,
  d.nome as disciplina_nome
FROM questoes q
LEFT JOIN bancas b ON q.banca_id = b.id
LEFT JOIN orgaos o ON q.orgao_id = o.id
LEFT JOIN disciplinas d ON q.disciplina_id = d.id
WHERE q.is_active = true
LIMIT 5;
```

**Resultado esperado:** 5 questões com joins funcionando

---

## ⚠️ Troubleshooting

### Erro: "relation already exists"

**Causa:** Tabela já existe (migration já foi executada)

**Solução:** Pule essa migration ou use `DROP TABLE IF EXISTS nome_tabela CASCADE;` antes de executar novamente (⚠️ **CUIDADO**: isso apaga todos os dados!)

### Erro: "foreign key constraint fails"

**Causa:** Você executou as migrations fora de ordem

**Solução:**
1. Verifique qual tabela está causando o erro
2. Execute a migration que cria essa tabela primeiro
3. Ordem correta: base_tables → questoes → cadernos → comments

### Erro: "permission denied for schema public"

**Causa:** Usuário não tem permissão para criar tabelas

**Solução:** Use uma conexão com `service_role` key ou o dashboard do Supabase (que tem permissões de admin)

### Erro: "syntax error near ..."

**Causa:** SQL copiado incorretamente ou versão antiga do PostgreSQL

**Solução:**
1. Verifique se copiou todo o arquivo (incluindo o `--` inicial)
2. Supabase usa PostgreSQL 15.6 - todas as queries devem ser compatíveis

---

## 📊 Após Aplicar as Migrations

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Teste a página de cadernos:**
   - Acesse: http://localhost:3000/dashboard/cadernos
   - Não deve mais mostrar erro
   - Deve aparecer "Nenhum caderno criado"

3. **Crie um caderno de teste:**
   - Clique em "Novo Caderno"
   - Preencha o formulário
   - Submeta

4. **Resolva uma questão:**
   - Entre no caderno criado
   - Responda as questões

---

## 🔗 Links Úteis

- **Supabase Dashboard:** https://supabase.com/dashboard/project/qujgtdpgvbsbbytefzjx
- **SQL Editor:** https://supabase.com/dashboard/project/qujgtdpgvbsbbytefzjx/sql
- **Table Editor:** https://supabase.com/dashboard/project/qujgtdpgvbsbbytefzjx/editor
- **Docs Supabase:** https://supabase.com/docs

---

**Última atualização:** 23/10/2025
**Status:** ✅ Migrations criadas, aguardando aplicação
