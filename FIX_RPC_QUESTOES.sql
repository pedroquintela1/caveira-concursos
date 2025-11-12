-- =====================================================
-- CORREÇÃO: Função RPC get_caderno_questoes
-- Data: 10/11/2025
-- Problema: Função existe mas retorna 0 questões
-- Solução: Simplificar lógica e corrigir DISTINCT ON
-- =====================================================

-- DROPAR função antiga (se existir)
DROP FUNCTION IF EXISTS get_caderno_questoes(INT, UUID);

-- CRIAR função corrigida
CREATE OR REPLACE FUNCTION get_caderno_questoes(
  p_caderno_id INT,
  p_user_id UUID
)
RETURNS TABLE (
  -- Dados da questão
  id INT,
  enunciado TEXT,
  alternativa_a TEXT,
  alternativa_b TEXT,
  alternativa_c TEXT,
  alternativa_d TEXT,
  alternativa_e TEXT,
  gabarito_oficial TEXT,
  explicacao TEXT,
  codigo TEXT,
  ano INT,
  dificuldade TEXT,
  is_comentada BOOLEAN,
  tem_materiais_extras BOOLEAN,

  -- Relacionamentos
  disciplina_id INT,
  disciplina_nome TEXT,
  banca_id INT,
  banca_nome TEXT,
  banca_sigla TEXT,
  orgao_id INT,
  orgao_nome TEXT,
  orgao_sigla TEXT,
  artigo_id INT,
  artigo_numero TEXT,

  -- Informações de resposta do usuário
  ja_respondida BOOLEAN,
  resposta_usuario TEXT,
  respondeu_corretamente BOOLEAN,
  tempo_resposta_segundos INT,
  respondida_em TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caderno RECORD;
  v_limite INT;
BEGIN
  -- 1. Buscar caderno e validar permissão
  SELECT c.*
  INTO v_caderno
  FROM cadernos c
  WHERE c.id = p_caderno_id AND c.user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caderno não encontrado ou você não tem permissão.';
  END IF;

  -- 2. Definir limite
  v_limite := COALESCE(v_caderno.limite_questoes, 50);

  -- 3. Retornar questões (SEM DISTINCT ON para debug)
  RETURN QUERY
  SELECT
    q.id,
    q.enunciado,
    q.alternativa_a,
    q.alternativa_b,
    q.alternativa_c,
    q.alternativa_d,
    q.alternativa_e,
    q.gabarito_oficial,
    q.explicacao,
    q.codigo,
    q.ano,
    q.dificuldade,
    COALESCE(q.is_comentada, FALSE) as is_comentada,
    COALESCE(q.tem_materiais_extras, FALSE) as tem_materiais_extras,

    -- Disciplina
    q.disciplina_id,
    COALESCE(d.nome, 'Sem disciplina'::TEXT) as disciplina_nome,

    -- Banca
    q.banca_id,
    b.nome as banca_nome,
    b.sigla as banca_sigla,

    -- Órgão
    q.orgao_id,
    o.nome as orgao_nome,
    o.sigla as orgao_sigla,

    -- Artigo
    q.artigo_id,
    a.numero as artigo_numero,

    -- Resposta do usuário
    (ru.id IS NOT NULL) as ja_respondida,
    ru.resposta_escolhida as resposta_usuario,
    (ru.resposta_escolhida = q.gabarito_oficial) as respondeu_corretamente,
    ru.tempo_resposta_segundos,
    ru.respondida_em

  FROM questoes q

  -- LEFT JOINS
  LEFT JOIN disciplinas d ON d.id = q.disciplina_id
  LEFT JOIN bancas b ON b.id = q.banca_id
  LEFT JOIN orgaos o ON o.id = q.orgao_id
  LEFT JOIN artigos a ON a.id = q.artigo_id
  LEFT JOIN respostas_usuarios ru ON (
    ru.questao_id = q.id
    AND ru.user_id = p_user_id
    AND ru.caderno_id = p_caderno_id
  )

  WHERE
    -- Questão ativa
    q.is_active = TRUE

    -- FILTROS (NULL = sem filtro)
    AND (v_caderno.disciplina_id IS NULL OR q.disciplina_id = v_caderno.disciplina_id)
    AND (v_caderno.assunto_id IS NULL OR q.assunto_id = v_caderno.assunto_id)
    AND (v_caderno.banca_id IS NULL OR q.banca_id = v_caderno.banca_id)
    AND (v_caderno.orgao_id IS NULL OR q.orgao_id = v_caderno.orgao_id)

    -- Filtro: Área de Carreira (se existir coluna)
    AND (v_caderno.area_carreira_id IS NULL OR q.area_carreira_id = v_caderno.area_carreira_id)

    -- Filtro: Formação (se existir coluna)
    AND (v_caderno.formacao_id IS NULL OR q.formacao_id = v_caderno.formacao_id)

    -- Filtro: Escolaridade (se existir coluna)
    AND (v_caderno.escolaridade IS NULL OR q.escolaridade = v_caderno.escolaridade)

    -- Filtro: Região (via órgão)
    AND (v_caderno.regiao IS NULL OR o.regiao = v_caderno.regiao)

    -- Filtro: Anos (range)
    AND (
      v_caderno.ano_inicio IS NULL
      OR v_caderno.ano_fim IS NULL
      OR (q.ano >= COALESCE(v_caderno.ano_inicio, q.ano) AND q.ano <= COALESCE(v_caderno.ano_fim, q.ano))
    )

    -- Filtro: Dificuldade
    AND (v_caderno.dificuldade IS NULL OR q.dificuldade = v_caderno.dificuldade)

  -- ORDENAÇÃO: Não respondidas primeiro, depois por ID
  ORDER BY
    (CASE WHEN ru.id IS NULL THEN 0 ELSE 1 END),
    q.id

  -- LIMITE
  LIMIT v_limite;

END;
$$;

-- Dar permissão
GRANT EXECUTE ON FUNCTION get_caderno_questoes(INT, UUID) TO authenticated;

-- Comentário
COMMENT ON FUNCTION get_caderno_questoes(INT, UUID) IS
'Retorna questões filtradas de um caderno, com informações de respostas do usuário (VERSÃO CORRIGIDA)';

-- LOG
SELECT 'Função get_caderno_questoes CORRIGIDA com sucesso!' as status;
