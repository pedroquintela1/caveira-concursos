# Componentes UI - Design Patterns & Templates

**Versão:** 1.0  
**Data:** 18/10/2025  
**Objetivo:** Estabelecer padrões reutilizáveis para criação consistente de componentes

---

## 📑 Índice

1. [Princípios de Design](#1-princípios-de-design)
2. [Padrões de Nomenclatura](#2-padrões-de-nomenclatura)
3. [Templates de Componentes](#3-templates-de-componentes)
4. [Padrões de Composição](#4-padrões-de-composição)
5. [Padrões de Estado](#5-padrões-de-estado)
6. [Padrões de Estilização](#6-padrões-de-estilização)
7. [Padrões de Acessibilidade](#7-padrões-de-acessibilidade)
8. [Padrões de Performance](#8-padrões-de-performance)

---

## 1. Princípios de Design

### 1.1 Server Components First

// ✅ PADRÃO: Server Component por padrão
// Localização: src/app/[feature]/page.tsx

export default async function FeaturePage() {
// Direct database access (não precisa API route)
const data = await fetchDataFromDB();

return <FeatureComponent data={data} />;
}

// ✅ PADRÃO: Client Component APENAS quando necessário
// Localização: src/components/[feature]/interactive-component.tsx

'use client';

import { useState } from 'react';

export function InteractiveComponent({ data }: Props) {
const [state, setState] = useState(initialState);
// Lógica interativa aqui
}


**Regra de Ouro:** Use `'use client'` APENAS se o componente precisa de:

- `useState`, `useEffect`, `useReducer`
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `document`, `localStorage`)
- Context que muda dinamicamente

---

### 1.2 Estrutura de Pastas Padrão

src/components/
├── ui/ # shadcn/ui (NÃO modificar diretamente)
├── [feature]/ # Feature-based (ex: questoes/, leis/)
│ ├── [name]-card.tsx # Apresentação de item
│ ├── [name]-list.tsx # Lista de items
│ ├── [name]-form.tsx # Formulário
│ ├── [name]-modal.tsx # Modal específico
│ └── [name]-filters.tsx # Filtros
├── layout/ # Layout global
└── shared/ # Componentes reutilizáveis genéricos


---

## 2. Padrões de Nomenclatura

### 2.1 Arquivos

Componentes
questao-card.tsx # kebab-case
mnemonico-form.tsx
dashboard-stats.tsx

Hooks
use-questoes.ts # use-[nome]
use-auth.ts
use-debounce.ts

Utils
format-date.ts # verbo-substantivo
calculate-score.ts
validate-input.ts

Types
questao.types.ts # [feature].types.ts
database.types.ts
api.types.ts


---

### 2.2 Código

// Componentes: PascalCase
export function QuestaoCard() {}
export function DashboardStats() {}

// Props Interface: [ComponentName]Props
interface QuestaoCardProps {
questao: Questao;
onResponder: (resposta: string) => void;
}

// Hooks: use + PascalCase
export function useQuestoes() {}
export function useAuth() {}

// Funções: camelCase (verbo no infinitivo)
function fetchQuestoes() {}
function calculateScore() {}
function formatDate() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_QUESTOES_PER_PAGE = 20;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Booleans: is/has/can + adjetivo
const isLoading = false;
const hasError = false;
const canSubmit = true;

// Handlers: handle + ação
const handleSubmit = () => {};
const handleClick = () => {};
const handleChange = () => {};


---

## 3. Templates de Componentes

### 3.1 Template: Card Component (Apresentação de Item)

**Padrão para:** QuestaoCard, LeiCard, MnemonicoCard, ArtigoCard, etc.

// src/components/[feature]/[name]-card.tsx

'use client'; // Apenas se tiver interatividade

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 1. Definir Props Interface
interface [Name]CardProps {
data: [Type]; // Item principal
onAction?: (id: number) => void; // Ações opcionais
variant?: 'default' | 'compact'; // Variantes
className?: string; // Customização
}

// 2. Componente
export function [Name]Card({
data,
onAction,
variant = 'default',
className
}: [Name]CardProps) {
// 3. Estado local (se necessário)
const [isLoading, setIsLoading] = useState(false);

// 4. Handlers
const handleAction = async () => {
setIsLoading(true);
try {
await onAction?.(data.id);
} finally {
setIsLoading(false);
}
};

// 5. Renderização condicional
if (variant === 'compact') {
return <CompactView data={data} />;
}

// 6. Render principal
return (
<Card className={cn("transition-shadow hover:shadow-md", className)}>
<CardHeader>

<div className="flex items-center justify-between">
<CardTitle>{data.titulo}</CardTitle>
<Badge>{data.categoria}</Badge>
</div>
</CardHeader>

<CardContent>
<p className="text-muted-foreground">{data.descricao}</p>
</CardContent>

  <CardFooter>
    <Button 
      onClick={handleAction} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? 'Carregando...' : 'Ação Principal'}
    </Button>
  </CardFooter>
</Card>
);
}


**Usar este template para:**

- `QuestaoCard` - exibe questão + alternativas
- `LeiCard` - exibe lei + progresso
- `MnemonicoCard` - exibe mnemônico + votação
- `CadernoCard` - exibe caderno + estatísticas

---

### 3.2 Template: List Component (Lista de Items)

// src/components/[feature]/[name]-list.tsx

import { [Name]Card } from './[name]-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';

// 1. Props Interface
interface [Name]ListProps {
items: [Type][];
isLoading?: boolean;
onItemAction?: (id: number) => void;
emptyMessage?: string;
}

// 2. Componente
export function [Name]List({
items,
isLoading = false,
onItemAction,
emptyMessage = 'Nenhum item encontrado'
}: [Name]ListProps) {
// 3. Loading state
if (isLoading) {
return (

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
{Array.from({ length: 6 }).map((_, i) => (
<Skeleton key={i} className="h-48" />
))}
</div>
);
}

// 4. Empty state
if (items.length === 0) {
return <EmptyState message={emptyMessage} />;
}

// 5. Render items
return (

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
{items.map((item) => (
<[Name]Card
key={item.id}
data={item}
onAction={onItemAction}
/>
))}
</div>
);
}


---

### 3.3 Template: Form Component

// src/components/[feature]/[name]-form.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// 1. Schema de validação
const [Name]Schema = z.object({
field1: z.string().min(3, 'Mínimo 3 caracteres'),
field2: z.number().positive('Deve ser positivo'),
// ... outros campos
});

type [Name]FormData = z.infer<typeof [Name]Schema>;

// 2. Props Interface
interface [Name]FormProps {
initialData?: [Name]FormData;
onSubmit: (data: [Name]FormData) => Promise<void>;
onCancel?: () => void;
}

// 3. Componente
export function [Name]Form({ initialData, onSubmit, onCancel }: [Name]FormProps) {
const { toast } = useToast();
const {
register,
handleSubmit,
formState: { errors, isSubmitting },
} = useForm<[Name]FormData>({
resolver: zodResolver([Name]Schema),
defaultValues: initialData,
});

// 4. Handler
const onFormSubmit = async (data: [Name]FormData) => {
try {
await onSubmit(data);
toast({
title: 'Sucesso!',
description: 'Dados salvos com sucesso.',
});
} catch (error) {
toast({
title: 'Erro',
description: 'Não foi possível salvar. Tente novamente.',
variant: 'destructive',
});
}
};

// 5. Render
return (

<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
<div className="space-y-2">
<Label htmlFor="field1">Campo 1</Label>
<Input
id="field1"
{...register('field1')}
disabled={isSubmitting}
/>
{errors.field1 && (
<p className="text-sm text-red-600">{errors.field1.message}</p>
)}
</div>

{/_ Mais campos... _/}

  <div className="flex gap-2">
    <Button type="submit" disabled={isSubmitting} className="flex-1">
      {isSubmitting ? 'Salvando...' : 'Salvar'}
    </Button>
    {onCancel && (
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
    )}
  </div>
</form>
);
}


---

### 3.4 Template: Filter Component

// src/components/[feature]/[name]-filters.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// 1. Interface de filtros
interface [Name]Filters {
category?: string;
tags?: string[];
dateRange?: { start: Date; end: Date };
// ... outros filtros
}

// 2. Props
interface [Name]FiltersProps {
onFilter: (filters: [Name]Filters) => void;
onClear: () => void;
}

// 3. Componente
export function [Name]Filters({ onFilter, onClear }: [Name]FiltersProps) {
const [filters, setFilters] = useState<[Name]Filters>({});

const handleApply = () => {
onFilter(filters);
};

const handleClear = () => {
setFilters({});
onClear();
};

return (
<Card>
<CardHeader>
<CardTitle>Filtros</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
{/_ Campos de filtro _/}

<div className="space-y-2">
<Label>Categoria</Label>
<Select
value={filters.category}
onValueChange={(value) => setFilters({ ...filters, category: value })}
>
<SelectTrigger>
<SelectValue placeholder="Todas" />
</SelectTrigger>
<SelectContent>
<SelectItem value="cat1">Categoria 1</SelectItem>
<SelectItem value="cat2">Categoria 2</SelectItem>
</SelectContent>
</Select>
</div>

{/_ Botões _/}
<div className="flex gap-2">
<Button onClick={handleApply} className="flex-1">
Aplicar
</Button>
<Button variant="outline" onClick={handleClear} className="flex-1">
Limpar
</Button>
</div>
</CardContent>
</Card>
);
}


---

### 3.5 Template: Modal Component

// src/components/[feature]/[name]-modal.tsx

'use client';

import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// 1. Props
interface [Name]ModalProps {
trigger?: React.ReactNode; // Botão que abre
open?: boolean; // Controle externo
onOpenChange?: (open: boolean) => void;
onConfirm: () => Promise<void>;
title: string;
description?: string;
children?: React.ReactNode;
}

// 2. Componente
export function [Name]Modal({
trigger,
open,
onOpenChange,
onConfirm,
title,
description,
children,
}: [Name]ModalProps) {
const [isLoading, setIsLoading] = useState(false);

const handleConfirm = async () => {
setIsLoading(true);
try {
await onConfirm();
onOpenChange?.(false);
} finally {
setIsLoading(false);
}
};

return (

<Dialog open={open} onOpenChange={onOpenChange}>
{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

<DialogContent>
<DialogHeader>
<DialogTitle>{title}</DialogTitle>
{description && <DialogDescription>{description}</DialogDescription>}
</DialogHeader>

    {children}

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => onOpenChange?.(false)}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button onClick={handleConfirm} disabled={isLoading}>
        {isLoading ? 'Processando...' : 'Confirmar'}
      </Button>
    </DialogFooter>

  </DialogContent>
</Dialog>
);
}


---

## 4. Padrões de Composição

### 4.1 Compound Components Pattern

// Para componentes complexos com múltiplas partes relacionadas

// ✅ BOM
const Questao = ({ children }: { children: React.ReactNode }) => {
return <div className="questao">{children}</div>;
};

Questao.Header = ({ children }: { children: React.ReactNode }) => {
return <div className="questao-header">{children}</div>;
};

Questao.Body = ({ children }: { children: React.ReactNode }) => {
return <div className="questao-body">{children}</div>;
};

Questao.Footer = ({ children }: { children: React.ReactNode }) => {
return <div className="questao-footer">{children}</div>;
};

// Uso:
<Questao>
<Questao.Header>
<Badge>CESPE</Badge>
</Questao.Header>
<Questao.Body>

<p>Enunciado...</p>
</Questao.Body>
<Questao.Footer>
<Button>Responder</Button>
</Questao.Footer>
</Questao>


---

### 4.2 Render Props Pattern

// Para compartilhar lógica com flexibilidade visual

interface DataFetcherProps<T> {
url: string;
render: (data: T, isLoading: boolean, error: Error | null) => React.ReactNode;
}

function DataFetcher<T>({ url, render }: DataFetcherProps<T>) {
const { data, isLoading, error } = useQuery<T>({
queryKey: [url],
queryFn: () => fetch(url).then(res => res.json()),
});

return <>{render(data as T, isLoading, !!error)}</>;
}

// Uso:
<DataFetcher<Questao[]>
url="/api/questoes"
render={(questoes, isLoading, error) => {
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage />;
return <QuestoesList questoes={questoes} />;
}}
/>


---

## 5. Padrões de Estado

### 5.1 Estado Local vs Global

// ✅ Local: Quando estado é usado apenas no componente
function QuestaoCard() {
const [selected, setSelected] = useState<string | null>(null); // Local
}

// ✅ Global: Quando estado é compartilhado entre múltiplos componentes
// Use Zustand, Context ou React Query

// store/use-filters-store.ts
import { create } from 'zustand';

interface FiltersState {
disciplina: string | null;
setDisciplina: (disciplina: string | null) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
disciplina: null,
setDisciplina: (disciplina) => set({ disciplina }),
}));


---

### 5.2 Server State (React Query)

// ✅ PADRÃO para dados do servidor

// hooks/use-questoes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useQuestoes(filtros: Filtros) {
return useQuery({
queryKey: ['questoes', filtros],
queryFn: () => fetchQuestoes(filtros),
staleTime: 5 _ 60 _ 1000, // 5 min
});
}

export function useResponderQuestao() {
const queryClient = useQueryClient();

return useMutation({
mutationFn: responderQuestao,
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ['questoes'] });
},
});
}

// Uso no componente:
function QuestoesPage() {
const { data, isLoading } = useQuestoes({ disciplina: 1 });
const { mutate: responder } = useResponderQuestao();

if (isLoading) return <Loading />;

return <QuestoesList questoes={data} onResponder={responder} />;
}


---

## 6. Padrões de Estilização

### 6.1 Tailwind Utility Classes

// ✅ PADRÃO: Agrupar classes por tipo usando cn()

import { cn } from '@/lib/utils';

<div className={cn( // Layout "flex flex-col gap-4", // Sizing "w-full max-w-2xl", // Spacing "p-6 mx-auto", // Visual "bg-white rounded-xl shadow-sm border", // Interactive "hover:shadow-md transition-shadow", // Responsive "md:p-8 lg:max-w-4xl", // Conditional isActive && "border-primary", className // Permitir override )}> ```
6.2 Variantes com CVA
// Para componentes com múltiplas variantes visuais

import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
// Base classes (sempre aplicadas)
"rounded-lg border p-4 transition-colors",
{
variants: {
variant: {
default: "bg-white border-gray-200",
highlighted: "bg-blue-50 border-blue-300",
danger: "bg-red-50 border-red-300",
},
size: {
sm: "p-3 text-sm",
md: "p-4",
lg: "p-6 text-lg",
},
},
defaultVariants: {
variant: "default",
size: "md",
},
}
);

interface CardProps extends VariantProps<typeof cardVariants> {
children: React.ReactNode;
}

export function Card({ variant, size, children }: CardProps) {
return (
<div className={cardVariants({ variant, size })}>
{children}
</div>
);
}

// Uso:
<Card variant="highlighted" size="lg">Conteúdo</Card> 7. Padrões de Acessibilidade
7.1 Checklist Obrigatório
// ✅ SEMPRE incluir em TODOS os componentes interativos

export function AccessibleComponent() {
return (
<div>
{/_ 1. ARIA Labels _/}
<button aria-label="Fechar modal">×</button>

      {/* 2. Keyboard Navigation */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onClick={handleClick}
      >
        Clicável
      </div>

      {/* 3. Focus Visible */}
      <input className="focus:ring-2 focus:ring-primary focus:outline-none" />

      {/* 4. Screen Reader Only Text */}
      <span className="sr-only">Texto para leitores de tela</span>

      {/* 5. Contraste Adequado */}
      <p className="text-gray-900"> {/* Não usar gray-400 em bg-white */}
        Texto com contraste adequado
      </p>

      {/* 6. Estados de Loading/Disabled */}
      <button disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? 'Carregando...' : 'Enviar'}
      </button>
    </div>

);
} 8. Padrões de Performance
8.1 Memoização
// ✅ useMemo: Para computações caras
const sortedItems = useMemo(() => {
return items.sort((a, b) => a.score - b.score);
}, [items]);

// ✅ useCallback: Para callbacks passados como props
const handleClick = useCallback((id: number) => {
onClick(id);
}, [onClick]);

// ✅ React.memo: Para componentes que re-renderizam com frequência
export const ExpensiveComponent = React.memo(({ data }: Props) => {
// Renderização cara
}, (prevProps, nextProps) => {
// Custom comparison (opcional)
return prevProps.data.id === nextProps.data.id;
});
8.2 Lazy Loading
// ✅ Dynamic imports para componentes pesados

import dynamic from 'next/dynamic';

const GraficoDesempenho = dynamic(
() => import('./grafico-desempenho'),
{
loading: () => <Skeleton className="h-64 w-full" />,
ssr: false, // Não renderizar no servidor
}
);

// ✅ Lazy loading de imagens
import Image from 'next/image';

<Image
src="/image.jpg"
alt="Descrição"
width={600}
height={400}
loading="lazy" // Ou "eager" para above-the-fold
placeholder="blur" // Se tiver blurDataURL
/> 9. Checklist de Criação de Componente

## Antes de criar um componente, pergunte:

### 1. Tipo de Componente

- [ ] É Server ou Client Component? (Padrão: Server)
- [ ] Precisa de interatividade? → Client
- [ ] Apenas apresentação? → Server

### 2. Estrutura

- [ ] Segue template adequado? (Card/List/Form/Filter/Modal)
- [ ] Props interface definida e tipada?
- [ ] Usa nomenclatura padrão? (kebab-case arquivo, PascalCase componente)

### 3. Funcionalidade

- [ ] Validação de props (Zod/TypeScript)?
- [ ] Error handling adequado?
- [ ] Loading states implementados?
- [ ] Empty states implementados?

### 4. Estilização

- [ ] Usa Tailwind + cn()?
- [ ] Classes agrupadas por tipo?
- [ ] Permite customização via className?
- [ ] Responsivo (mobile-first)?

### 5. Acessibilidade

- [ ] ARIA labels onde necessário?
- [ ] Navegação por teclado funciona?
- [ ] Focus visible em elementos interativos?
- [ ] Contraste de cores adequado (WCAG AA)?
- [ ] Screen readers testados?

### 6. Performance

- [ ] Usa memoização quando apropriado?
- [ ] Lazy loading para componentes pesados?
- [ ] Imagens otimizadas (Next Image)?

### 7. Documentação

- [ ] Props documentadas (JSDoc)?
- [ ] Exemplos de uso incluídos?
- [ ] Edge cases tratados?

10. Resumo de Comandos para Copilot
    Criar Card Component
    Crie um componente [Nome]Card seguindo o template Card Component:

- Props: data (tipo [Tipo]), onAction opcional
- Usar Card do shadcn/ui
- Badge com categoria
- Botão de ação principal
- Hover effect (shadow)
- TypeScript strict
  Criar List Component
  Crie um componente [Nome]List seguindo o template List Component:
- Props: items (array de [Tipo]), isLoading, onItemAction
- Loading state com Skeleton (6 items)
- Empty state com EmptyState component
- Grid responsivo (1 col mobile, 2 md, 3 lg)
- TypeScript strict
  Criar Form Component
  Crie um componente [Nome]Form seguindo o template Form Component:
- Schema Zod com validações [especificar campos]
- React Hook Form para controle
- Props: initialData opcional, onSubmit, onCancel
- Toast para feedback
- Botões Save/Cancel
- TypeScript strict
  Fim do arquivo 05-COMPONENTES-UI.md


---
