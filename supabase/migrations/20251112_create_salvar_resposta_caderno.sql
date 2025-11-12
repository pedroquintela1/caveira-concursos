-- =====================================================
-- Migration: Criar função RPC salvar_resposta_caderno
-- Data: 12/11/2025
-- Descrição: Função que salva a resposta do usuário
--            para uma questão de um caderno, atualizando
--            estatísticas do caderno automaticamente
-- =====================================================

-- 1. CRIAR FUNÇÃO RPC salvar_resposta_caderno
CREATE OR REPLACE FUNCTION salvar_resposta_caderno(
  p_caderno_id INT,
  p_questao_id INT,
  p_resposta_escolhida TEXT,
  p_tempo_resposta_segundos INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_caderno RECORD;
  v_questao RECORD;
  v_resposta_id INT;
  v_acertou BOOLEAN;
  v_total_respostas INT;
  v_total_acertos INT;
  v_nova_taxa NUMERIC;
BEGIN
  -- 1. Obter ID do usuário autenticado
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- 2. Validar que o caderno pertence ao usuário
  SELECT * INTO v_caderno
  FROM cadernos
  WHERE id = p_caderno_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caderno não encontrado ou você não tem permissão';
  END IF;

  -- 3. Buscar a questão e validar que pertence aos filtros do caderno
  SELECT * INTO v_questao
  FROM questoes
  WHERE id = p_questao_id
    AND is_active = TRUE
    -- Validar filtros básicos do caderno
    AND (v_caderno.disciplina_id IS NULL OR disciplina_id = v_caderno.disciplina_id)
    AND (v_caderno.banca_id IS NULL OR banca_id = v_caderno.banca_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Questão não encontrada ou não pertence a este caderno';
  END IF;

  -- 4. Verificar se já respondeu esta questão neste caderno
  IF EXISTS (
    SELECT 1 FROM respostas_usuarios
    WHERE user_id = v_user_id
      AND questao_id = p_questao_id
      AND caderno_id = p_caderno_id
  ) THEN
    RAISE EXCEPTION 'Você já respondeu esta questão neste caderno';
  END IF;

  -- 5. Verificar se acertou
  v_acertou := (p_resposta_escolhida = v_questao.gabarito_oficial);

  -- 6. Inserir a resposta
  INSERT INTO respostas_usuarios (
    user_id,
    questao_id,
    caderno_id,
    resposta_escolhida,
    tempo_resposta_segundos,
    respondida_em
  ) VALUES (
    v_user_id,
    p_questao_id,
    p_caderno_id,
    p_resposta_escolhida,
    p_tempo_resposta_segundos,
    NOW()
  )
  RETURNING id INTO v_resposta_id;

  -- 7. Atualizar estatísticas do caderno
  -- Contar total de respostas e acertos
  SELECT
    COUNT(*)::INT,
    SUM(CASE WHEN ru.resposta_escolhida = q.gabarito_oficial THEN 1 ELSE 0 END)::INT
  INTO v_total_respostas, v_total_acertos
  FROM respostas_usuarios ru
  INNER JOIN questoes q ON q.id = ru.questao_id
  WHERE ru.caderno_id = p_caderno_id
    AND ru.user_id = v_user_id;

  -- Calcular nova taxa de acerto
  IF v_total_respostas > 0 THEN
    v_nova_taxa := ROUND((v_total_acertos::NUMERIC / v_total_respostas::NUMERIC) * 100, 2);
  ELSE
    v_nova_taxa := 0;
  END IF;

  -- Atualizar caderno
  UPDATE cadernos
  SET
    questoes_respondidas = v_total_respostas,
    taxa_acerto = v_nova_taxa,
    updated_at = NOW()
  WHERE id = p_caderno_id;

  -- 8. Atualizar estatísticas do perfil do usuário
  UPDATE profiles
  SET
    pontos_totais = pontos_totais + CASE WHEN v_acertou THEN 10 ELSE 0 END,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- 9. Retornar resultado
  RETURN json_build_object(
    'success', TRUE,
    'resposta_id', v_resposta_id,
    'acertou', v_acertou,
    'gabarito_oficial', v_questao.gabarito_oficial,
    'pontos_ganhos', CASE WHEN v_acertou THEN 10 ELSE 0 END,
    'total_respostas', v_total_respostas,
    'total_acertos', v_total_acertos,
    'nova_taxa_acerto', v_nova_taxa
  );

END;
$$;

-- 2. COMENTÁRIO da função
COMMENT ON FUNCTION salvar_resposta_caderno(INT, INT, TEXT, INT) IS
'Salva a resposta do usuário para uma questão de um caderno e atualiza estatísticas automaticamente';

-- 3. GRANT permissão para authenticated users
GRANT EXECUTE ON FUNCTION salvar_resposta_caderno(INT, INT, TEXT, INT) TO authenticated;

-- 4. Log da migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251112_create_salvar_resposta_caderno aplicada com sucesso!';
  RAISE NOTICE 'Função RPC salvar_resposta_caderno criada';
  RAISE NOTICE 'Agora as respostas serão salvas corretamente!';
END $$;
