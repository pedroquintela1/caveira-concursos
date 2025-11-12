'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, FolderOpen, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface CriarCadernoFormProps {
  disciplinas: Array<{ id: number; nome: string; slug: string }>
  bancas: Array<{ id: number; nome: string; sigla: string }>
  orgaos: Array<{ id: number; nome: string; sigla: string; regiao?: string }>
  areasCarreira: Array<{ id: number; nome: string; slug: string }>
  formacoes: Array<{ id: number; nome: string; slug: string; area_conhecimento?: string }>
  assuntos: Array<{ id: number; nome: string; disciplina_id: number; parent_id?: number }>
  plano: string
  pastaId?: number
  pastaNome?: string
}

type FilterCategory =
  | 'disciplina'
  | 'assunto'
  | 'banca'
  | 'orgao'
  | 'areaCarreira'
  | 'escolaridade'
  | 'formacao'
  | 'regiao'
  | 'ano'
  | 'dificuldade'
  | 'opcoes'

interface ActiveFilter {
  category: FilterCategory
  label: string
  value: any
}

export function CriarCadernoForm({
  disciplinas,
  bancas,
  orgaos,
  areasCarreira,
  formacoes,
  assuntos,
  plano,
  pastaId,
  pastaNome,
}: CriarCadernoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [questoesEncontradas, setQuestoesEncontradas] = useState<number>(0)

  const LIMITES = {
    free: { max_questoes: 50 },
    basic: { max_questoes: 200 },
    premium: { max_questoes: 500 },
  }

  const limite = LIMITES[plano as keyof typeof LIMITES] || LIMITES.free

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('disciplina')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    disciplina_id: null as number | null,
    assunto_id: null as number | null,
    banca_id: null as number | null,
    orgao_id: null as number | null,
    area_carreira_id: null as number | null,
    formacao_id: null as number | null,
    escolaridade: null as string | null,
    regiao: null as string | null,
    anos: [] as number[],
    dificuldade: null as string | null,
    opcoes: {
      apenas_comentadas: false,
      apenas_com_materiais: false,
      excluir_respondidas: false,
      apenas_favoritas: false,
    },
    limite_questoes: 50,
  })

  const filterCategories = [
    { id: 'disciplina' as FilterCategory, label: 'Matéria e assunto' },
    { id: 'assunto' as FilterCategory, label: 'Assunto' },
    { id: 'banca' as FilterCategory, label: 'Banca' },
    { id: 'orgao' as FilterCategory, label: 'Órgão e cargo' },
    { id: 'ano' as FilterCategory, label: 'Ano' },
    { id: 'areaCarreira' as FilterCategory, label: 'Área (Carreira)' },
    { id: 'escolaridade' as FilterCategory, label: 'Escolaridade' },
    { id: 'formacao' as FilterCategory, label: 'Formação' },
    { id: 'regiao' as FilterCategory, label: 'Região' },
    { id: 'dificuldade' as FilterCategory, label: 'Dificuldade' },
    { id: 'opcoes' as FilterCategory, label: 'Opções' },
  ]

  const addFilter = (category: FilterCategory, value: any, label: string) => {
    const filtered = activeFilters.filter((f) => f.category !== category)
    setActiveFilters([...filtered, { category, label, value }])

    if (category === 'disciplina') setFormData({ ...formData, disciplina_id: value })
    if (category === 'assunto') setFormData({ ...formData, assunto_id: value })
    if (category === 'banca') setFormData({ ...formData, banca_id: value })
    if (category === 'orgao') setFormData({ ...formData, orgao_id: value })
    if (category === 'areaCarreira') setFormData({ ...formData, area_carreira_id: value })
    if (category === 'formacao') setFormData({ ...formData, formacao_id: value })
    if (category === 'escolaridade') setFormData({ ...formData, escolaridade: value })
    if (category === 'regiao') setFormData({ ...formData, regiao: value })
    if (category === 'ano') {
      const years = Array.isArray(value) ? value : [value]
      setFormData({ ...formData, anos: years })
    }
    if (category === 'dificuldade') setFormData({ ...formData, dificuldade: value })
    if (category === 'opcoes') setFormData({ ...formData, opcoes: value })
  }

  const removeFilter = (category: FilterCategory) => {
    setActiveFilters(activeFilters.filter((f) => f.category !== category))

    if (category === 'disciplina') setFormData({ ...formData, disciplina_id: null })
    if (category === 'assunto') setFormData({ ...formData, assunto_id: null })
    if (category === 'banca') setFormData({ ...formData, banca_id: null })
    if (category === 'orgao') setFormData({ ...formData, orgao_id: null })
    if (category === 'areaCarreira') setFormData({ ...formData, area_carreira_id: null })
    if (category === 'formacao') setFormData({ ...formData, formacao_id: null })
    if (category === 'escolaridade') setFormData({ ...formData, escolaridade: null })
    if (category === 'regiao') setFormData({ ...formData, regiao: null })
    if (category === 'ano') setFormData({ ...formData, anos: [] })
    if (category === 'dificuldade') setFormData({ ...formData, dificuldade: null })
    if (category === 'opcoes')
      setFormData({
        ...formData,
        opcoes: {
          apenas_comentadas: false,
          apenas_com_materiais: false,
          excluir_respondidas: false,
          apenas_favoritas: false,
        },
      })
  }

  const getFilteredItems = () => {
    const term = searchTerm.toLowerCase()

    switch (selectedCategory) {
      case 'disciplina':
        return disciplinas.filter((d) => d.nome.toLowerCase().includes(term))
      case 'assunto':
        return assuntos
          .filter((a) => {
            if (formData.disciplina_id) {
              return (
                a.disciplina_id === formData.disciplina_id &&
                a.nome.toLowerCase().includes(term)
              )
            }
            return a.nome.toLowerCase().includes(term)
          })
          .slice(0, 50)
      case 'banca':
        return bancas.filter(
          (b) =>
            b.nome.toLowerCase().includes(term) || b.sigla.toLowerCase().includes(term)
        )
      case 'orgao':
        return orgaos.filter(
          (o) =>
            o.nome.toLowerCase().includes(term) || o.sigla.toLowerCase().includes(term)
        )
      case 'areaCarreira':
        return areasCarreira.filter((a) => a.nome.toLowerCase().includes(term))
      case 'formacao':
        return formacoes.filter((f) => f.nome.toLowerCase().includes(term))
      default:
        return []
    }
  }

  // Buscar contagem real de questões do banco de dados
  useEffect(() => {
    const fetchQuestionCount = async () => {
      try {
        const response = await fetch('/api/questoes/count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            disciplina_id: formData.disciplina_id,
            assunto_id: formData.assunto_id,
            banca_id: formData.banca_id,
            orgao_id: formData.orgao_id,
            area_carreira_id: formData.area_carreira_id,
            escolaridade: formData.escolaridade,
            formacao_id: formData.formacao_id,
            regiao: formData.regiao,
            anos: formData.anos,
            dificuldade: formData.dificuldade,
          }),
        })

        const data = await response.json()
        setQuestoesEncontradas(data.count || 0)
      } catch (error) {
        console.error('Error fetching question count:', error)
        setQuestoesEncontradas(0)
      }
    }

    fetchQuestionCount()
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast.error('Nome do caderno é obrigatório')
      return
    }

    setLoading(true)

    try {
      const payload = {
        nome: formData.nome,
        descricao: undefined,
        disciplina_id: formData.disciplina_id,
        assunto_id: formData.assunto_id,
        banca_id: formData.banca_id,
        orgao_id: formData.orgao_id,
        area_carreira_id: formData.area_carreira_id,
        formacao_id: formData.formacao_id,
        escolaridade: formData.escolaridade,
        regiao: formData.regiao,
        anos: formData.anos,
        dificuldade: formData.dificuldade,
        limite_questoes: formData.limite_questoes,
        pasta_id: pastaId || null,
      }

      const response = await fetch('/api/cadernos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar caderno')
      }

      toast.success('Caderno criado com sucesso!')

      const redirectUrl = pastaId
        ? `/dashboard/cadernos/pastas/${pastaId}`
        : '/dashboard/cadernos'
      router.push(redirectUrl)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="pb-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={pastaId ? `/dashboard/cadernos/pastas/${pastaId}` : '/dashboard/cadernos'}
          className="text-[#8fbc8f] hover:underline text-sm"
        >
          Cadernos
        </Link>
        <span className="text-gray-500 mx-2">›</span>
        <span className="text-gray-400 text-sm">Novo caderno de questões</span>
      </div>

      {/* Título */}
      <h1 className="text-2xl font-semibold text-white mb-6">Filtrar Questões</h1>

      {/* Layout 3 Colunas */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Coluna 1: Categorias */}
        <div className="col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-4">Matéria e assunto</h3>
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-gray-800 text-white font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coluna 2: Lista de Itens */}
        <div className="col-span-7">
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            {/* Header com busca */}
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-white">
                  {filterCategories.find((c) => c.id === selectedCategory)?.label}
                </h3>
                {selectedCategory !== 'ano' &&
                selectedCategory !== 'dificuldade' &&
                selectedCategory !== 'escolaridade' &&
                selectedCategory !== 'regiao' && (
                  <Input
                    type="text"
                    placeholder="Pesquisar por nome"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 bg-gray-800 border-gray-700 text-white text-sm"
                  />
                )}
              </div>
            </div>

            {/* Lista */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Disciplinas */}
              {selectedCategory === 'disciplina' && (
                <div className="space-y-1">
                  {getFilteredItems().map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => addFilter('disciplina', item.id, item.nome)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                        formData.disciplina_id === item.id
                          ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-[#8fbc8f] flex-shrink-0" />
                      <span>{item.nome}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Assuntos */}
              {selectedCategory === 'assunto' && (
                <div className="space-y-1">
                  {!formData.disciplina_id ? (
                    <p className="text-sm text-gray-400 p-3">
                      Selecione uma disciplina primeiro
                    </p>
                  ) : (
                    getFilteredItems().map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => addFilter('assunto', item.id, item.nome)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                          formData.assunto_id === item.id
                            ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <FolderOpen className="w-4 h-4 text-[#8fbc8f] flex-shrink-0" />
                        <span>{item.nome}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Bancas */}
              {selectedCategory === 'banca' && (
                <div className="space-y-1">
                  {getFilteredItems().map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        addFilter('banca', item.id, `${item.sigla} - ${item.nome}`)
                      }
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                        formData.banca_id === item.id
                          ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-[#8fbc8f] flex-shrink-0" />
                      <span>
                        {item.sigla} - {item.nome}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Órgãos */}
              {selectedCategory === 'orgao' && (
                <div className="space-y-1">
                  {getFilteredItems().map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        addFilter('orgao', item.id, `${item.sigla} - ${item.nome}`)
                      }
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                        formData.orgao_id === item.id
                          ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-[#8fbc8f] flex-shrink-0" />
                      <span>
                        {item.sigla} - {item.nome}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Área (Carreira) */}
              {selectedCategory === 'areaCarreira' && (
                <div className="space-y-1">
                  {getFilteredItems().map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => addFilter('areaCarreira', item.id, item.nome)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                        formData.area_carreira_id === item.id
                          ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-[#8fbc8f] flex-shrink-0" />
                      <span>{item.nome}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Escolaridade */}
              {selectedCategory === 'escolaridade' && (
                <div className="space-y-1">
                  {[
                    { value: 'fundamental', label: 'Ensino Fundamental' },
                    { value: 'medio', label: 'Ensino Médio' },
                    { value: 'superior', label: 'Ensino Superior' },
                    { value: 'pos-graduacao', label: 'Pós-Graduação' },
                  ].map((esc) => (
                    <button
                      key={esc.value}
                      onClick={() => addFilter('escolaridade', esc.value, esc.label)}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                        formData.escolaridade === esc.value
                          ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {esc.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Formação */}
              {selectedCategory === 'formacao' && (
                <div className="space-y-1">
                  {getFilteredItems().map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => addFilter('formacao', item.id, item.nome)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                        formData.formacao_id === item.id
                          ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-[#8fbc8f] flex-shrink-0" />
                      <span>{item.nome}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Região */}
              {selectedCategory === 'regiao' && (
                <div className="space-y-1">
                  {[
                    { value: 'norte', label: 'Norte' },
                    { value: 'nordeste', label: 'Nordeste' },
                    { value: 'centro-oeste', label: 'Centro-Oeste' },
                    { value: 'sudeste', label: 'Sudeste' },
                    { value: 'sul', label: 'Sul' },
                    { value: 'nacional', label: 'Nacional' },
                  ].map((reg) => (
                    <button
                      key={reg.value}
                      onClick={() => addFilter('regiao', reg.value, reg.label)}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                        formData.regiao === reg.value
                          ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {reg.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Ano */}
              {selectedCategory === 'ano' && (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((ano) => {
                    const isSelected = formData.anos.includes(ano)
                    return (
                      <button
                        key={ano}
                        onClick={() => {
                          const newAnos = isSelected
                            ? formData.anos.filter((a) => a !== ano)
                            : [...formData.anos, ano].sort((a, b) => b - a)

                          setFormData({ ...formData, anos: newAnos })

                          if (newAnos.length > 0) {
                            addFilter(
                              'ano',
                              newAnos,
                              newAnos.length === 1
                                ? `${newAnos[0]}`
                                : `${newAnos.length} anos selecionados`
                            )
                          } else {
                            removeFilter('ano')
                          }
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-gray-600 bg-gray-800 text-[#8fbc8f] focus:ring-[#8fbc8f] focus:ring-offset-0"
                        />
                        {ano}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Dificuldade */}
              {selectedCategory === 'dificuldade' && (
                <div className="space-y-1">
                  {[
                    { value: 'facil', label: 'Fácil' },
                    { value: 'medio', label: 'Médio' },
                    { value: 'dificil', label: 'Difícil' },
                  ].map((dif) => (
                    <button
                      key={dif.value}
                      onClick={() => addFilter('dificuldade', dif.value, dif.label)}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                        formData.dificuldade === dif.value
                          ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {dif.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Opções */}
              {selectedCategory === 'opcoes' && (
                <div className="space-y-2">
                  {[
                    { key: 'apenas_comentadas', label: 'Apenas questões comentadas' },
                    { key: 'apenas_com_materiais', label: 'Apenas questões com materiais extras' },
                    { key: 'excluir_respondidas', label: 'Excluir questões já respondidas' },
                    { key: 'apenas_favoritas', label: 'Apenas questões favoritadas' },
                  ].map((opcao) => {
                    const isChecked = formData.opcoes[opcao.key as keyof typeof formData.opcoes]
                    return (
                      <button
                        key={opcao.key}
                        onClick={() => {
                          const newOpcoes = {
                            ...formData.opcoes,
                            [opcao.key]: !isChecked,
                          }
                          setFormData({ ...formData, opcoes: newOpcoes })

                          const activeOpcoes = Object.entries(newOpcoes)
                            .filter(([_, value]) => value)
                            .map(([key]) => {
                              const opt = [
                                { key: 'apenas_comentadas', label: 'Apenas comentadas' },
                                { key: 'apenas_com_materiais', label: 'Com materiais' },
                                { key: 'excluir_respondidas', label: 'Excluir respondidas' },
                                { key: 'apenas_favoritas', label: 'Apenas favoritas' },
                              ].find((o) => o.key === key)
                              return opt?.label || key
                            })

                          if (activeOpcoes.length > 0) {
                            addFilter('opcoes', newOpcoes, activeOpcoes.join(', '))
                          } else {
                            removeFilter('opcoes')
                          }
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2 ${
                          isChecked
                            ? 'bg-[#8fbc8f]/20 border border-[#8fbc8f] text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-gray-600 bg-gray-800 text-[#8fbc8f] focus:ring-[#8fbc8f] focus:ring-offset-0"
                        />
                        {opcao.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 3: Filtros Ativos */}
        <div className="col-span-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Filtros ativos: {activeFilters.length}</h3>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => {
                    setActiveFilters([])
                    setFormData({
                      ...formData,
                      disciplina_id: null,
                      assunto_id: null,
                      banca_id: null,
                      orgao_id: null,
                      area_carreira_id: null,
                      formacao_id: null,
                      escolaridade: null,
                      regiao: null,
                      anos: [],
                      dificuldade: null,
                      opcoes: {
                        apenas_comentadas: false,
                        apenas_com_materiais: false,
                        excluir_respondidas: false,
                        apenas_favoritas: false,
                      },
                    })
                  }}
                  className="text-xs text-[#8fbc8f] hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Lista de filtros */}
            <div className="space-y-2 mb-6 min-h-[200px]">
              {activeFilters.map((filter) => (
                <div
                  key={filter.category}
                  className="flex items-center justify-between gap-2 p-2 bg-gray-800 rounded text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase">
                      {filterCategories.find((c) => c.id === filter.category)?.label}
                    </p>
                    <p className="text-white truncate">{filter.label}</p>
                  </div>
                  <button
                    onClick={() => removeFilter(filter.category)}
                    className="text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Contador */}
            <div className="text-center py-4 border-t border-gray-800">
              <p className="text-2xl font-bold text-white mb-1">
                {questoesEncontradas.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-400">questões encontradas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Nome e Botão */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-6">
            <label className="block text-sm text-gray-400 mb-2">Nome do caderno</label>
            <Input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Caderno de Questões"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="col-span-3">
            <label className="block text-sm text-gray-400 mb-2">
              Limite: {formData.limite_questoes}
            </label>
            <input
              type="range"
              min={10}
              max={limite.max_questoes}
              step={10}
              value={formData.limite_questoes}
              onChange={(e) =>
                setFormData({ ...formData, limite_questoes: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8fbc8f]"
            />
          </div>

          <div className="col-span-3">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.nome.trim()}
              className="w-full bg-[#8fbc8f] hover:bg-[#7dad7d] text-gray-900 font-semibold py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'GERAR CADERNO'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
