# 🎨 Guia de Tipografia - KAV Concursos

## Fontes Instaladas

### 1. **Saira** (Principal - Títulos e Destaques)

- **Fonte:** Google Fonts - Saira
- **Pesos disponíveis:** 300, 400, 500, 600, 700, 800
- **Uso:** Títulos, CTAs, stats, navegação, badges
- **Classe Tailwind:** `font-saira`

### 2. **Inter** (Secundária - Corpo de Texto)

- **Fonte:** Google Fonts - Inter
- **Uso:** Textos corridos, parágrafos, descrições
- **Classe Tailwind:** `font-sans` (padrão)

---

## Como Usar

### Títulos Grandes (Hero)

```tsx
<h1 className="font-saira text-7xl font-bold text-white">
  A MAIOR PREPARAÇÃO POLICIAL DO BRASIL
</h1>
```

### Títulos de Seção

```tsx
<h2 className="font-saira text-5xl font-bold text-white">
  Recursos que Fazem a Diferença
</h2>
```

### Subtítulos

```tsx
<h3 className="font-saira text-2xl font-bold text-white">
  Lei Seca Descomplicada
</h3>
```

### Botões e CTAs

```tsx
<Button className="font-saira text-lg font-semibold">
  Começar Gratuitamente
</Button>
```

### Stats e Números

```tsx
<div className="font-saira text-4xl font-bold text-blue-400">
  10K+
</div>
<div className="font-saira text-sm text-gray-400">
  Questões
</div>
```

### Badges e Tags

```tsx
<span className="font-saira text-xs font-semibold uppercase tracking-wider">
  NOVO
</span>
```

### Corpo de Texto (usar Inter)

```tsx
<p className="font-sans text-base text-gray-600">Texto longo aqui...</p>
```

---

## Escala de Tamanhos Recomendada

| Elemento      | Classe Tailwind                   | Peso    |
| ------------- | --------------------------------- | ------- |
| Hero Title    | `text-7xl font-bold`              | 700-800 |
| Section Title | `text-5xl font-bold`              | 700     |
| Card Title    | `text-2xl font-bold`              | 600-700 |
| Button        | `text-lg font-semibold`           | 600     |
| Stats         | `text-4xl font-bold`              | 700-800 |
| Badge         | `text-xs font-semibold uppercase` | 600     |
| Body          | `text-base font-normal`           | 400     |
| Caption       | `text-sm font-light`              | 300     |

---

## Combinações de Cores

### Background Escuro (Policial/Militar)

```tsx
className = 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900';
```

### Texto sobre Escuro

```tsx
// Título principal
className = 'font-saira text-white';

// Destaque
className = 'font-saira text-blue-400';

// Secundário
className = 'font-saira text-gray-300';
```

### Botões

```tsx
// Primary
className = 'font-saira bg-blue-600 hover:bg-blue-700 text-white';

// Outline
className =
  'font-saira border-2 border-white text-white hover:bg-white hover:text-slate-900';
```

---

## Exemplos de Componentes

### Hero Section

```tsx
<div className="space-y-4 text-center">
  <h1 className="font-saira text-7xl font-bold tracking-tight text-white">
    A MAIOR PREPARAÇÃO
    <br />
    <span className="text-blue-400">POLICIAL DO BRASIL</span>
  </h1>

  <p className="font-saira text-2xl font-light text-gray-300">
    Tudo o que você precisa para a sua aprovação em um só lugar
  </p>
</div>
```

### Card de Feature

```tsx
<div className="rounded-xl border border-slate-700 bg-slate-800/50 p-8">
  <h3 className="font-saira mb-3 text-2xl font-bold text-white">
    Lei Seca Descomplicada
  </h3>
  <p className="font-saira text-gray-400">Estude legislação de forma prática</p>
</div>
```

### Stats

```tsx
<div className="text-center">
  <div className="font-saira text-4xl font-bold text-blue-400">10K+</div>
  <div className="font-saira mt-2 text-sm text-gray-400">Questões</div>
</div>
```

---

## ✅ Checklist de Uso

- ✅ **Títulos importantes**: Use `font-saira` com peso `font-bold` (700-800)
- ✅ **Botões e CTAs**: Use `font-saira` com `font-semibold` (600)
- ✅ **Stats e números**: Use `font-saira` com `font-bold` (700-800)
- ✅ **Navegação**: Use `font-saira` com `font-medium` (500-600)
- ✅ **Corpo de texto**: Use `font-sans` (Inter) com `font-normal` (400)
- ✅ **Legendas**: Use `font-saira` com `font-light` (300)

---

## 🎨 Identidade Visual

A fonte **Saira** foi escolhida por ser:

- ✅ Moderna e profissional
- ✅ Alta legibilidade em tamanhos grandes
- ✅ Amplamente usada em contextos policiais/militares
- ✅ Forte impacto visual em títulos
- ✅ Excelente para CTAs e conversão

---

## 📱 Responsividade

```tsx
// Mobile → Desktop
className = 'font-saira text-4xl md:text-5xl lg:text-7xl font-bold';

// Ajuste de espaçamento
className = 'font-saira text-2xl md:text-3xl tracking-tight';
```

---

## 🚀 Próximos Passos

1. Aplicar `font-saira` em todos os títulos do dashboard
2. Atualizar páginas de autenticação com nova tipografia
3. Criar componentes reutilizáveis com Saira
4. Documentar padrões específicos por módulo

**Última atualização:** 18/10/2025
