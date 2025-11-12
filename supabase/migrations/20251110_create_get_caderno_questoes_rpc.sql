-- =====================================================
-- Migration: Criar função RPC get_caderno_questoes
-- Data: 10/11/2025
-- Descrição: Função que busca questões de um caderno
--            aplicando os filtros salvos e indicando
--            quais já foram respondidas pelo usuário
-- =====================================================

-- 1. CRIAR FUNÇÃO RPC get_caderno_questoes
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
  -- Buscar informações do caderno e validar permissão
  SELECT *
  INTO v_caderno
  FROM cadernos
  WHERE cadernos.id = p_caderno_id
    AND cadernos.user_id = p_user_id;

  -- Se caderno não encontrado ou não pertence ao usuário, retornar vazio
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caderno não encontrado ou você não tem permissão para acessá-lo.';
  END IF;

  -- Definir limite de questões (default 50 se não especificado)
  v_limite := COALESCE(v_caderno.limite_questoes, 50);

  -- Retornar questões filtradas
  RETURN QUERY
  SELECT DISTINCT ON (q.id)
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
    q.is_comentada,
    q.tem_materiais_extras,

    -- Disciplina
    q.disciplina_id,
    d.nome AS disciplina_nome,

    -- Banca
    q.banca_id,
    b.nome AS banca_nome,
    b.sigla AS banca_sigla,

    -- Órgão
    q.orgao_id,
    o.nome AS orgao_nome,
    o.sigla AS orgao_sigla,

    -- Artigo
    q.artigo_id,
    a.numero AS artigo_numero,

    -- Resposta do usuário
    CASE WHEN ru.id IS NOT NULL THEN TRUE ELSE FALSE END AS ja_respondida,
    ru.resposta_escolhida AS resposta_usuario,
    CASE
      WHEN ru.id IS NOT NULL THEN (ru.resposta_escolhida = q.gabarito_oficial)
      ELSE NULL
    END AS respondeu_corretamente,
    ru.tempo_resposta_segundos,
    ru.respondida_em

  FROM questoes q

  -- Joins para trazer informações relacionadas
  LEFT JOIN disciplinas d ON d.id = q.disciplina_id
  LEFT JOIN bancas b ON b.id = q.banca_id
  LEFT JOIN orgaos o ON o.id = q.orgao_id
  LEFT JOIN artigos a ON a.id = q.artigo_id

  -- Join para verificar se usuário já respondeu
  LEFT JOIN respostas_usuarios ru ON (
    ru.questao_id = q.id
    AND ru.user_id = p_user_id
    AND ru.caderno_id = p_caderno_id
  )

  WHERE
    q.is_active = TRUE

    -- Filtro: Disciplina
    AND (v_caderno.disciplina_id IS NULL OR q.disciplina_id = v_caderno.disciplina_id)

    -- Filtro: Assunto (opcional, dentro da disciplina)
    AND (v_caderno.assunto_id IS NULL OR q.assunto_id = v_caderno.assunto_id)

    -- Filtro: Banca
    AND (v_caderno.banca_id IS NULL OR q.banca_id = v_caderno.banca_id)

    -- Filtro: Órgão
    AND (v_caderno.orgao_id IS NULL OR q.orgao_id = v_caderno.orgao_id)

    -- Filtro: Área de Carreira
    AND (v_caderno.area_carreira_id IS NULL OR q.area_carreira_id = v_caderno.area_carreira_id)

    -- Filtro: Formação
    AND (v_caderno.formacao_id IS NULL OR q.formacao_id = v_caderno.formacao_id)

    -- Filtro: Escolaridade
    AND (v_caderno.escolaridade IS NULL OR q.escolaridade = v_caderno.escolaridade)

    -- Filtro: Região (via órgão)
    AND (v_caderno.regiao IS NULL OR o.regiao = v_caderno.regiao)

    -- Filtro: Ano (range)
    AND (
      (v_caderno.ano_inicio IS NULL AND v_caderno.ano_fim IS NULL) OR
      (v_caderno.ano_inicio IS NOT NULL AND v_caderno.ano_fim IS NULL AND q.ano >= v_caderno.ano_inicio) OR
      (v_caderno.ano_inicio IS NULL AND v_caderno.ano_fim IS NOT NULL AND q.ano <= v_caderno.ano_fim) OR
      (v_caderno.ano_inicio IS NOT NULL AND v_caderno.ano_fim IS NOT NULL AND q.ano BETWEEN v_caderno.ano_inicio AND v_caderno.ano_fim)
    )

    -- Filtro: Dificuldade
    AND (v_caderno.dificuldade IS NULL OR q.dificuldade = v_caderno.dificuldade)

  -- Ordenação: Questões não respondidas primeiro, depois por ID
  ORDER BY q.id, (CASE WHEN ru.id IS NULL THEN 0 ELSE 1 END), q.id

  -- Limitar pelo número máximo de questões do caderno
  LIMIT v_limite;
END;
$$;

-- 2. COMENTÁRIO da função
COMMENT ON FUNCTION get_caderno_questoes(INT, UUID) IS
'Retorna questões de um caderno aplicando filtros salvos e indicando respostas do usuário';

-- 3. GRANT permissão para authenticated users
GRANT EXECUTE ON FUNCTION get_caderno_questoes(INT, UUID) TO authenticated;

-- 4. Log da migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251110_create_get_caderno_questoes_rpc aplicada com sucesso!';
  RAISE NOTICE 'Função RPC get_caderno_questoes criada';
  RAISE NOTICE 'Agora os cadernos conseguirão buscar questões corretamente!';
END $$;
