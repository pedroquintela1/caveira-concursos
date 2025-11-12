-- Seed Data: Questões de Teste
-- Descrição: Popula banco com questões de exemplo para teste

-- Inserir Bancas (se não existirem)
INSERT INTO bancas (nome, sigla) VALUES
('CESPE/CEBRASPE', 'CESPE'),
('FCC - Fundação Carlos Chagas', 'FCC'),
('VUNESP', 'VUNESP'),
('FGV', 'FGV'),
('IBFC', 'IBFC')
ON CONFLICT (nome) DO NOTHING;

-- Inserir Órgãos (se não existirem)
INSERT INTO orgaos (nome, sigla, tipo) VALUES
('Polícia Federal', 'PF', 'federal'),
('Polícia Rodoviária Federal', 'PRF', 'federal'),
('Polícia Militar de São Paulo', 'PM-SP', 'estadual'),
('Polícia Civil de São Paulo', 'PC-SP', 'estadual'),
('Tribunal de Justiça de SP', 'TJ-SP', 'estadual')
ON CONFLICT (sigla) DO NOTHING;

-- Inserir Disciplinas (se não existirem)
INSERT INTO disciplinas (nome, slug, icone, ordem) VALUES
('Direito Constitucional', 'direito-constitucional', 'Landmark', 1),
('Direito Penal', 'direito-penal', 'Gavel', 2),
('Direito Processual Penal', 'direito-processual-penal', 'Scale', 3),
('Direito Administrativo', 'direito-administrativo', 'Building2', 4)
ON CONFLICT (slug) DO NOTHING;

-- Questões de Teste - Direito Constitucional
INSERT INTO questoes (
  banca_id,
  orgao_id,
  disciplina_id,
  ano,
  cargo,
  enunciado,
  alternativa_a,
  alternativa_b,
  alternativa_c,
  alternativa_d,
  alternativa_e,
  gabarito,
  explicacao,
  dificuldade
) VALUES

-- Questão 1: CF/88 - Direitos Fundamentais
(
  (SELECT id FROM bancas WHERE sigla = 'CESPE' LIMIT 1),
  (SELECT id FROM orgaos WHERE sigla = 'PF' LIMIT 1),
  (SELECT id FROM disciplinas WHERE slug = 'direito-constitucional' LIMIT 1),
  2024,
  'Agente de Polícia Federal',
  'De acordo com a Constituição Federal de 1988, qual dos direitos e garantias fundamentais abaixo está CORRETAMENTE descrito?',
  'A casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial.',
  'É livre a manifestação do pensamento, sendo permitido o anonimato.',
  'É livre a expressão da atividade intelectual, artística, científica e de comunicação, dependendo de censura ou licença.',
  'São invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas, sendo assegurado o direito a indenização apenas pelo dano material decorrente de sua violação.',
  'A prática do racismo constitui crime inafiançável e imprescritível, sujeito à pena de reclusão de até 5 anos.',
  'A',
  'Alternativa A: CORRETA. Art. 5º, XI da CF/88: "a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial."\n\nAlternativa B: INCORRETA. É vedado o anonimato (Art. 5º, IV).\n\nAlternativa C: INCORRETA. É livre, independendo de censura ou licença (Art. 5º, IX).\n\nAlternativa D: INCORRETA. Assegurado direito a indenização por dano material OU moral (Art. 5º, X).\n\nAlternativa E: INCORRETA. O racismo é crime inafiançável e imprescritível, sujeito à pena de reclusão (Art. 5º, XLII), mas sem limite temporal.',
  'media'
),

-- Questão 2: CF/88 - Princípios Fundamentais
(
  (SELECT id FROM bancas WHERE sigla = 'FCC' LIMIT 1),
  (SELECT id FROM orgaos WHERE sigla = 'TJ-SP' LIMIT 1),
  (SELECT id FROM disciplinas WHERE slug = 'direito-constitucional' LIMIT 1),
  2023,
  'Escrevente Técnico Judiciário',
  'São Poderes da União, independentes e harmônicos entre si:',
  'Legislativo, Executivo e Judiciário.',
  'Legislativo Federal, Legislativo Estadual e Legislativo Municipal.',
  'Executivo Federal, Executivo Estadual e Executivo Municipal.',
  'Legislativo, Executivo, Judiciário e Ministério Público.',
  'Câmara dos Deputados, Senado Federal e Supremo Tribunal Federal.',
  'A',
  'Alternativa A: CORRETA. Conforme Art. 2º da CF/88: "São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário."\n\nAs demais alternativas não correspondem ao texto constitucional.\n\nO Ministério Público, embora seja função essencial à Justiça, não é considerado um "Poder" da República.',
  'facil'
),

-- Questão 3: Direito Penal - Crimes contra a pessoa
(
  (SELECT id FROM bancas WHERE sigla = 'VUNESP' LIMIT 1),
  (SELECT id FROM orgaos WHERE sigla = 'PM-SP' LIMIT 1),
  (SELECT id FROM disciplinas WHERE slug = 'direito-penal' LIMIT 1),
  2024,
  'Soldado PM 2ª Classe',
  'Segundo o Código Penal, o crime de homicídio simples está previsto no artigo:',
  'Art. 119',
  'Art. 120',
  'Art. 121',
  'Art. 122',
  'Art. 123',
  'C',
  'Alternativa C: CORRETA. O crime de homicídio está tipificado no Art. 121 do Código Penal: "Matar alguém: Pena - reclusão, de seis a vinte anos."\n\nOs demais artigos tratam de:\n- Art. 119: Rixa\n- Art. 120: (Revogado)\n- Art. 122: Induzimento, instigação ou auxílio a suicídio\n- Art. 123: Infanticídio',
  'facil'
),

-- Questão 4: Direito Penal - Excludentes de Ilicitude
(
  (SELECT id FROM bancas WHERE sigla = 'CESPE' LIMIT 1),
  (SELECT id FROM orgaos WHERE sigla = 'PRF' LIMIT 1),
  (SELECT id FROM disciplinas WHERE slug = 'direito-penal' LIMIT 1),
  2023,
  'Policial Rodoviário Federal',
  'Não há crime quando o agente pratica o fato em legítima defesa. Para caracterização da legítima defesa, é necessário que a agressão seja:',
  'Injusta, atual ou iminente, e que a reação seja proporcional.',
  'Justa, atual ou iminente, e que a reação seja proporcional.',
  'Injusta, passada, e que a reação seja desproporcional.',
  'Justa, futura, e que a reação seja proporcional.',
  'Injusta, atual, e que a reação seja sempre desproporcional.',
  'A',
  'Alternativa A: CORRETA. Conforme Art. 25 do CP: "Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem."\n\nRequisitos da legítima defesa:\n1. Agressão injusta (ilícita)\n2. Atual ou iminente\n3. Direito próprio ou de terceiro\n4. Meio necessário\n5. Moderação (proporcionalidade)',
  'media'
),

-- Questão 5: Direito Administrativo - Princípios
(
  (SELECT id FROM bancas WHERE sigla = 'FGV' LIMIT 1),
  (SELECT id FROM orgaos WHERE sigla = 'PC-SP' LIMIT 1),
  (SELECT id FROM disciplinas WHERE slug = 'direito-administrativo' LIMIT 1),
  2024,
  'Investigador de Polícia',
  'São princípios expressos da Administração Pública, previstos no caput do Art. 37 da Constituição Federal:',
  'Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência.',
  'Legalidade, Moralidade, Razoabilidade, Publicidade e Proporcionalidade.',
  'Impessoalidade, Moralidade, Finalidade, Publicidade e Eficiência.',
  'Legalidade, Impessoalidade, Supremacia do Interesse Público, Publicidade e Eficiência.',
  'Legalidade, Moralidade, Publicidade, Eficiência e Indisponibilidade do Interesse Público.',
  'A',
  'Alternativa A: CORRETA. O Art. 37, caput da CF/88 estabelece: "A administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência (...)"\n\nMnemônico: LIMPE\nL - Legalidade\nI - Impessoalidade\nM - Moralidade\nP - Publicidade\nE - Eficiência',
  'facil'
),

-- Questão 6: Direito Processual Penal - Prisão em Flagrante
(
  (SELECT id FROM bancas WHERE sigla = 'IBFC' LIMIT 1),
  (SELECT id FROM orgaos WHERE sigla = 'PF' LIMIT 1),
  (SELECT id FROM disciplinas WHERE slug = 'direito-processual-penal' LIMIT 1),
  2023,
  'Agente de Polícia Federal',
  'Segundo o Código de Processo Penal, considera-se em flagrante delito quem:',
  'Está cometendo a infração penal, acaba de cometê-la, é perseguido logo após, ou é encontrado logo depois com instrumentos que façam presumir ser ele autor da infração.',
  'Está cometendo a infração penal ou acaba de cometê-la, apenas.',
  'É denunciado por testemunhas, mesmo sem qualquer prova material.',
  'É perseguido pela polícia, independentemente do tempo decorrido desde o crime.',
  'É encontrado com objetos roubados, mesmo que após meses do crime.',
  'A',
  'Alternativa A: CORRETA. Art. 302 do CPP estabelece as quatro modalidades de flagrante:\n\nI - Flagrante próprio/real: está cometendo a infração\nII - Flagrante próprio/real: acaba de cometê-la\nIII - Flagrante impróprio/irreal/quase-flagrante: é perseguido, logo após, pela autoridade, pelo ofendido ou por qualquer pessoa\nIV - Flagrante presumido/ficto: é encontrado, logo depois, com instrumentos, armas, objetos ou papéis que façam presumir ser ele autor da infração',
  'media'
),

-- Questão 7: Direito Penal - Concurso de Crimes
(
  (SELECT id FROM bancas WHERE sigla = 'CESPE' LIMIT 1),
  (SELECT id FROM orgaos WHERE sigla = 'PRF' LIMIT 1),
  (SELECT id FROM disciplinas WHERE slug = 'direito-penal' LIMIT 1),
  2024,
  'Policial Rodoviário Federal',
  'No concurso material de crimes, a pena aplicada será:',
  'A soma das penas de cada crime.',
  'A média aritmética das penas.',
  'A pena do crime mais grave, aumentada de 1/6 a 1/2.',
  'Apenas a pena do crime mais grave.',
  'A pena do crime mais grave, aumentada até o triplo.',
  'A',
  'Alternativa A: CORRETA. Art. 69 do CP: "Quando o agente, mediante mais de uma ação ou omissão, pratica dois ou mais crimes, idênticos ou não, aplicam-se cumulativamente as penas privativas de liberdade em que haja incorrido."\n\nRegra: SOMA das penas (sistema do cúmulo material).\n\nObservação: No concurso formal (Art. 70) e no crime continuado (Art. 71), aplica-se a pena do crime mais grave AUMENTADA.\n\nPortanto, as alternativas se referem a institutos diferentes:\n- Concurso material (Art. 69): SOMA\n- Concurso formal/Crime continuado: AUMENTO sobre a mais grave',
  'media'
);

-- Comentário
COMMENT ON TABLE questoes IS 'Questões populadas com 7 exemplos para teste';
