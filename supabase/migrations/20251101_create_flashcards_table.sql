-- Tabela de Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frente TEXT NOT NULL,
  verso TEXT NOT NULL,
  disciplina TEXT,
  tags TEXT[],

  -- Algoritmo de repetição espaçada (SM-2)
  proxima_revisao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultima_revisao TIMESTAMPTZ,
  intervalo_dias INTEGER DEFAULT 1,
  facilidade NUMERIC(3, 2) DEFAULT 2.5,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_proxima_revisao ON flashcards(proxima_revisao);
CREATE INDEX idx_flashcards_disciplina ON flashcards(disciplina);
CREATE INDEX idx_flashcards_tags ON flashcards USING GIN(tags);

-- RLS Policies
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios flashcards
CREATE POLICY "Users can view own flashcards"
  ON flashcards FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios flashcards
CREATE POLICY "Users can create own flashcards"
  ON flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios flashcards
CREATE POLICY "Users can update own flashcards"
  ON flashcards FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios flashcards
CREATE POLICY "Users can delete own flashcards"
  ON flashcards FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_flashcards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flashcards_updated_at_trigger
  BEFORE UPDATE ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION update_flashcards_updated_at();
