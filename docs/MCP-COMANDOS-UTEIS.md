# 🎯 Comandos Úteis para MCPs - KAV Concursos

**Versão:** 1.0
**Data:** 23 de Outubro de 2025

Este documento contém comandos/prompts prontos para usar com Claude Code quando os MCPs estiverem configurados.

---

## 🗄️ Supabase MCP (Banco de Dados)

### Análise e Exploração

```
Liste todas as tabelas do banco de dados com suas colunas
```

```
Mostre a estrutura completa da tabela 'cadernos' incluindo tipos, constraints e índices
```

```
Analise todas as RLS policies ativas e identifique possíveis problemas de segurança
```

```
Liste todos os índices existentes e sugira novos baseado nas queries mais comuns
```

### Consultas de Dados

```
Mostre os últimos 10 cadernos criados com informações de usuário e disciplina
```

```
Calcule a taxa de acerto média por disciplina dos últimos 30 dias
```

```
Liste os 5 usuários mais ativos (mais questões respondidas) do mês atual
```

```
Mostre a distribuição de usuários por plano (FREE, BASIC, PREMIUM)
```

### Otimização e Performance

```
Identifique queries lentas no banco e sugira otimizações (índices, rewrites)
```

```
Analise o tamanho das tabelas e identifique possíveis problemas de crescimento
```

```
Revise as RLS policies e sugira otimizações para reduzir overhead
```

### Migrations e Schema

```
Crie uma migration para adicionar a tabela 'questoes_comentarios' conforme docs/03-DATABASE-SCHEMA.md
```

```
Gere uma migration para adicionar índice composto em (user_id, created_at) na tabela respostas_usuarios
```

```
Crie RLS policies para a tabela 'cadernos' permitindo que usuários vejam apenas seus próprios cadernos
```

---

## 🧠 Sequential Thinking MCP (Planejamento Complexo)

### Arquitetura e Design

```
Use sequential thinking para planejar a implementação completa do sistema de comentários com paywalls por plano
```

```
Pense em voz alta sobre como implementar cadernos inteligentes com IA que recomendam questões baseado em fraquezas do usuário
```

```
Analise passo a passo como implementar o sistema de pagamentos Stripe com webhooks e sincronização de planos
```

### Debugging e Troubleshooting

```
Use sequential thinking para debugar por que as RLS policies estão bloqueando queries legítimas
```

```
Pense passo a passo sobre por que o middleware de autenticação está causando redirect loops
```

### Refactoring

```
Use sequential thinking para planejar refatoração do sistema de questões para remover código legado standalone
```

```
Analise passo a passo como otimizar a performance da página de dashboard que está lenta
```

---

## 🌐 Fetch MCP (Buscar Documentação)

### Next.js e React

```
Busque as melhores práticas mais recentes para Server Components no Next.js 14
```

```
Procure exemplos de implementação de streaming com React Suspense no Next.js
```

```
Busque a documentação oficial do Next.js sobre otimização de imagens com next/image
```

### Supabase

```
Busque exemplos de RLS policies complexas para multi-tenancy no Supabase
```

```
Procure best practices para Edge Functions no Supabase com TypeScript
```

```
Busque guias sobre como implementar realtime subscriptions com Supabase e React
```

### Stripe

```
Busque exemplos completos de implementação de Stripe Checkout com Next.js 14 App Router
```

```
Procure documentação sobre como lidar com webhooks do Stripe de forma segura
```

```
Busque exemplos de implementação de billing portal do Stripe para gerenciar assinaturas
```

### TanStack Query

```
Busque as melhores práticas para invalidação de cache no TanStack Query v5
```

```
Procure exemplos de implementação de optimistic updates com TanStack Query
```

---

## 📂 Filesystem MCP (Operações de Arquivos)

### Análise de Código

```
Analise todos os componentes em src/components/dashboard/ e identifique código duplicado
```

```
Liste todos os arquivos que importam createClient do Supabase e verifique se estão usando a versão correta (server vs client)
```

```
Encontre todos os lugares onde fazemos queries ao banco e verifique se estão tratando erros adequadamente
```

### Busca e Refatoração

```
Encontre todos os usos de 'any' no código TypeScript e sugira tipos adequados
```

```
Liste todos os componentes que não têm acessibilidade (ARIA labels, keyboard navigation)
```

```
Encontre todos os console.log no código e substitua por um logger adequado
```

---

## 🐙 GitHub MCP (Integração Git)

### Issues e Pull Requests

```
Liste as 5 issues abertas mais antigas no repositório
```

```
Crie uma issue para implementar o sistema de comentários com checklist de tarefas
```

```
Analise os últimos 10 commits e identifique patterns (bugs recorrentes, áreas que mudam muito)
```

### Code Review

```
Revise o último PR criado e sugira melhorias de código, segurança e performance
```

```
Liste todos os PRs abertos e identifique quais estão prontos para merge
```

---

## 🎯 Comandos Compostos (Múltiplos MCPs)

### Planejamento + Implementação

```
1. Use sequential thinking para planejar a implementação de comentários
2. Consulte o banco para ver a estrutura atual
3. Busque exemplos de sistemas similares
4. Crie as migrations necessárias
5. Gere os componentes React
```

### Análise Completa de Feature

```
Analise completamente a feature de Cadernos:
1. Revise o schema do banco (Supabase MCP)
2. Analise os componentes React (Filesystem MCP)
3. Busque best practices para features similares (Fetch MCP)
4. Sugira melhorias arquiteturais (Sequential Thinking MCP)
```

### Debugging Completo

```
Debug o problema de performance na página de cadernos:
1. Analise as queries do banco (Supabase MCP)
2. Revise o código dos componentes (Filesystem MCP)
3. Busque técnicas de otimização (Fetch MCP)
4. Pense passo a passo na solução (Sequential Thinking MCP)
```

---

## 💡 Dicas de Uso

### 1. Seja Específico
❌ "Analise o banco"
✅ "Liste todas as tabelas com mais de 10.000 registros e mostre índices existentes"

### 2. Combine MCPs
✅ "Use sequential thinking para planejar, depois busque exemplos na web, e finalmente crie as migrations"

### 3. Contextualize
✅ "Conforme descrito em docs/03-DATABASE-SCHEMA.md, crie a migration para..."

### 4. Iteração
✅ "Com base na análise anterior, agora otimize as queries identificadas"

---

## 🚀 Workflows Recomendados

### Implementar Nova Feature

1. **Planejamento:**
   ```
   Use sequential thinking para planejar a implementação de [feature]
   ```

2. **Pesquisa:**
   ```
   Busque exemplos e best practices para [feature] em Next.js 14
   ```

3. **Schema:**
   ```
   Crie as migrations necessárias para [feature] no Supabase
   ```

4. **Implementação:**
   ```
   Crie os componentes React para [feature] seguindo padrões do projeto
   ```

5. **Testes:**
   ```
   Analise o código criado e sugira casos de teste
   ```

### Otimizar Performance

1. **Análise:**
   ```
   Identifique queries lentas no banco e componentes pesados
   ```

2. **Planejamento:**
   ```
   Use sequential thinking para priorizar otimizações por impacto
   ```

3. **Implementação:**
   ```
   Crie índices, otimize queries e refatore componentes
   ```

4. **Validação:**
   ```
   Analise as mudanças e estime ganho de performance
   ```

### Resolver Bug Complexo

1. **Reprodução:**
   ```
   Analise os logs e identifique padrões no erro
   ```

2. **Debugging:**
   ```
   Use sequential thinking para investigar possíveis causas
   ```

3. **Pesquisa:**
   ```
   Busque issues similares e soluções conhecidas
   ```

4. **Correção:**
   ```
   Implemente a correção e sugira testes para prevenir regressão
   ```

---

## 📊 Exemplos de Análises Úteis

### Performance Dashboard

```
Analise a página src/app/dashboard/page.tsx:
1. Liste todas as queries ao banco
2. Identifique queries N+1
3. Verifique se há componentes não memoizados
4. Sugira otimizações específicas
```

### Segurança

```
Auditoria de segurança:
1. Revise todas as RLS policies
2. Verifique validação de inputs em API routes
3. Identifique possíveis vulnerabilidades (SQL injection, XSS)
4. Sugira melhorias de segurança
```

### Qualidade de Código

```
Code quality check:
1. Encontre código duplicado
2. Identifique componentes muito grandes (>300 linhas)
3. Liste arquivos sem testes
4. Verifique consistência de padrões
```

---

**Última Atualização:** 23 de Outubro de 2025
**Mantenedor:** Pedro
**Projeto:** KAV Concursos
