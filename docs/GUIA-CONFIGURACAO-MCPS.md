# Guia de Configuração de MCPs para Claude Code

**Data:** 23/10/2025  
**Objetivo:** Habilitar Model Context Protocol servers no Claude Code (VS Code Extension)

---

## 📍 Localização do Arquivo

O arquivo de configuração foi criado em:

```
C:\Users\Pedro\AppData\Roaming\Claude\claude_desktop_config.json
```

---

## 🔧 MCPs Configurados

Os seguintes MCPs estão disponíveis para uso:

### 1. **Memory MCP** (`@modelcontextprotocol/server-memory`)

- Armazena informações entre conversas
- Útil para lembrar contexto de projetos

### 2. **Sequential Thinking MCP** (`@modelcontextprotocol/server-sequential-thinking`)

- Resolve problemas complexos passo a passo
- Útil para debugging e planejamento

### 3. **Supabase MCP** (`@modelcontextprotocol/server-supabase`)

- Gerencia banco de dados Supabase
- Cria migrations, aplica schemas, executa queries
- ⚠️ **Requer configuração de token**

### 4. **Stripe MCP** (`@stripe/mcp-server`)

- Gerencia pagamentos Stripe
- Cria produtos, preços, assinaturas
- ⚠️ **Requer configuração de API key**

### 5. **Playwright MCP** (`@modelcontextprotocol/server-playwright`)

- Automação de browser
- Testes E2E, web scraping

### 6. **DeepWiki MCP** (`@zaidhuda/server-deepwiki`)

- Busca informações em repositórios GitHub
- Lê wikis e documentação

---

## ⚙️ Configurar Tokens Sensíveis

### Supabase Token

1. Acesse: https://supabase.com/dashboard
2. Vá em: Settings → Access Tokens
3. Crie um novo token
4. Edite o arquivo de configuração:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_seu_token_real_aqui"
      }
    }
  }
}
```

### Stripe API Key

1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie sua Secret Key (começa com `sk_`)
3. Edite o arquivo de configuração:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_seu_key_real_aqui"
      }
    }
  }
}
```

---

## 🚀 Como Ativar no Claude Code

### Método 1: Reiniciar VS Code

1. Feche completamente o VS Code
2. Abra novamente
3. Abra o Claude Code (extensão)
4. Os MCPs estarão disponíveis automaticamente

### Método 2: Recarregar Extensão

1. No VS Code, pressione `Ctrl + Shift + P`
2. Digite: "Developer: Reload Window"
3. Pressione Enter
4. Abra o Claude Code novamente

---

## 🧪 Testar MCPs

### Teste 1: Verificar MCPs Carregados

No Claude Code, pergunte:

```
Quais MCPs você tem disponíveis?
```

Você deve ver a lista de MCPs configurados.

### Teste 2: Sequential Thinking

```
Use sequential thinking para planejar uma feature de comentários
```

### Teste 3: Supabase (se configurado)

```
Liste meus projetos Supabase
```

### Teste 4: Stripe (se configurado)

```
Liste meus produtos no Stripe
```

---

## ⚠️ Troubleshooting

### Problema: MCPs não aparecem

**Solução:**

1. Verifique se o arquivo JSON está válido (sem vírgulas extras)
2. Reinicie o VS Code completamente
3. Verifique se Node.js está instalado: `node --version`

### Problema: Supabase MCP não funciona

**Causa:** Token não configurado ou inválido

**Solução:**

1. Verifique se o token está correto
2. Confirme que tem permissões necessárias
3. Teste o token no dashboard do Supabase

### Problema: Stripe MCP não funciona

**Causa:** API Key não configurada ou inválida

**Solução:**

1. Verifique se está usando Secret Key (não Publishable Key)
2. Confirme que a key está ativa
3. Teste a key no dashboard do Stripe

### Problema: "npx: command not found"

**Causa:** Node.js não instalado ou não no PATH

**Solução:**

```powershell
# Verificar Node.js
node --version

# Se não estiver instalado, baixe em:
# https://nodejs.org/
```

---

## 📝 Configuração Recomendada para Desenvolvimento

Para o projeto KAV Concursos, recomendo:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "SEU_TOKEN_SUPABASE"
      }
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server"],
      "env": {
        "STRIPE_SECRET_KEY": "SEU_STRIPE_KEY"
      }
    },
    "deepwiki": {
      "command": "npx",
      "args": ["-y", "@zaidhuda/server-deepwiki"]
    }
  }
}
```

**Por quê:**

- ✅ **Sequential Thinking**: Planejamento de features complexas
- ✅ **Supabase**: Gerenciar banco de dados e migrations
- ✅ **Stripe**: Gerenciar pagamentos e assinaturas
- ✅ **DeepWiki**: Consultar documentação técnica

---

## 🔐 Segurança

### ⚠️ NUNCA faça commit do arquivo de configuração!

Se você versionar acidentalmente:

```powershell
# Remover do git
git rm --cached "%APPDATA%\Claude\claude_desktop_config.json"

# Adicionar ao .gitignore (se tiver um repositório separado)
echo "claude_desktop_config.json" >> .gitignore
```

### ✅ Use variáveis de ambiente (alternativa)

Em vez de colocar tokens diretamente no JSON, você pode usar variáveis de ambiente do Windows:

```powershell
# Definir variáveis de ambiente (persistentes)
[System.Environment]::SetEnvironmentVariable('SUPABASE_ACCESS_TOKEN', 'seu_token', 'User')
[System.Environment]::SetEnvironmentVariable('STRIPE_SECRET_KEY', 'seu_key', 'User')
```

Depois, no JSON:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"]
      // Token será lido do ambiente automaticamente
    }
  }
}
```

---

## 📚 Documentação Oficial

- **Claude MCP Docs**: https://docs.anthropic.com/en/docs/model-context-protocol
- **Supabase MCP**: https://github.com/modelcontextprotocol/servers/tree/main/src/supabase
- **Stripe MCP**: https://github.com/stripe/mcp-server
- **Sequential Thinking**: https://github.com/modelcontextprotocol/servers/tree/main/src/sequential-thinking

---

## ✅ Checklist Pós-Configuração

- [ ] Arquivo `claude_desktop_config.json` criado
- [ ] Tokens Supabase e Stripe configurados (se aplicável)
- [ ] VS Code reiniciado
- [ ] Claude Code aberto e testado
- [ ] MCPs listados corretamente
- [ ] Teste de Sequential Thinking funcionando
- [ ] Teste de Supabase funcionando (se configurado)
- [ ] Teste de Stripe funcionando (se configurado)

---

**Pronto!** 🎉 Seus MCPs estão configurados e prontos para uso no Claude Code!

**Próximos Passos:**

1. Configure os tokens sensíveis (Supabase e Stripe)
2. Reinicie o VS Code
3. Teste os MCPs
4. Comece a usar na implementação do v2.0!

---

**Última Atualização:** 23/10/2025  
**Autor:** GitHub Copilot Assistant
