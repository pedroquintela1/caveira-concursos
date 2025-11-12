-- Tabela de Mnemônicos
CREATE TABLE IF NOT EXISTS mnemonicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  lei TEXT NOT NULL,
  artigo TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_mnemonicos_user_id ON mnemonicos(user_id);
CREATE INDEX idx_mnemonicos_lei ON mnemonicos(lei);
CREATE INDEX idx_mnemonicos_tags ON mnemonicos USING GIN(tags);

-- RLS Policies
ALTER TABLE mnemonicos ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios mnemônicos
CREATE POLICY "Users can view own mnemonicos"
  ON mnemonicos FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios mnemônicos
CREATE POLICY "Users can create own mnemonicos"
  ON mnemonicos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios mnemônicos
CREATE POLICY "Users can update own mnemonicos"
  ON mnemonicos FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios mnemônicos
CREATE POLICY "Users can delete own mnemonicos"
  ON mnemonicos FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_mnemonicos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mnemonicos_updated_at_trigger
  BEFORE UPDATE ON mnemonicos
  FOR EACH ROW
  EXECUTE FUNCTION update_mnemonicos_updated_at();
