'use client'

import { useEffect, useState } from 'react'
import {
  Loader2,
  FileText,
  Video,
  FileDown,
  Link as LinkIcon,
  Lock,
  Play,
  CheckCircle2,
  Eye,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Material {
  id: number
  questao_id: number
  tipo_material: 'video' | 'pdf' | 'link' | 'artigo'
  titulo: string
  descricao: string | null
  url: string
  thumbnail_url: string | null
  duracao_segundos: number | null
  tamanho_bytes: number | null
  autor: string | null
  is_gratuito: boolean
  visualizacoes: number
  user_visualizou: boolean
  user_completou: boolean
  user_tempo_assistido: number
}

interface MateriaisSectionProps {
  questaoId: number
  plano: 'free' | 'basic' | 'premium'
}

export function MateriaisSection({ questaoId, plano }: MateriaisSectionProps) {
  const [loading, setLoading] = useState(true)
  const [materiais, setMateriais] = useState<Material[]>([])
  const [materiaisPorTipo, setMateriaisPorTipo] = useState<{
    videos: Material[]
    pdfs: Material[]
    links: Material[]
    artigos: Material[]
  }>({ videos: [], pdfs: [], links: [], artigos: [] })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMateriais()
  }, [questaoId])

  const fetchMateriais = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/questoes/${questaoId}/materiais`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar materiais')
      }

      setMateriais(data.materiais || [])
      setMateriaisPorTipo(data.materiais_por_tipo || { videos: [], pdfs: [], links: [], artigos: [] })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatarDuracao = (segundos: number) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60

    if (horas > 0) {
      return `${horas}h ${minutos}min`
    }
    return `${minutos}:${segs.toString().padStart(2, '0')}`
  }

  const formatarTamanho = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`
    }
    return `${mb.toFixed(1)} MB`
  }

  const handleVisualizarMaterial = async (materialId: number) => {
    try {
      await fetch(`/api/questoes/${questaoId}/materiais`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_id: materialId,
          tempo_assistido: 0,
          completou: false,
        }),
      })
    } catch (err) {
      console.error('Erro ao registrar visualização:', err)
    }
  }

  // FREE/BASIC: Paywall
  if (plano !== 'premium') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="text-lg font-semibold text-white">Materiais Extras</h2>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <Lock className="h-12 w-12 text-gray-600" />
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">
                Materiais Extras - Exclusivo PREMIUM
              </h3>
              <p className="text-sm text-gray-400">
                Acesse vídeos explicativos, PDFs complementares, artigos e muito mais com o plano
                PREMIUM.
              </p>
              <div className="flex items-center justify-center gap-6 pt-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#8fbc8f]" />
                  <span>Videoaulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileDown className="h-4 w-4 text-[#8fbc8f]" />
                  <span>PDFs</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#8fbc8f]" />
                  <span>Artigos</span>
                </div>
              </div>
            </div>
            <Button className="bg-[#8fbc8f] text-gray-900 hover:bg-[#7da87d]">
              Fazer Upgrade para PREMIUM
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="text-lg font-semibold text-white">Materiais Extras</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#8fbc8f]" />
        </div>
      </div>
    )
  }

  if (materiais.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="text-lg font-semibold text-white">Materiais Extras</h2>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <p className="text-sm text-gray-400">
            Nenhum material extra disponível para esta questão.
          </p>
        </div>
      </div>
    )
  }

  const renderMaterialCard = (material: Material) => {
    const icone = {
      video: <Video className="w-5 h-5 text-red-500" />,
      pdf: <FileDown className="w-5 h-5 text-blue-500" />,
      link: <LinkIcon className="w-5 h-5 text-green-500" />,
      artigo: <FileText className="w-5 h-5 text-purple-500" />,
    }[material.tipo_material]

    return (
      <div
        key={material.id}
        className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 hover:bg-gray-900 transition-colors"
      >
        {/* Thumbnail para vídeos */}
        {material.tipo_material === 'video' && material.thumbnail_url && (
          <div className="relative mb-3 rounded-lg overflow-hidden">
            <img
              src={material.thumbnail_url}
              alt={material.titulo}
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>
            {material.duracao_segundos && (
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatarDuracao(material.duracao_segundos)}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-shrink-0 mt-1">{icone}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{material.titulo}</h4>
            {material.descricao && (
              <p className="text-sm text-gray-400 mb-2">{material.descricao}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              {material.autor && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {material.autor}
                </span>
              )}
              {material.tamanho_bytes && (
                <span className="flex items-center gap-1">
                  <FileDown className="w-3 h-3" />
                  {formatarTamanho(material.tamanho_bytes)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {material.visualizacoes} visualizações
              </span>
              {material.user_completou && (
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="w-3 h-3" />
                  Concluído
                </span>
              )}
            </div>

            {/* Botão de Ação */}
            <Button
              size="sm"
              onClick={() => {
                handleVisualizarMaterial(material.id)
                window.open(material.url, '_blank')
              }}
              className="bg-[#8fbc8f] hover:bg-[#7aa87a] text-gray-900 w-full"
            >
              {material.tipo_material === 'video' && (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Assistir
                </>
              )}
              {material.tipo_material === 'pdf' && (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Baixar PDF
                </>
              )}
              {material.tipo_material === 'link' && (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Acessar Link
                </>
              )}
              {material.tipo_material === 'artigo' && (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Ler Artigo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-[#8fbc8f]" />
        <h2 className="text-lg font-semibold text-white">
          Materiais Extras ({materiais.length})
        </h2>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-5 border border-gray-800 bg-gray-900">
          <TabsTrigger value="todos">Todos ({materiais.length})</TabsTrigger>
          <TabsTrigger value="videos">Vídeos ({materiaisPorTipo.videos.length})</TabsTrigger>
          <TabsTrigger value="pdfs">PDFs ({materiaisPorTipo.pdfs.length})</TabsTrigger>
          <TabsTrigger value="artigos">Artigos ({materiaisPorTipo.artigos.length})</TabsTrigger>
          <TabsTrigger value="links">Links ({materiaisPorTipo.links.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {materiais.map(renderMaterialCard)}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          {materiaisPorTipo.videos.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Video className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-sm">Nenhum vídeo disponível</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {materiaisPorTipo.videos.map(renderMaterialCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pdfs" className="mt-6">
          {materiaisPorTipo.pdfs.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FileDown className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-sm">Nenhum PDF disponível</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {materiaisPorTipo.pdfs.map(renderMaterialCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="artigos" className="mt-6">
          {materiaisPorTipo.artigos.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-sm">Nenhum artigo disponível</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {materiaisPorTipo.artigos.map(renderMaterialCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="links" className="mt-6">
          {materiaisPorTipo.links.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <LinkIcon className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-sm">Nenhum link disponível</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {materiaisPorTipo.links.map(renderMaterialCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
