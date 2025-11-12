# 🌱 Sistema de Seeds - Leis e Artigos

Sistema automatizado para importar leis brasileiras (CF/88, CP, CPP, etc.) com todos os seus artigos para o banco de dados Supabase.

---

## 📁 Estrutura de Arquivos

```
scripts/seed/
├── README-SEEDS.md              # Este arquivo
├── scraper-cf88.ts              # 🔍 Web scraper da CF/88
├── import-lei.ts                # 📥 Importador para Supabase
└── leis/
    ├── cf88-essencial.json      # ⭐ 22 artigos mais cobrados (manual)
    └── cf88-completa.json       # 📚 250 artigos completos (gerado pelo scraper)
```

---

## 🚀 Como Usar

### **Passo 1: Extrair CF/88 do Site Oficial**

Execute o web scraper que vai baixar TODOS os artigos da CF/88 direto do Planalto:

```bash
npm run seed:scrape-cf88
```

**O que acontece:**
- ✅ Faz download da CF/88 do site oficial
- ✅ Extrai todos os 250 artigos automaticamente
- ✅ Detecta estrutura hierárquica (Títulos, Capítulos, Seções)
- ✅ Identifica artigos mais cobrados
- ✅ Gera palavras-chave automaticamente
- ✅ Cria `leis/cf88-completa.json`

**Saída esperada:**
```
🏛️  SCRAPER DA CONSTITUIÇÃO FEDERAL DE 1988
============================================================

📡 Fazendo download de: https://www.planalto.gov.br/...
✅ Download concluído!

🔧 Processando HTML...

📖 TÍTULO I - Dos Princípios Fundamentais
    ✓ Art. 1º (A República Federativa do Brasil...)
    ✓ Art. 2º (São Poderes da União...)
...
✅ Total de artigos extraídos: 250

💾 Salvando em: scripts/seed/leis/cf88-completa.json
✅ SCRAPING CONCLUÍDO COM SUCESSO!
```

---

### **Passo 2: Importar para o Banco de Dados**

Importe o JSON gerado para o Supabase:

```bash
npm run seed:import cf88-completa.json
```

**O que acontece:**
- ✅ Conecta no Supabase usando `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Busca a disciplina "Direito Constitucional"
- ✅ Insere a lei CF/88
- ✅ Insere todos os 250 artigos em lotes de 50
- ✅ Exibe progresso em tempo real

**Saída esperada:**
```
🚀 IMPORTADOR DE LEIS PARA O SUPABASE
============================================================

📖 Lendo arquivo: scripts/seed/leis/cf88-completa.json
✅ Arquivo carregado com sucesso!
   - Lei: CF/88
   - Total de artigos: 250

🔍 Buscando disciplina: direito-constitucional...
✅ Disciplina encontrada! ID: 1

📝 Inserindo lei no banco de dados...
✅ Lei inserida! ID: 1

📚 Inserindo 250 artigos...

   ✓ Batch 1/5 - 50/250 artigos (20%)
   ✓ Batch 2/5 - 100/250 artigos (40%)
   ✓ Batch 3/5 - 150/250 artigos (60%)
   ✓ Batch 4/5 - 200/250 artigos (80%)
   ✓ Batch 5/5 - 250/250 artigos (100%)

✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!

📊 Estatísticas Finais:
   - Lei inserida: CF/88 (ID: 1)
   - Artigos inseridos: 250
   - Artigos com erro: 0
   - Taxa de sucesso: 100.0%

🎉 Acesse o painel admin para visualizar!
   http://localhost:3000/admin/configuracoes/leis
   http://localhost:3000/admin/configuracoes/artigos
```

---

## 🎯 Artigos Marcados como "Muito Cobrados"

O scraper identifica automaticamente os artigos mais cobrados em concursos:

- ⭐ Art. 1º - Fundamentos da República
- ⭐ Art. 2º - Separação dos Poderes
- ⭐ Art. 3º - Objetivos Fundamentais
- ⭐ Art. 4º - Relações Internacionais
- ⭐ Art. 5º - Direitos Fundamentais (78 incisos!)
- ⭐ Art. 37 - Princípios da Administração Pública (LIMPE)
- ⭐ Art. 93 - Estatuto da Magistratura
- ⭐ Art. 144 - Segurança Pública
- ⭐ Art. 205 - Educação
- ⭐ Art. 225 - Meio Ambiente

Estes artigos recebem:
- `is_muito_cobrado: true`
- `peso_edital: 5` (máximo)

---

## 📊 Formato do JSON Gerado

```json
{
  "lei": {
    "nome": "Constituição da República Federativa do Brasil de 1988",
    "nome_curto": "CF/88",
    "sigla": "CF",
    "disciplina_slug": "direito-constitucional",
    "total_artigos": 250,
    "is_mais_cobrada": true
  },
  "artigos": [
    {
      "numero": "Art. 1º",
      "titulo": "Fundamentos da República",
      "texto_completo": "A República Federativa do Brasil...",
      "texto_formatado": "A <strong>República</strong>...",
      "capitulo": "Título I - Dos Princípios Fundamentais",
      "secao": null,
      "is_muito_cobrado": true,
      "peso_edital": 5,
      "ordem": 1,
      "palavras_chave": ["república", "soberania", "cidadania"]
    }
  ]
}
```

---

## 🔧 Troubleshooting

### ❌ Erro: "Variáveis de ambiente não configuradas"

**Solução:** Certifique-se de ter o arquivo `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui
```

⚠️ **IMPORTANTE:** Use `SUPABASE_SERVICE_ROLE_KEY` (não a chave anon pública!)

---

### ❌ Erro: "Disciplina não encontrada"

**Solução:** Execute a migração de disciplinas primeiro:

```sql
-- Inserir disciplinas básicas
INSERT INTO disciplinas (nome, slug, ordem) VALUES
  ('Direito Constitucional', 'direito-constitucional', 1),
  ('Direito Penal', 'direito-penal', 2),
  ('Direito Processual Penal', 'direito-processual-penal', 3);
```

Ou use o painel admin: `/admin/configuracoes/disciplinas`

---

### ❌ Erro ao fazer scraping (timeout/403)

**Solução:** O site do Planalto pode ter bloqueado temporariamente. Aguarde alguns minutos e tente novamente.

Alternativa: Use o `cf88-essencial.json` (22 artigos curados manualmente):

```bash
npm run seed:import cf88-essencial.json
```

---

## 🆕 Adicionando Novas Leis

### **1. Criar JSON Manualmente**

Crie um arquivo em `scripts/seed/leis/cp.json`:

```json
{
  "lei": {
    "nome": "Código Penal - Decreto-Lei nº 2.848/1940",
    "nome_curto": "Código Penal",
    "sigla": "CP",
    "numero_lei": "Decreto-Lei 2.848/1940",
    "disciplina_slug": "direito-penal",
    "total_artigos": 361,
    "is_mais_cobrada": true
  },
  "artigos": [
    {
      "numero": "Art. 121",
      "titulo": "Homicídio Simples",
      "texto_completo": "Matar alguém: Pena - reclusão, de 6 a 20 anos.",
      "is_muito_cobrado": true,
      "peso_edital": 5,
      "ordem": 121,
      "palavras_chave": ["homicídio", "matar", "vida"]
    }
  ]
}
```

**Importar:**
```bash
npm run seed:import cp.json
```

---

### **2. Criar Novo Scraper**

Copie `scraper-cf88.ts` e adapte para a nova lei:

```typescript
// scripts/seed/scraper-cp.ts
const url = 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm';
// Adaptar lógica de parsing...
```

Executar:
```bash
tsx scripts/seed/scraper-cp.ts
```

---

## 🎨 Campos Opcionais

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `titulo` | Nome informal do artigo | "Homicídio Simples" |
| `texto_formatado` | HTML com `<strong>` em palavras-chave | Para destaque no frontend |
| `capitulo` | Título/Capítulo da lei | "Título II - Dos Crimes" |
| `secao` | Seção da lei | "Capítulo I - Dos Crimes Contra a Vida" |
| `is_muito_cobrado` | Artigo muito cobrado? | `true` = Badge amarelo na UI |
| `peso_edital` | Importância (1-5) | 5 = ⭐⭐⭐⭐⭐ |
| `palavras_chave` | Array de palavras | `["homicídio", "matar"]` |

---

## 📈 Roadmap Futuro

- [ ] Scraper do Código Penal (CP - 361 artigos)
- [ ] Scraper do CPP (811 artigos)
- [ ] Scraper de Leis Especiais (Lei Maria da Penha, ECA, etc.)
- [ ] Interface web para importação via drag & drop
- [ ] Validação automática de duplicatas
- [ ] Sistema de versionamento de leis (emendas constitucionais)
- [ ] Extração de jurisprudência (STF/STJ)

---

## 🔗 Links Úteis

- **CF/88 Oficial:** https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
- **CP Oficial:** https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm
- **CPP Oficial:** https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm

---

## 👨‍💻 Contribuindo

Para adicionar novas leis ao sistema:

1. Crie um scraper específico ou JSON manual
2. Teste localmente: `npm run seed:import seu-arquivo.json`
3. Valide no painel admin
4. Commit do JSON gerado em `scripts/seed/leis/`

---

**Última Atualização:** Novembro 2025
**Versão:** 1.0.0
