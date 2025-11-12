# 🎨 Guia Visual do Dashboard Dark/Military

## 🚀 Como Testar o Novo Dashboard

### 1. Iniciar o Servidor

```bash
npm run dev
```

### 2. Acessar a Aplicação

```
http://localhost:3000
```

### 3. Fazer Login

- Use uma conta existente OU
- Crie nova conta em "Registrar"
- Será redirecionado para `/dashboard`

---

## 🖼️ Estrutura Visual do Dashboard

### Layout Geral

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR        │  HEADER (Search Bar + User Avatar)       │
│  (Menu)         ├───────────────────────────────────────────┤
│                 │                                           │
│  • Dashboard    │  MAIN CONTENT AREA                        │
│  • Questões     │  (Background: gradient black)             │
│  • Mnemônicos   │                                           │
│  • Flashcards   │  ┌─────────────────────────────────────┐ │
│  • Cadernos     │  │  Welcome Header                     │ │
│  • Ranking      │  │  "Olá, Estudante! 👋"               │ │
│  • Bancas       │  └─────────────────────────────────────┘ │
│  • Config       │                                           │
│                 │  ┌───┬───┬───┬───┐  Stats Cards         │
│  [Upgrade Box]  │  │ 📚│ ✓ │ 🎯│ 📈│  (4 cards)           │
│                 │  └───┴───┴───┴───┘                       │
│                 │                                           │
│                 │  ┌─────────┬─────┐                       │
│                 │  │ Chart   │Next │  Main Grid            │
│                 │  │         │Quest│                       │
│                 │  ├─────────┤─────┤                       │
│                 │  │ Activity│Strek│                       │
│                 │  └─────────┴─────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Componentes Detalhados

### 1. SIDEBAR (Menu Lateral)

**Aparência:**

```
┌────────────────────┐
│ 🛡️ KAV CONCURSOS   │ ← Verde militar
├────────────────────┤
│ 📊 Dashboard       │ ← Menu ativo (verde)
│ 📖 Questões        │
│ 🧠 Mnemônicos      │
│ 📇 Flashcards      │
│ 📋 Cadernos        │
│ 🏆 Ranking         │
│ 📈 Análise Bancas  │
│ ⚙️ Configurações   │
├────────────────────┤
│ ┌────────────────┐ │
│ │ 💎 Plano FREE  │ │
│ │ Upgrade p/     │ │
│ │ Premium!       │ │
│ │ [Ver Planos]   │ │
│ └────────────────┘ │
└────────────────────┘
```

**Cores:**

- Background: Cinza escuro com blur
- Menu ativo: Verde translúcido + borda verde esquerda
- Hover: Cinza mais escuro
- Logo: Verde militar (#8fbc8f)

---

### 2. HEADER (Barra Superior)

**Aparência:**

```
┌──────────────────────────────────────────────────────────┐
│ 🔍 [Buscar questões, leis, artigos...]    🔔 👤 Pedro    │
└──────────────────────────────────────────────────────────┘
```

**Elementos:**

- **Search Bar:** Input dark com focus verde
- **Notificações:** Sino com badge verde
- **Avatar:** Círculo verde com inicial do nome

**Interações:**

- Hover na search bar: borda verde
- Hover no avatar: scale up + cor mais escura

---

### 3. STATS CARDS (4 Cards de Estatísticas)

**Layout:**

```
┌──────────┬──────────┬──────────┬──────────┐
│ 📚 Resp  │ ✓ Corret │ 🎯 Taxa  │ 📈 Pontos│
│   42     │   35     │   83%    │   850    │
│ +12% sem │ +8% sem  │ +5% sem  │ +15% sem │
└──────────┴──────────┴──────────┴──────────┘
```

**Cores dos Ícones:**

1. Questões: Verde militar (principal)
2. Corretas: Verde claro
3. Taxa: Roxo
4. Pontos: Laranja

**Hover:** Borda verde + scale 105%

---

### 4. PERFORMANCE CHART (Gráfico de Linha)

**Aparência:**

```
┌─────────────────────────────────┐
│ Desempenho Semanal              │
├─────────────────────────────────┤
│     100│                    •   │
│      80│            •   •       │
│      60│        •               │
│      40│    •                   │
│      20│•                       │
│       0│──────────────────────  │
│         S T Q Q S S D          │
├─────────────────────────────────┤
│ • Taxa de Acerto     72% média │
└─────────────────────────────────┘
```

**Cores:**

- Linha: Verde militar (#8fbc8f)
- Grid: Cinza escuro
- Fundo: Transparente com blur

---

### 5. RECENT ACTIVITY (Atividades Recentes)

**Aparência:**

```
┌────────────────────────────────┐
│ Atividade Recente              │
├────────────────────────────────┤
│ ✓  Lei 8.112/90 Art. 10...    │
│    📅 18 out, 14:30  [Acertou]│
├────────────────────────────────┤
│ ✗  CF/88 Art. 5º Inciso X...  │
│    📅 18 out, 14:25  [Errou]  │
├────────────────────────────────┤
│ ✓  CP Art. 121 Homicídio...   │
│    📅 18 out, 14:20  [Acertou]│
└────────────────────────────────┘
```

**Cores:**

- Acerto: ✓ verde + badge verde
- Erro: ✗ vermelho + badge vermelho
- Hover: Borda verde + background mais escuro

---

### 6. STREAK CARD (Sequência de Estudos)

**Aparência:**

```
┌─────────────────────┐
│ 🔥 Sequência        │
├─────────────────────┤
│                     │
│        7            │ ← Grande, verde militar
│   dias consecutivos │
│                     │
│  ▮ ▮ ▮ ▮ ▮ □ □     │ ← Calendário
│                     │
│ Continue estudando! │
└─────────────────────┘
```

**Cores:**

- Número: Verde militar, fonte Saira 6xl
- Dias ativos: Verde sólido
- Dias inativos: Cinza escuro
- Background: Gradiente verde translúcido

---

### 7. NEXT QUESTIONS (Próximas Questões)

**Aparência:**

```
┌─────────────────────┐
│ Próximas Questões   │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ ▶️ Pronto para  │ │
│ │ começar?        │ │
│ │ [Responder]     │ │ ← Botão verde
│ └─────────────────┘ │
├─────────────────────┤
│ Tópicos Recomend:  │
│ • CF/88 - Arts 1-5 │
│ • Código Penal     │
│ • Lei 8.112/90     │
├─────────────────────┤
│ Disponíveis: 5 / 5 │
└─────────────────────┘
```

**Cores:**

- Box principal: Border verde pontilhado
- Botão: Verde militar sólido
- Tópicos: Cinza escuro com hover verde

---

## 🎯 Estados Interativos

### Hover (Mouse Sobre)

**Elementos que respondem ao hover:**

1. **Stats Cards**
   - Borda muda para verde
   - Card cresce 5% (scale)
   - Transição suave

2. **Menu Sidebar**
   - Background fica cinza mais escuro
   - Texto fica branco
   - Ícone mantém cor

3. **Botões**
   - Verde fica mais escuro
   - Cresce 5%
   - Cursor vira pointer

4. **Activity Cards**
   - Borda muda para verde
   - Background fica mais escuro
   - Conteúdo fica destacado

### Active (Selecionado)

**Menu Sidebar Ativo:**

- Background verde translúcido
- Texto verde militar
- Borda verde na esquerda (2px)
- Ícone verde

### Focus (Teclado)

**Input Search:**

- Borda verde
- Ring verde (outline)
- Placeholder some

---

## 🎨 Paleta de Cores Completa

### Primária (Verde Militar)

```css
#8fbc8f  /* Verde militar principal */
#7da87d  /* Verde militar hover (mais escuro) */
```

### Backgrounds

```css
black                    /* Base */
slate-950                /* Médio (gradiente) */
gray-900 (rgba 50%)      /* Cards com transparência */
gray-800 (rgba 30/50%)   /* Elementos secundários */
```

### Borders

```css
gray-800  /* Padrão */
gray-700  /* Input inactive */
#8fbc8f   /* Active/Hover */
```

### Text

```css
white       /* Títulos e texto principal */
gray-400    /* Subtítulos e labels */
gray-500    /* Meta info e timestamps */
```

### Status Colors

```css
green-400   /* Sucesso (acertos) */
red-400     /* Erro (erros) */
purple-400  /* Taxa/Estatísticas */
orange-400  /* Pontos/Recompensas */
```

---

## 📱 Responsividade

### Mobile (< 768px)

```
┌──────────────────┐
│ [☰] Search 👤    │ ← Header compacto
├──────────────────┤
│ Olá, Estudante!  │
├──────────────────┤
│ ┌──────────────┐ │
│ │ Stat Card 1  │ │ ← 1 coluna
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Stat Card 2  │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Chart        │ │
│ └──────────────┘ │
└──────────────────┘
```

- Sidebar vira drawer (menu hambúrguer)
- Cards empilhados verticalmente
- Chart responsivo (width 100%)

### Tablet (768px - 1024px)

```
┌─────────────────────────────┐
│ [☰] Search Bar      👤 User │
├─────────────────────────────┤
│ ┌──────┬──────┐             │
│ │ Card │ Card │             │ ← 2 colunas
│ └──────┴──────┘             │
│ ┌──────┬──────┐             │
│ │ Card │ Card │             │
│ └──────┴──────┘             │
│ ┌─────────────────────────┐ │
│ │ Chart                   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

- Sidebar ainda é drawer
- Stats cards em 2 colunas
- Chart full width

### Desktop (> 1024px)

```
┌───────┬─────────────────────┐
│ SIDE  │ Header              │
│ BAR   ├─────────────────────┤
│       │ ┌─┬─┬─┬─┐ 4 cols    │
│       │ └─┴─┴─┴─┘           │
│       │ ┌───────┬─┐         │
│       │ │ Chart │S│ 2/3 1/3 │
│       │ │       │t│         │
│       │ └───────┴─┘         │
└───────┴─────────────────────┘
```

- Sidebar fixa à esquerda (256px)
- Stats cards em 4 colunas
- Layout 2/3 + 1/3 para conteúdo

---

## 🔍 Exemplos de Uso

### Ver Estatísticas

1. Fazer login
2. Dashboard mostra automaticamente 4 cards no topo
3. Hover sobre cards para destacar
4. Números grandes em Saira font

### Navegar Menu

1. Sidebar esquerda com todos os menus
2. Clicar em "Questões" → destaque verde + redirect
3. Item ativo tem borda verde esquerda
4. Hover mostra preview do item

### Buscar Conteúdo

1. Clicar na search bar (header)
2. Input ganha focus verde
3. Digitar termos de busca
4. Enter para buscar

### Responder Questões

1. Card "Próximas Questões" (lado direito)
2. Botão verde "Responder Questões"
3. Ou clicar em tópico recomendado
4. Redirect para página de questões

---

## ⚡ Performance

### Otimizações Aplicadas

1. **Server Components**
   - Layout, stats, gráficos renderizados no servidor
   - Reduz JavaScript no cliente

2. **Backdrop Blur**
   - GPU-accelerated
   - Melhor performance que box-shadow

3. **Transitions**
   - `transition-all` apenas em elementos pequenos
   - Animações use `transform` (não `width/height`)

4. **Chart**
   - Recharts com canvas (não SVG pesado)
   - Responsive container limita re-renders

---

## ♿ Acessibilidade

### Teclado Navigation

**Tab Order:**

1. Search bar (header)
2. Notification button
3. User avatar
4. Sidebar menu items (top → bottom)
5. Stats cards (left → right)
6. Interactive buttons

**Shortcuts:**

- `Tab`: Próximo elemento
- `Shift+Tab`: Elemento anterior
- `Enter`: Ativar botão/link
- `Esc`: Fechar modals/dropdowns

### Screen Readers

**ARIA Labels:**

- Sidebar: `role="navigation"`
- Stats cards: `aria-label="Estatísticas"`
- Chart: `aria-label="Gráfico de desempenho semanal"`
- Activity: `aria-label="Atividades recentes"`

**Focus Visible:**
Todos elementos interativos têm `ring-[#8fbc8f]` no focus

---

## 🐛 Troubleshooting

### Dashboard não carrega

1. Verificar se está logado
2. Middleware redireciona para `/auth/login` se não autenticado
3. Checar console do browser (F12)

### Cards sem dados

- Estatísticas zeradas = normal para novo usuário
- Responder questões para popular dados

### Sidebar não aparece

- Mobile: Normal, usar menu hambúrguer
- Desktop: Verificar breakpoint `lg:` no CSS

### Chart sem linha

- Dados mockados por padrão
- Precisa responder questões para ter dados reais

---

## 🎓 Próximos Passos

### Para Desenvolvedores

1. **Página de Questões**
   - Criar `/dashboard/questoes/page.tsx`
   - Fetch questões do Supabase
   - Interface de resposta

2. **Dados Reais no Chart**
   - Substituir `mockData` por query do Supabase
   - Calcular taxa de acerto por dia
   - Implementar filtros (7d, 30d, 90d)

3. **Notificações**
   - Badge no sino é estático
   - Implementar sistema de notificações real
   - WebSocket ou polling

### Para Designers

1. **Animações Micro**
   - Adicionar celebrate animation ao acertar questão
   - Shake animation ao errar
   - Confetti ao bater meta

2. **Dark Mode Toggle**
   - Atualmente forçado dark
   - Adicionar botão para alternar light/dark
   - Salvar preferência no localStorage

3. **Temas Customizados**
   - Permitir usuário escolher cor primária
   - Opções: Verde (atual), Azul, Roxo, Vermelho

---

**Dashboard pronto para uso!** 🚀

Acesse: `http://localhost:3000/dashboard` (após login)

---

**Documentação criada em:** 18/10/2025  
**Versão:** Dashboard v2.0  
**Tema:** Dark/Military (Estilo Caveira)
