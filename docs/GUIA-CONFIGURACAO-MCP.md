# 🔌 Guia de Configuração MCP - KAV Concursos

**Última Atualização:** 23 de Outubro de 2025

---

## 📋 O que é MCP?

**Model Context Protocol (MCP)** é um protocolo padrão que permite que LLMs (como Claude) se conectem a plataformas externas como Supabase, GitHub, sistemas de arquivos, etc.

Com MCPs configurados, o Claude Code pode:
- ✅ Consultar diretamente seu banco de dados Supabase
- ✅ Executar queries SQL e ver resultados
- ✅ Criar/modificar tabelas, RLS policies, triggers
- ✅ Buscar informações na web
- ✅ Interagir com GitHub (issues, PRs, etc.)
- ✅ Usar "pensamento sequencial" para problemas complexos

---

## 🚀 Configuração Rápida

### 1. Criar arquivo `.mcp.json`

Copie o arquivo de exemplo:
```bash
cp .mcp.json.example .mcp.json
```

### 2. Configurar credenciais

Edite `.mcp.json` e substitua:

- **`PROJECT_REF`**: O ID do seu projeto Supabase (ex: `qujgtdpgvbsbbytefzjx`)
- **`YOUR_DB_PASSWORD`**: A senha do banco de dados Supabase
- **`/absolute/path/to/your/project`**: Caminho absoluto do projeto

### 3. Adicionar variável de ambiente (se necessário)

Se usar o servidor GitHub MCP, adicione ao `.env`:
```env
GITHUB_TOKEN=ghp_your_github_personal_access_token
```

### 4. Reiniciar Claude Code

Feche e reabra o Claude Code para que as configurações sejam carregadas.

---

## 🔧 MCPs Configurados

### 1. **Supabase MCP** (PostgreSQL)

**Pacote:** `@modelcontextprotocol/server-postgres`

**Funcionalidades:**
- Consultar tabelas (`SELECT * FROM profiles`)
- Criar/modificar schema
- Executar migrations
- Ver RLS policies
- Executar queries complexas

**Configuração:**
```json
{
  "supabase": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-postgres",
      "postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
    ]
  }
}
```

**Como obter a senha do banco:**
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em `Settings` → `Database`
3. Copie a senha em `Connection string` → `Direct connection`

---

### 2. **Sequential Thinking MCP**

**Pacote:** `@modelcontextprotocol/server-sequential-thinking`

**Funcionalidades:**
- Permite que Claude "pense em voz alta" para problemas complexos
- Quebra tarefas grandes em etapas menores
- Muito útil para debugging e arquitetura

**Configuração:**
```json
{
  "sequential-thinking": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  }
}
```

**Quando usar:**
- Problemas de arquitetura complexos
- Debugging de bugs difíceis
- Planejamento de features grandes
- Otimização de performance

---

### 3. **Filesystem MCP**

**Pacote:** `@modelcontextprotocol/server-filesystem`

**Funcionalidades:**
- Leitura/escrita de arquivos
- Navegação em diretórios
- Busca de arquivos

**Configuração:**
```json
{
  "filesystem": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "C:\\Users\\Pedro\\Projetos\\caveira-concursos"
    ]
  }
}
```

---

### 4. **Fetch MCP**

**Pacote:** `@modelcontextprotocol/server-fetch`

**Funcionalidades:**
- Buscar conteúdo de URLs
- Fazer requisições HTTP
- Útil para pesquisar documentação, APIs, etc.

**Configuração:**
```json
{
  "fetch": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-fetch"]
  }
}
```

---

### 5. **GitHub MCP** (Opcional)

**Pacote:** `@modelcontextprotocol/server-github`

**Funcionalidades:**
- Criar/listar issues
- Criar/revisar Pull Requests
- Buscar código no GitHub

**Configuração:**
```json
{
  "github": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

**Como criar GitHub Token:**
1. Acesse [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Clique em `Generate new token (classic)`
3. Selecione escopos: `repo`, `read:org`, `gist`
4. Copie o token e adicione ao `.env`

---

## 🧪 Testando os MCPs

Após reiniciar o Claude Code, teste os MCPs:

### Teste Supabase MCP:
Peça ao Claude:
> "Liste todas as tabelas do banco de dados usando o MCP do Supabase"

### Teste Sequential Thinking:
Peça ao Claude:
> "Use sequential thinking para planejar como implementar o sistema de comentários"

### Teste Fetch MCP:
Peça ao Claude:
> "Busque a documentação mais recente do Next.js 14 usando fetch"

---

## 🔒 Segurança

### ⚠️ NUNCA commitar `.mcp.json`

O arquivo `.mcp.json` contém credenciais sensíveis e **DEVE** estar no `.gitignore`:

```gitignore
# Claude Code
.claude/
.mcp.json
```

### ✅ Usar variáveis de ambiente

Sempre que possível, use variáveis de ambiente (`${VAR_NAME}`) no `.mcp.json`:

```json
{
  "env": {
    "API_KEY": "${MY_API_KEY}"
  }
}
```

---

## 🛠️ Troubleshooting

### "MCP server not found"

**Solução:**
- Verifique se o nome do pacote está correto
- Tente executar manualmente: `npx -y @modelcontextprotocol/server-postgres`
- Reinicie o Claude Code

### "Connection refused" (Supabase)

**Solução:**
- Verifique se a senha do banco está correta
- Confirme que o `PROJECT_REF` está correto
- Teste a conexão usando `psql` ou outro cliente PostgreSQL

### "Environment variable not found"

**Solução:**
- Adicione a variável ao arquivo `.env`
- Reinicie o Claude Code para recarregar variáveis de ambiente

### MCPs não aparecem no Claude Code

**Solução:**
- Certifique-se de que `.mcp.json` está na raiz do projeto
- Verifique a sintaxe JSON (sem vírgulas extras, aspas corretas)
- Reinicie completamente o Claude Code

---

## 📚 Recursos Adicionais

- [Documentação Oficial MCP](https://modelcontextprotocol.io/docs)
- [Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [Claude Code Settings](https://docs.claude.com/en/docs/claude-code/settings)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)

---

## 🎯 Próximos Passos

Após configurar os MCPs, você pode:

1. ✅ Pedir ao Claude para revisar o schema do banco
2. ✅ Solicitar criação de migrations com base no schema
3. ✅ Pedir para otimizar queries SQL existentes
4. ✅ Usar sequential thinking para planejar features complexas
5. ✅ Buscar documentação atualizada automaticamente

---

**Autor:** Pedro
**Versão:** 1.0
**Projeto:** KAV Concursos
