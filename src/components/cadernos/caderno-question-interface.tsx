'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Award,
  BookOpen,
  Building2,
  Target,
  Scissors,
  ArrowLeft,
  RotateCcw,
  Star,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  BarChart3,
  CheckSquare,
  Settings,
  Printer,
  Share2,
  ListOrdered,
  GraduationCap,
  Bookmark,
  Info,
  Timer,
  Pause,
  Play,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ComentariosSection } from '@/components/questoes/comentarios-section'
import { MateriaisSection } from '@/components/questoes/materiais-section'
import { toast } from 'sonner'

interface Questao {
  id: number
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  alternativa_e: string
  gabarito: string
  explicacao: string
  ano: number
  cargo: string
  dificuldade: string
  bancas: { nome: string }
  orgaos: { nome: string }
  disciplinas: { nome: string }
}

interface CadernoQuestionInterfaceProps {
  questao: Questao
  cadernoId: number
  userId: string
  plano: string
  indiceQuestao: number
  totalQuestoes: number
}

export function CadernoQuestionInterface({
  questao,
  cadernoId,
  userId,
  plano,
  indiceQuestao,
  totalQuestoes,
}: CadernoQuestionInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tempoResposta, setTempoResposta] = useState(0)
  const [descartedAlternatives, setDescartedAlternatives] = useState<Set<string>>(new Set())
  const [timerPaused, setTimerPaused] = useState(false)
  const [questoesCaderno, setQuestoesCaderno] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Buscar todas as questões do caderno para navegação
  useEffect(() => {
    const fetchQuestoes = async () => {
      const { data } = await supabase.rpc('get_caderno_questoes', {
        p_caderno_id: cadernoId,
        p_user_id: userId,
      })
      if (data) {
        setQuestoesCaderno(data)
      }
    }
    fetchQuestoes()
  }, [cadernoId, userId])

  // Timer with pause/play
  useEffect(() => {
    if (!showFeedback && !timerPaused) {
      const interval = setInterval(() => {
        setTempoResposta((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [showFeedback, timerPaused])

  const alternativas = [
    { letra: 'A', texto: questao.alternativa_a },
    { letra: 'B', texto: questao.alternativa_b },
    { letra: 'C', texto: questao.alternativa_c },
    { letra: 'D', texto: questao.alternativa_d },
    { letra: 'E', texto: questao.alternativa_e },
  ]

  const handleSelectAlternative = (letra: string) => {
    if (!showFeedback && !descartedAlternatives.has(letra)) {
      setSelectedAlternative(letra)
    }
  }

  const handleToggleDescartar = (letra: string) => {
    if (showFeedback) return

    const newDescartadas = new Set(descartedAlternatives)
    if (newDescartadas.has(letra)) {
      newDescartadas.delete(letra)
    } else {
      newDescartadas.add(letra)
      // Se a alternativa selecionada foi descartada, desselecionar
      if (selectedAlternative === letra) {
        setSelectedAlternative(null)
      }
    }
    setDescartedAlternatives(newDescartadas)
  }

  const handleDoubleClickAlternative = (letra: string) => {
    handleToggleDescartar(letra)
  }

  const handleSubmit = async () => {
    if (!selectedAlternative || showFeedback) return

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Salvar resposta usando RPC seguro (valida server-side)
      const { data, error } = await supabase.rpc('salvar_resposta_caderno', {
        p_caderno_id: cadernoId,
        p_questao_id: questao.id,
        p_resposta_escolhida: selectedAlternative,
        p_tempo_resposta_segundos: tempoResposta,
      })

      if (error) {
        // Tratamento de erros específicos
        if (error.message.includes('não pertence')) {
          toast.error('Questão inválida', {
            description: 'Esta questão não pertence a este caderno',
          })
        } else if (error.message.includes('já respondeu')) {
          toast.error('Questão já respondida', {
            description: 'Você já respondeu esta questão neste caderno',
          })
        } else {
          throw error
        }
        return
      }

      // Mostrar feedback
      setShowFeedback(true)
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
      toast.error('Erro ao salvar resposta', {
        description: 'Tente novamente em alguns instantes',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextQuestion = () => {
    router.refresh()
  }

  // Funções de navegação
  const navigateToQuestion = (questaoId: number) => {
    setLoading(true)
    router.push(`/dashboard/cadernos/${cadernoId}?questao=${questaoId}`)
    router.refresh()
  }

  const handlePreviousQuestion = () => {
    const currentIndex = questoesCaderno.findIndex((q) => q.id === questao.id)
    if (currentIndex > 0) {
      navigateToQuestion(questoesCaderno[currentIndex - 1].id)
    }
  }

  const handleNextQuestionNav = () => {
    const currentIndex = questoesCaderno.findIndex((q) => q.id === questao.id)
    if (currentIndex < questoesCaderno.length - 1) {
      navigateToQuestion(questoesCaderno[currentIndex + 1].id)
    }
  }

  const handleFirstQuestion = () => {
    if (questoesCaderno.length > 0) {
      navigateToQuestion(questoesCaderno[0].id)
    }
  }

  const handleLastQuestion = () => {
    if (questoesCaderno.length > 0) {
      navigateToQuestion(questoesCaderno[questoesCaderno.length - 1].id)
    }
  }

  const handleRandomUnsolvedQuestion = () => {
    const unsolved = questoesCaderno.filter((q) => !q.ja_respondida)
    if (unsolved.length > 0) {
      const random = unsolved[Math.floor(Math.random() * unsolved.length)]
      navigateToQuestion(random.id)
    } else {
      toast.error('Todas as questões já foram respondidas!')
    }
  }

  const handleNextUnsolvedQuestion = () => {
    const currentIndex = questoesCaderno.findIndex((q) => q.id === questao.id)
    const nextUnsolved = questoesCaderno.slice(currentIndex + 1).find((q) => !q.ja_respondida)

    if (nextUnsolved) {
      navigateToQuestion(nextUnsolved.id)
    } else {
      // Se não houver próxima não resolvida, procurar do início
      const firstUnsolved = questoesCaderno.find((q) => !q.ja_respondida)
      if (firstUnsolved) {
        navigateToQuestion(firstUnsolved.id)
      } else {
        toast.error('Todas as questões já foram respondidas!')
      }
    }
  }

  const handleRefreshQuestion = () => {
    setSelectedAlternative(null)
    setShowFeedback(false)
    setTempoResposta(0)
    setDescartedAlternatives(new Set())
    setTimerPaused(false)
  }

  const isCorrect = selectedAlternative === questao.gabarito

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6">
        {/* Compact Question Header - Single Line */}
        <div className="mb-4 flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-800">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-white">
                Questão {indiceQuestao} de {totalQuestoes}
              </h2>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">
                Matéria: <span className="text-[#8fbc8f]">{questao.disciplinas?.nome || 'N/A'}</span>
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">
                #{questao.id} {questao.bancas?.nome || 'N/A'} - {questao.ano}
              </span>
            </div>
          </div>

          {/* Right Icons Compact */}
          <div className="flex items-center gap-2">
            <button className="rounded p-1.5 hover:bg-gray-700 transition-colors group" title="Formatura">
              <GraduationCap className="h-4 w-4 text-gray-400 group-hover:text-gray-200" />
            </button>
            <button className="rounded p-1.5 hover:bg-gray-700 transition-colors group" title="Favoritar">
              <Bookmark className="h-4 w-4 text-gray-400 group-hover:text-gray-200" />
            </button>
            <button className="rounded p-1.5 hover:bg-gray-700 transition-colors group" title="Comentários">
              <MessageSquare className="h-4 w-4 text-gray-400 group-hover:text-gray-200" />
            </button>
            <button className="rounded p-1.5 hover:bg-gray-700 transition-colors group" title="Estrelar">
              <Star className="h-4 w-4 text-gray-400 group-hover:text-gray-200" />
            </button>
            <div className="ml-2 flex items-center gap-2 rounded bg-[#8fbc8f]/15 px-2 py-1 border border-[#8fbc8f]/20">
              <Timer className="h-4 w-4 text-[#8fbc8f]" />
              <span className="font-mono text-xs font-bold text-[#8fbc8f]">
                {formatTime(tempoResposta)}
              </span>
              {!showFeedback && (
                <button
                  onClick={() => setTimerPaused(!timerPaused)}
                  className="rounded p-0.5 hover:bg-[#8fbc8f]/30 transition-colors group"
                  title={timerPaused ? 'Retomar timer' : 'Pausar timer'}
                >
                  {timerPaused ? (
                    <Play className="h-3 w-3 text-[#8fbc8f] group-hover:text-[#a0cca0]" />
                  ) : (
                    <Pause className="h-3 w-3 text-[#8fbc8f] group-hover:text-[#a0cca0]" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enunciado - Direct Without Card */}
        <div className="mb-4 rounded-lg border border-gray-800 bg-gray-900/50 p-5">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white">
            {questao.enunciado}
          </p>
        </div>

        {/* Alternativas - TEC Clean Style (Dark) - Improved Contrast */}
        <div className="space-y-2">
          {alternativas.map((alt) => {
            const isSelected = selectedAlternative === alt.letra
            const isGabarito = alt.letra === questao.gabarito
            const showCorrect = showFeedback && isGabarito
            const showWrong = showFeedback && isSelected && !isGabarito
            const isDescartada = descartedAlternatives.has(alt.letra)

            return (
              <div
                key={alt.letra}
                className={`group relative rounded-lg border-2 transition-all ${
                  showCorrect
                    ? 'border-green-500 bg-green-500/15 shadow-lg shadow-green-500/20'
                    : showWrong
                    ? 'border-red-500 bg-red-500/15 shadow-lg shadow-red-500/20'
                    : isSelected
                    ? 'border-[#8fbc8f] bg-[#8fbc8f]/15 shadow-lg shadow-[#8fbc8f]/20'
                    : isDescartada
                    ? 'border-gray-800 bg-gray-900/30 opacity-50'
                    : 'border-gray-700 bg-gray-900/70 hover:border-[#8fbc8f]/50 hover:bg-gray-800/80 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => handleSelectAlternative(alt.letra)}
                  onDoubleClick={() => handleDoubleClickAlternative(alt.letra)}
                  disabled={showFeedback}
                  className={`flex w-full items-start gap-4 p-4 pr-12 text-left ${
                    showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {/* Letter Circle */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                      showCorrect
                        ? 'border-green-400 bg-green-500 text-white shadow-md'
                        : showWrong
                        ? 'border-red-400 bg-red-500 text-white shadow-md'
                        : isSelected
                        ? 'border-[#8fbc8f] bg-[#8fbc8f] text-gray-900 shadow-md'
                        : 'border-gray-500 bg-gray-800 text-gray-300 group-hover:border-[#8fbc8f]/70 group-hover:bg-gray-700 group-hover:text-white'
                    }`}
                  >
                    {alt.letra}
                  </div>

                  {/* Alternative Text */}
                  <p
                    className={`flex-1 text-base leading-relaxed ${
                      isDescartada
                        ? 'line-through text-gray-500 opacity-60'
                        : 'text-gray-100 group-hover:text-white'
                    }`}
                  >
                    {alt.texto}
                  </p>

                  {/* Check/X Icons */}
                  {showCorrect && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400 animate-in" />}
                  {showWrong && <XCircle className="h-5 w-5 flex-shrink-0 text-red-400 animate-in" />}
                </button>

                {/* Scissors Button */}
                {!showFeedback && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleDescartar(alt.letra)
                    }}
                    className={`absolute right-3 top-3 z-10 rounded-md p-1.5 transition-all ${
                      isDescartada
                        ? 'bg-red-500/30 text-red-400 opacity-100 border border-red-500/50'
                        : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-700 hover:text-red-400 hover:border hover:border-gray-600'
                    }`}
                    title={isDescartada ? 'Restaurar alternativa' : 'Descartar alternativa'}
                  >
                    <Scissors className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Feedback Message */}
        {showFeedback && (
          <div
            className={`mt-4 flex items-center gap-3 rounded-lg border p-4 ${
              isCorrect
                ? 'border-green-500 bg-green-500/10'
                : 'border-red-500 bg-red-500/10'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <span className="text-base font-semibold text-green-400">
                  Você acertou! Boa!
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="text-base font-semibold text-red-400">Ops! Resposta incorreta</span>
              </>
            )}
            <button className="ml-auto text-sm font-medium text-[#8fbc8f] hover:underline">
              Ver resolução
            </button>
          </div>
        )}

        {/* Bottom Action Bar - TEC Style (Dark) - Improved Contrast */}
        <div className="mt-6 flex items-center gap-2 rounded-lg border-2 border-gray-700 bg-gray-900/50 p-3 shadow-md">
          {!showFeedback ? (
            <>
              {/* Navigation Buttons */}
              <button
                onClick={handlePreviousQuestion}
                disabled={loading || questoesCaderno.findIndex((q) => q.id === questao.id) === 0}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Questão anterior"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>
              <button
                onClick={handleNextQuestionNav}
                disabled={
                  loading ||
                  questoesCaderno.findIndex((q) => q.id === questao.id) ===
                    questoesCaderno.length - 1
                }
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Próxima questão"
              >
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>

              {/* Special Navigation */}
              <button
                onClick={handleRandomUnsolvedQuestion}
                disabled={loading}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Questão aleatória não resolvida (Tecla L)"
              >
                <Shuffle className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>
              <button
                onClick={handleNextUnsolvedQuestion}
                disabled={loading}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Próxima questão não resolvida"
              >
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>

              {/* Jump Buttons */}
              <button
                onClick={handleFirstQuestion}
                disabled={loading}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Primeira questão"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" strokeWidth={3} />
              </button>
              <button
                onClick={handleLastQuestion}
                disabled={loading}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Última questão"
              >
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" strokeWidth={3} />
              </button>

              <button
                onClick={handleRefreshQuestion}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 transition-all shadow-sm hover:shadow"
                title="Limpar e refazer esta questão"
              >
                <RotateCcw className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>
              <button
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 transition-all shadow-sm hover:shadow"
                title="Favoritar esta questão"
              >
                <Star className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedAlternative || isLoading || loading}
                className="bg-[#8fbc8f] px-8 py-2 font-semibold text-gray-900 hover:bg-[#7da87d] disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 transition-all border-2 border-[#8fbc8f] hover:border-[#7da87d]"
              >
                {isLoading ? 'Salvando...' : 'RESPONDER'}
              </Button>
            </>
          ) : (
            <>
              {/* After answer - navigation buttons */}
              <button
                onClick={handlePreviousQuestion}
                disabled={loading || questoesCaderno.findIndex((q) => q.id === questao.id) === 0}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Questão anterior"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={loading}
                className="group rounded border-2 border-[#8fbc8f] bg-[#8fbc8f] p-2 text-gray-900 hover:bg-[#7da87d] hover:border-[#7da87d] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                title="Próxima questão (Seta direita)"
              >
                <ChevronRight className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={handleRandomUnsolvedQuestion}
                disabled={loading}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Questão aleatória não resolvida"
              >
                <Shuffle className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>
              <button
                onClick={handleNextUnsolvedQuestion}
                disabled={loading}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Próxima questão não resolvida"
              >
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>

              <button
                onClick={handleFirstQuestion}
                disabled={loading}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Primeira questão"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" strokeWidth={3} />
              </button>
              <button
                onClick={handleLastQuestion}
                disabled={loading}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-600 transition-all shadow-sm hover:shadow"
                title="Última questão"
              >
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" strokeWidth={3} />
              </button>

              <button
                onClick={handleRefreshQuestion}
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 transition-all shadow-sm hover:shadow"
                title="Limpar e refazer esta questão"
              >
                <RotateCcw className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>
              <button
                className="group rounded border-2 border-gray-600 p-2 hover:bg-gray-700 hover:border-gray-500 transition-all shadow-sm hover:shadow"
                title="Favoritar esta questão"
              >
                <Star className="h-5 w-5 text-gray-400 group-hover:text-gray-100 transition-colors" />
              </button>
            </>
          )}
        </div>

        {/* Explanation Section (after answer) */}
        {showFeedback && (
          <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-4 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Gabarito Oficial
              </h3>
              <p className="text-lg font-bold text-[#8fbc8f]">Alternativa {questao.gabarito}</p>
            </div>

            <div className="space-y-3 border-t border-gray-800 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Explicação
              </h3>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-white">
                {questao.explicacao || 'Explicação não disponível para esta questão.'}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-8 border-t border-gray-800 pt-4">
              <div>
                <p className="mb-1 text-xs text-gray-400">Tempo de Resposta</p>
                <p className="font-mono text-xl font-bold text-white">{formatTime(tempoResposta)}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-400">Pontos Ganhos</p>
                <p className="font-mono text-xl font-bold text-[#8fbc8f]">+{isCorrect ? '10' : '0'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Materiais Extras (após responder) */}
        {showFeedback && (
          <div className="mt-6">
            <MateriaisSection questaoId={questao.id} plano={plano as 'free' | 'basic' | 'premium'} />
          </div>
        )}

        {/* Comentários (após responder) */}
        {showFeedback && (
          <div className="mt-6">
            <ComentariosSection questaoId={questao.id} plano={plano as 'free' | 'basic' | 'premium'} />
          </div>
        )}
      </div>
    </div>
  )
}
