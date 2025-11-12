# Design System - KAV Concursos

Este documento define o Design System fixo do projeto KAV Concursos para garantir consistência visual em toda a aplicação.

## 📐 Espaçamentos

**Sistema baseado em múltiplos de 4px (Tailwind)**

### Gaps (espaçamentos entre elementos)
- **gap-3** (12px): Entre elementos muito próximos (ícone + texto, badge + título)
- **gap-4** (16px): Entre elementos relacionados (alternativas, comentários)
- **gap-6** (24px): Entre seções principais (progresso, enunciado, alternativas)

### Padding (espaçamento interno)
- **p-4** (16px): Padding de elementos pequenos (alternativas não selecionadas)
- **p-6** (24px): Padding padrão de Cards e elementos principais
- **p-12** (48px): Padding de estados vazios (nenhum comentário, paywall)

### Margin
- **Evite margin**: Prefira sempre `space-y-*` ou `gap-*` para manter consistência
- **max-w-4xl**: Container máximo para conteúdo de questões

### Space-Y (espaçamento vertical entre filhos)
- **space-y-2** (8px): Entre labels e valores (Gabarito Oficial + Alternativa B)
- **space-y-3** (12px): Entre subelementos (explicação + metadata)
- **space-y-4** (16px): Entre elementos de formulário
- **space-y-6** (24px): Entre seções principais de um componente

---

## 🎨 Cores

### Primárias
- **Accent**: `#8fbc8f` (verde - botões, ícones de destaque)
- **Accent Hover**: `#7da87d` (verde escuro - hover de botões)

### Backgrounds
- **Cards principais**: `bg-gray-900/50`
- **Elementos interativos**: `bg-gray-800/30`
- **Hover**: `bg-gray-800/50`
- **Inputs**: `bg-gray-800`

### Bordas
- **Padrão**: `border-gray-800`
- **Hover accent**: `border-[#8fbc8f]/50`
- **Selected**: `border-[#8fbc8f]`
- **Feedback positivo**: `border-green-500`
- **Feedback negativo**: `border-red-500`

### Textos
- **Primário**: `text-white`
- **Secundário**: `text-gray-400`
- **Terciário**: `text-gray-500`
- **Accent**: `text-[#8fbc8f]`

### Feedback
- **Sucesso**: `text-green-500`, `bg-green-500/20`, `border-green-500`
- **Erro**: `text-red-500`, `bg-red-500/20`, `border-red-500`
- **Info**: `text-blue-400`
- **Warning**: `text-yellow-400`

---

## 📝 Tipografia

### Tamanhos
- **text-xs** (12px): Metadados pequenos, contadores, badges
- **text-sm** (14px): Metadados, labels, textos secundários
- **text-base** (16px): Corpo de texto, enunciados, alternativas
- **text-lg** (18px): Títulos de cards, headers de seção
- **text-xl** (20px): Títulos de feedback, títulos principais
- **text-2xl** (24px): Stats, números de destaque

### Pesos (Font Weight)
- **font-normal**: Corpo de texto padrão
- **font-semibold**: Títulos de seção, headers
- **font-bold**: Botões, CTA, valores de destaque

### Leading (Line Height)
- **leading-relaxed**: Textos longos (enunciados, explicações)
- **leading-normal**: Padrão para textos curtos

### Fontes
- **font-saira**: Números, cronômetros, stats (Saira)
- **Padrão**: Inter (corpo de texto)

---

## 🧩 Componentes

### Cards
```tsx
<Card className="border-gray-800 bg-gray-900/50">
  <CardContent className="p-6">
    {/* Conteúdo com space-y-* */}
  </CardContent>
</Card>
```

### Títulos de Seção
```tsx
<div className="flex items-center gap-3">
  <IconComponent className="h-5 w-5 text-[#8fbc8f]" />
  <h2 className="text-lg font-semibold text-white">Título</h2>
</div>
```

### Alternativas
```tsx
<button className="w-full rounded-lg border-2 p-4 text-left transition-all border-gray-700 bg-gray-800/30 hover:border-[#8fbc8f]/50 hover:bg-gray-800/50">
  <div className="flex items-start gap-4">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 font-bold text-white">
      A
    </div>
    <p className="flex-1 text-base leading-relaxed text-white">
      Texto da alternativa
    </p>
  </div>
</button>
```

### Botões Primários
```tsx
<Button className="bg-[#8fbc8f] text-gray-900 hover:bg-[#7da87d]">
  Ação Principal
</Button>
```

### Estados Vazios
```tsx
<Card className="border-gray-800 bg-gray-900/50">
  <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
    <IconComponent className="h-12 w-12 text-gray-600" />
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-white">Título</h3>
      <p className="text-sm text-gray-400">Descrição</p>
    </div>
  </CardContent>
</Card>
```

---

## ✅ Checklist de Consistência

Ao criar ou modificar componentes, garanta:

- [ ] Espaçamentos seguem múltiplos de 4px
- [ ] Cards usam `p-6` como padrão
- [ ] Seções principais usam `space-y-6`
- [ ] Ícones de destaque usam `text-[#8fbc8f]`
- [ ] Textos principais são `text-base` ou maiores
- [ ] Metadados são `text-sm` ou `text-xs`
- [ ] Títulos de seção usam `text-lg font-semibold`
- [ ] Botões primários usam `bg-[#8fbc8f] hover:bg-[#7da87d]`
- [ ] Bordas usam `border-gray-800`
- [ ] Container de conteúdo usa `max-w-4xl` quando apropriado

---

## 🎯 Referências

Este Design System foi baseado nos padrões visuais do TEC Concursos e otimizado para consistência e manutenibilidade.

**Última atualização**: Novembro 2025
