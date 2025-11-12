-- Migration: Adicionar coluna is_ativo e otimizar banco de dados
-- Data: 2025-10-31
-- Descrição:
--   1. Adiciona coluna is_ativo na tabela cadernos para arquivar/reativar
--   2. Adiciona índices para otimizar queries frequentes
--   3. Revisa e otimiza RLS policies

-- ==========================================
-- 1. ADICIONAR COLUNA IS_ATIVO EM CADERNOS
-- ==========================================

-- Adicionar coluna is_ativo (default TRUE para cadernos existentes)
ALTER TABLE cadernos
ADD COLUMN IF NOT EXISTS is_ativo BOOLEAN DEFAULT TRUE NOT NULL;

-- Comentário na coluna
COMMENT ON COLUMN cadernos.is_ativo IS 'Status do caderno: TRUE=ativo, FALSE=arquivado. Cadernos arquivados não aparecem na lista principal.';

-- ==========================================
-- 2. CRIAR ÍNDICES PARA OTIMIZAÇÃO
-- ==========================================

-- Índices na tabela cadernos (queries frequentes)
CREATE INDEX IF NOT EXISTS idx_cadernos_user_id
ON cadernos(user_id);

CREATE INDEX IF NOT EXISTS idx_cadernos_user_is_ativo
ON cadernos(user_id, is_ativo)
WHERE is_ativo = TRUE;

CREATE INDEX IF NOT EXISTS idx_cadernos_pasta_id
ON cadernos(pasta_id)
WHERE pasta_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cadernos_user_pasta
ON cadernos(user_id, pasta_id);

-- Índices na tabela cadernos_questoes (JOIN frequente)
CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_caderno_id
ON cadernos_questoes(caderno_id);

CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_questao_id
ON cadernos_questoes(questao_id);

CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_caderno_ordem
ON cadernos_questoes(caderno_id, ordem);

-- Índices na tabela respostas_usuarios (queries de progresso)
CREATE INDEX IF NOT EXISTS idx_respostas_user_caderno
ON respostas_usuarios(user_id, caderno_id);

CREATE INDEX IF NOT EXISTS idx_respostas_questao_user
ON respostas_usuarios(questao_id, user_id);

CREATE INDEX IF NOT EXISTS idx_respostas_user_timestamp
ON respostas_usuarios(user_id, respondido_em DESC);

-- Índices na tabela questoes (filtros frequentes)
CREATE INDEX IF NOT EXISTS idx_questoes_disciplina
ON questoes(disciplina_id)
WHERE disciplina_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questoes_banca
ON questoes(banca_id)
WHERE banca_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questoes_orgao
ON questoes(orgao_id)
WHERE orgao_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questoes_ano
ON questoes(ano)
WHERE ano IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questoes_dificuldade
ON questoes(dificuldade)
WHERE dificuldade IS NOT NULL;

-- Índices na tabela questoes_comentarios (sistema de comentários)
CREATE INDEX IF NOT EXISTS idx_comentarios_questao
ON questoes_comentarios(questao_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comentarios_user
ON questoes_comentarios(user_id);

CREATE INDEX IF NOT EXISTS idx_comentarios_tipo
ON questoes_comentarios(tipo);

-- Índices na tabela comentarios_votos (sistema de votação)
CREATE INDEX IF NOT EXISTS idx_votos_comentario
ON comentarios_votos(comentario_id);

CREATE INDEX IF NOT EXISTS idx_votos_user_comentario
ON comentarios_votos(user_id, comentario_id);

-- Índices na tabela questoes_materiais_extras (materiais PREMIUM)
CREATE INDEX IF NOT EXISTS idx_materiais_questao
ON questoes_materiais_extras(questao_id);

CREATE INDEX IF NOT EXISTS idx_materiais_tipo
ON questoes_materiais_extras(tipo);

-- Índices na tabela pastas_cadernos (organização)
CREATE INDEX IF NOT EXISTS idx_pastas_user
ON pastas_cadernos(user_id);

-- ==========================================
-- 3. ATUALIZAR/CRIAR RLS POLICIES
-- ==========================================

-- 3.1 Policy para cadernos (incluir is_ativo)
DROP POLICY IF EXISTS "Users can view their own cadernos" ON cadernos;
CREATE POLICY "Users can view their own cadernos"
ON cadernos FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cadernos" ON cadernos;
CREATE POLICY "Users can insert their own cadernos"
ON cadernos FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cadernos" ON cadernos;
CREATE POLICY "Users can update their own cadernos"
ON cadernos FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cadernos" ON cadernos;
CREATE POLICY "Users can delete their own cadernos"
ON cadernos FOR DELETE
USING (auth.uid() = user_id);

-- 3.2 Policy para cadernos_questoes
DROP POLICY IF EXISTS "Users can view questoes from their cadernos" ON cadernos_questoes;
CREATE POLICY "Users can view questoes from their cadernos"
ON cadernos_questoes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cadernos
    WHERE cadernos.id = cadernos_questoes.caderno_id
    AND cadernos.user_id = auth.uid()
  )
);

-- 3.3 Policy para respostas_usuarios
DROP POLICY IF EXISTS "Users can view their own respostas" ON respostas_usuarios;
CREATE POLICY "Users can view their own respostas"
ON respostas_usuarios FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own respostas" ON respostas_usuarios;
CREATE POLICY "Users can insert their own respostas"
ON respostas_usuarios FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own respostas" ON respostas_usuarios;
CREATE POLICY "Users can update their own respostas"
ON respostas_usuarios FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3.4 Policy para questoes_comentarios (BASIC+ para ler, PREMIUM para escrever)
DROP POLICY IF EXISTS "Users with BASIC+ can view comentarios" ON questoes_comentarios;
CREATE POLICY "Users with BASIC+ can view comentarios"
ON questoes_comentarios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.plano IN ('basic', 'premium')
  )
);

DROP POLICY IF EXISTS "Users with PREMIUM can insert comentarios" ON questoes_comentarios;
CREATE POLICY "Users with PREMIUM can insert comentarios"
ON questoes_comentarios FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.plano = 'premium'
  )
);

DROP POLICY IF EXISTS "Users with PREMIUM can update own comentarios" ON questoes_comentarios;
CREATE POLICY "Users with PREMIUM can update own comentarios"
ON questoes_comentarios FOR UPDATE
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.plano = 'premium'
  )
)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users with PREMIUM can delete own comentarios" ON questoes_comentarios;
CREATE POLICY "Users with PREMIUM can delete own comentarios"
ON questoes_comentarios FOR DELETE
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.plano = 'premium'
  )
);

-- 3.5 Policy para comentarios_votos (PREMIUM pode votar)
DROP POLICY IF EXISTS "Users with PREMIUM can view votos" ON comentarios_votos;
CREATE POLICY "Users with PREMIUM can view votos"
ON comentarios_votos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.plano = 'premium'
  )
);

DROP POLICY IF EXISTS "Users with PREMIUM can vote" ON comentarios_votos;
CREATE POLICY "Users with PREMIUM can vote"
ON comentarios_votos FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.plano = 'premium'
  )
);

DROP POLICY IF EXISTS "Users with PREMIUM can update own votes" ON comentarios_votos;
CREATE POLICY "Users with PREMIUM can update own votes"
ON comentarios_votos FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users with PREMIUM can delete own votes" ON comentarios_votos;
CREATE POLICY "Users with PREMIUM can delete own votes"
ON comentarios_votos FOR DELETE
USING (auth.uid() = user_id);

-- 3.6 Policy para questoes_materiais_extras (PREMIUM only)
DROP POLICY IF EXISTS "Users with PREMIUM can view materiais" ON questoes_materiais_extras;
CREATE POLICY "Users with PREMIUM can view materiais"
ON questoes_materiais_extras FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.plano = 'premium'
  )
);

-- 3.7 Policy para pastas_cadernos
DROP POLICY IF EXISTS "Users can view their own pastas" ON pastas_cadernos;
CREATE POLICY "Users can view their own pastas"
ON pastas_cadernos FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own pastas" ON pastas_cadernos;
CREATE POLICY "Users can insert their own pastas"
ON pastas_cadernos FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pastas" ON pastas_cadernos;
CREATE POLICY "Users can update their own pastas"
ON pastas_cadernos FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own pastas" ON pastas_cadernos;
CREATE POLICY "Users can delete their own pastas"
ON pastas_cadernos FOR DELETE
USING (auth.uid() = user_id);

-- 3.8 Policies para leitura pública (tabelas de referência)
DROP POLICY IF EXISTS "Anyone can view bancas" ON bancas;
CREATE POLICY "Anyone can view bancas"
ON bancas FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view orgaos" ON orgaos;
CREATE POLICY "Anyone can view orgaos"
ON orgaos FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view disciplinas" ON disciplinas;
CREATE POLICY "Anyone can view disciplinas"
ON disciplinas FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can view questoes" ON questoes;
CREATE POLICY "Authenticated users can view questoes"
ON questoes FOR SELECT
USING (auth.uid() IS NOT NULL);

-- ==========================================
-- 4. ATUALIZAR TIPOS NO DATABASE
-- ==========================================

-- Comentários nas tabelas principais
COMMENT ON TABLE cadernos IS 'Cadernos de estudo criados pelos usuários. Cada caderno contém questões filtradas.';
COMMENT ON TABLE cadernos_questoes IS 'Relação N:N entre cadernos e questões, com ordem de exibição.';
COMMENT ON TABLE respostas_usuarios IS 'Respostas dos usuários às questões dentro de cadernos.';
COMMENT ON TABLE questoes_comentarios IS 'Comentários de professores e comunidade nas questões (BASIC+ feature).';
COMMENT ON TABLE comentarios_votos IS 'Sistema de votação nos comentários (PREMIUM feature).';
COMMENT ON TABLE questoes_materiais_extras IS 'Materiais complementares (vídeos, PDFs) nas questões (PREMIUM feature).';
COMMENT ON TABLE pastas_cadernos IS 'Pastas para organizar cadernos (hierarquia de 1 nível).';

-- ==========================================
-- 5. VERIFICAÇÃO FINAL
-- ==========================================

-- Verificar se coluna foi criada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cadernos'
    AND column_name = 'is_ativo'
  ) THEN
    RAISE EXCEPTION 'Coluna is_ativo não foi criada na tabela cadernos';
  END IF;

  RAISE NOTICE 'Migration 20251031_add_is_ativo_and_optimize executada com sucesso!';
  RAISE NOTICE 'Coluna is_ativo adicionada: OK';
  RAISE NOTICE 'Índices criados: OK';
  RAISE NOTICE 'RLS Policies atualizadas: OK';
END $$;
