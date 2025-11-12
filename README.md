# 🎯 KAV Concursos

**Estude, Memorize, Aprove.** A Lei Seca descomplicada para concursos públicos.

Plataforma SaaS de preparação para concursos com foco em "Lei Seca" (legislação literal), questões, mnemônicos, flashcards, gamificação e análise inteligente de bancas.

---

## 🚀 Stack Tecnológica

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Pagamentos:** Stripe
- **State Management:** React Query (TanStack Query v5)
- **Validação:** Zod
- **Testes:** Vitest + Playwright

---

## 📦 Instalação

### Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Conta no Supabase
- Conta no Stripe (modo teste)

### Setup

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/caveira-concursos.git
cd caveira-concursos
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

- **Supabase:** Obtenha em [supabase.com](https://supabase.com) > Settings > API
- **Stripe:** Obtenha em [stripe.com](https://stripe.com) > Developers > API Keys

4. **Configure o banco de dados**

Execute as migrations do Supabase (veja `docs/03-DATABASE-SCHEMA.md`)

5. **Gere os types do Supabase**

```bash
npx supabase gen types typescript > src/types/database.types.ts
```

6. **Configure MCPs (Model Context Protocol) - Opcional mas Recomendado**

MCPs permitem que Claude Code interaja diretamente com Supabase, GitHub, etc.

```bash
cp .mcp.json.example .mcp.json
```

Edite `.mcp.json` com suas credenciais (veja `docs/GUIA-CONFIGURACAO-MCP.md`)

7. **Execute o projeto**

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📂 Estrutura do Projeto

```
caveira-concursos/
├── .github/              # GitHub Actions, Copilot instructions
├── docs/                 # Documentação completa (7 arquivos)
├── src/
│   ├── app/             # Next.js 14 App Router
│   │   ├── api/         # API Routes
│   │   ├── auth/        # Autenticação (login, registro)
│   │   ├── dashboard/   # Dashboard do usuário
│   │   ├── questoes/    # Sistema de questões
│   │   └── ...
│   ├── components/      # Componentes React
│   │   ├── ui/          # shadcn/ui components
│   │   └── ...
│   ├── lib/             # Utilitários, helpers
│   │   ├── supabase/    # Clients Supabase
│   │   └── utils.ts
│   ├── hooks/           # Custom React Hooks
│   ├── types/           # TypeScript types
│   └── ...
└── ...
```

---

## 🎯 Funcionalidades (MVP v2.0)

- ✅ Sistema de Questões + Mnemônicos + Flashcards
- ✅ Gamificação completa (pontos, badges, ranking, streak)
- ✅ Sistema de Cadernos Personalizados (básico + IA)
- ✅ Análise de Inteligência de Bancas
- ✅ 3 Planos de assinatura (FREE, BÁSICO R$39,90, PREMIUM R$79,90)
- ✅ Sistema de moderação de conteúdo
- ✅ Rate limiting e segurança avançada

---

## 🧪 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint
npm run type-check   # Verifica erros TypeScript
npm run format       # Formata código com Prettier
npm run test         # Executa testes unitários (Vitest)
npm run test:e2e     # Executa testes E2E (Playwright)
```

---

## 📚 Documentação

Toda a documentação do projeto está em `/docs`:

1. **01-PRD-COMPLETO.md** - Product Requirements Document
2. **02-ARQUITETURA-SISTEMA.md** - Decisões arquiteturais
3. **03-DATABASE-SCHEMA.md** - Schema do banco, RLS, triggers
4. **04-FLUXOGRAMAS-MERMAID.md** - Fluxos de usuário
5. **05-COMPONENTES-UI.md** - Padrões de componentes
6. **06-API-ENDPOINTS.md** - Contratos de API
7. **07-REGRAS-NEGOCIO.md** - Regras, limites, algoritmos

---

## 🔐 Segurança

- Row Level Security (RLS) em todas as tabelas
- Validação com Zod em todas as APIs
- Rate limiting por IP
- Sanitização de inputs
- HTTPS obrigatório em produção

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

**Importante:** Siga as instruções do `.github/copilot-instructions.md` para padrões de código.

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 👥 Equipe

Desenvolvido com ❤️ por **Pedro** (com auxílio de IA - GitHub Copilot & ChatGPT)

---

## 📞 Suporte

- **Email:** contato@kavconcursos.com.br
- **Docs:** `/docs`

---

**Versão:** 0.1.0 (MVP em desenvolvimento)  
**Última Atualização:** 18/10/2025
