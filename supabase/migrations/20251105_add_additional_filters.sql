-- Migration: Adicionar filtros adicionais inspirados no TEC Concursos
-- Data: 05/11/2025
-- Descrição: Adiciona tabelas e campos para filtros de Área (Carreira), Escolaridade, Formação e Região

-- ============================================================================
-- 1. TABELA: areas_carreira (ex: Bombeiro, Polícia, Magistratura)
-- ============================================================================

CREATE TABLE IF NOT EXISTS areas_carreira (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL, -- Ex: "Bombeiro Militar", "Polícia Militar"
  slug TEXT UNIQUE NOT NULL, -- Ex: "bombeiro-militar"
  descricao TEXT,
  ordem INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE areas_carreira IS 'Áreas de carreira/atuação para filtros de questões';

-- Seed data
INSERT INTO areas_carreira (nome, slug, ordem) VALUES
('Bombeiro Militar', 'bombeiro-militar', 1),
('Polícia Militar', 'policia-militar', 2),
('Polícia Civil', 'policia-civil', 3),
('Polícia Federal', 'policia-federal', 4),
('Polícia Rodoviária Federal', 'policia-rodoviaria-federal', 5),
('Magistratura', 'magistratura', 6),
('Ministério Público', 'ministerio-publico', 7),
('Defensoria Pública', 'defensoria-publica', 8),
('Advocacia Pública', 'advocacia-publica', 9),
('Tribunais', 'tribunais', 10),
('Administrativo', 'administrativo', 11),
('Fiscalização', 'fiscalizacao', 12)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX idx_areas_carreira_slug ON areas_carreira(slug);

-- ============================================================================
-- 2. ENUM: escolaridade (Fundamental, Médio, Superior)
-- ============================================================================

-- Adicionar coluna escolaridade na tabela questoes
ALTER TABLE questoes
ADD COLUMN IF NOT EXISTS escolaridade TEXT
CHECK (escolaridade IN ('fundamental', 'medio', 'superior', 'pos-graduacao'));

COMMENT ON COLUMN questoes.escolaridade IS 'Nível de escolaridade exigido no concurso';

CREATE INDEX IF NOT EXISTS idx_questoes_escolaridade ON questoes(escolaridade);

-- ============================================================================
-- 3. TABELA: formacoes (ex: Direito, Engenharia, Medicina)
-- ============================================================================

CREATE TABLE IF NOT EXISTS formacoes (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL, -- Ex: "Direito", "Engenharia Civil"
  slug TEXT UNIQUE NOT NULL,
  area_conhecimento TEXT, -- Ex: "Humanas", "Exatas", "Saúde"
  ordem INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE formacoes IS 'Formações acadêmicas exigidas nos concursos';

-- Seed data
INSERT INTO formacoes (nome, slug, area_conhecimento, ordem) VALUES
('Direito', 'direito', 'Humanas', 1),
('Administração', 'administracao', 'Humanas', 2),
('Contabilidade', 'contabilidade', 'Humanas', 3),
('Economia', 'economia', 'Humanas', 4),
('Engenharia Civil', 'engenharia-civil', 'Exatas', 5),
('Engenharia Elétrica', 'engenharia-eletrica', 'Exatas', 6),
('Medicina', 'medicina', 'Saúde', 7),
('Enfermagem', 'enfermagem', 'Saúde', 8),
('Psicologia', 'psicologia', 'Humanas', 9),
('Informática', 'informatica', 'Exatas', 10),
('Qualquer Formação Superior', 'qualquer-formacao', 'Geral', 11),
('Sem Formação Específica', 'sem-formacao', 'Geral', 12)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX idx_formacoes_slug ON formacoes(slug);

-- ============================================================================
-- 4. ADICIONAR campos area_carreira_id e formacao_id em questoes
-- ============================================================================

ALTER TABLE questoes
ADD COLUMN IF NOT EXISTS area_carreira_id INT REFERENCES areas_carreira(id) ON DELETE SET NULL;

ALTER TABLE questoes
ADD COLUMN IF NOT EXISTS formacao_id INT REFERENCES formacoes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_questoes_area_carreira ON questoes(area_carreira_id);
CREATE INDEX IF NOT EXISTS idx_questoes_formacao ON questoes(formacao_id);

COMMENT ON COLUMN questoes.area_carreira_id IS 'Área de carreira do concurso (Bombeiro, PM, etc.)';
COMMENT ON COLUMN questoes.formacao_id IS 'Formação acadêmica exigida';

-- ============================================================================
-- 5. ADICIONAR campo regiao em orgaos (além de UF)
-- ============================================================================

ALTER TABLE orgaos
ADD COLUMN IF NOT EXISTS regiao TEXT
CHECK (regiao IN ('norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul', 'nacional'));

CREATE INDEX IF NOT EXISTS idx_orgaos_regiao ON orgaos(regiao);

COMMENT ON COLUMN orgaos.regiao IS 'Região geográfica do Brasil';

-- Atualizar órgãos existentes com região baseado na UF
UPDATE orgaos SET regiao = 'sudeste' WHERE uf IN ('SP', 'RJ', 'MG', 'ES');
UPDATE orgaos SET regiao = 'sul' WHERE uf IN ('PR', 'SC', 'RS');
UPDATE orgaos SET regiao = 'nordeste' WHERE uf IN ('BA', 'CE', 'PE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI');
UPDATE orgaos SET regiao = 'norte' WHERE uf IN ('AM', 'PA', 'RO', 'AC', 'RR', 'AP', 'TO');
UPDATE orgaos SET regiao = 'centro-oeste' WHERE uf IN ('GO', 'MT', 'MS', 'DF');
UPDATE orgaos SET regiao = 'nacional' WHERE uf = 'Nacional' OR uf IS NULL;

-- ============================================================================
-- 6. TABELA: questoes_favoritas (favoritar questões)
-- ============================================================================

CREATE TABLE IF NOT EXISTS questoes_favoritas (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  questao_id INT NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  favoritada_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, questao_id)
);

COMMENT ON TABLE questoes_favoritas IS 'Questões favoritadas pelos usuários';

CREATE INDEX idx_favoritas_user ON questoes_favoritas(user_id);
CREATE INDEX idx_favoritas_questao ON questoes_favoritas(questao_id);

-- ============================================================================
-- 7. RLS Policies para questoes_favoritas
-- ============================================================================

ALTER TABLE questoes_favoritas ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias favoritas
CREATE POLICY "Users can view their own favorites"
ON questoes_favoritas FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias favoritas
CREATE POLICY "Users can create their own favorites"
ON questoes_favoritas FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar suas próprias favoritas
CREATE POLICY "Users can delete their own favorites"
ON questoes_favoritas FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- 8. ÍNDICE COMPOSTO para filtros múltiplos (performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_questoes_filtros_completo ON questoes(
  disciplina_id,
  banca_id,
  orgao_id,
  area_carreira_id,
  ano,
  escolaridade,
  dificuldade
) WHERE is_active = TRUE;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
