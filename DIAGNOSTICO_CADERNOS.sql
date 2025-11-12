-- =====================================================
-- SCRIPT DE DIAGNÓSTICO - Cadernos Sem Questões
-- =====================================================
-- Execute este script no Supabase Dashboard (SQL Editor)
-- para identificar o problema
-- =====================================================

-- 1. Verificar se a função RPC existe
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'get_caderno_questoes'
  AND routine_schema = 'public';

-- 2. Verificar quantas questões existem no total
SELECT
  COUNT(*) as total_questoes,
  COUNT(CASE WHEN is_active = TRUE THEN 1 END) as questoes_ativas,
  COUNT(CASE WHEN disciplina_id IS NOT NULL THEN 1 END) as questoes_com_disciplina,
  COUNT(CASE WHEN banca_id IS NOT NULL THEN 1 END) as questoes_com_banca
FROM questoes;

-- 3. Verificar se as colunas foram adicionadas na tabela cadernos
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'cadernos'
  AND column_name IN ('area_carreira_id', 'formacao_id', 'escolaridade', 'regiao', 'assunto_id', 'disciplina_id', 'banca_id', 'limite_questoes')
ORDER BY column_name;

-- 4. Verificar cadernos criados recentemente (último criado)
SELECT
  id,
  nome,
  disciplina_id,
  banca_id,
  orgao_id,
  limite_questoes,
  ano_inicio,
  ano_fim,
  dificuldade,
  created_at
FROM cadernos
ORDER BY created_at DESC
LIMIT 5;

-- 5. Tentar buscar questões manualmente com os filtros do último caderno
-- (Copie o ID do caderno acima e substitua no comentário abaixo)
-- SELECT COUNT(*) FROM questoes WHERE is_active = TRUE AND disciplina_id = [COLOQUE_O_ID_AQUI];

-- 6. Verificar se existem questões com is_active = TRUE
SELECT
  disciplina_id,
  d.nome as disciplina_nome,
  COUNT(*) as total_questoes
FROM questoes q
LEFT JOIN disciplinas d ON d.id = q.disciplina_id
WHERE q.is_active = TRUE
GROUP BY disciplina_id, d.nome
ORDER BY total_questoes DESC
LIMIT 10;

-- 7. Verificar se existem disciplinas cadastradas
SELECT
  id,
  nome,
  slug
FROM disciplinas
ORDER BY nome
LIMIT 20;

-- 8. Verificar se existem bancas cadastradas
SELECT
  id,
  nome,
  sigla
FROM bancas
ORDER BY nome
LIMIT 20;
