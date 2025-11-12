'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface EditarPastaFormProps {
  pasta: {
    id: number
    nome: string
    descricao: string | null
    cor: string
    icone: string
  }
}

export function EditarPastaForm({ pasta }: EditarPastaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Opções de cores predefinidas
  const CORES_PREDEFINIDAS = [
    { nome: 'Verde (Padrão)', hex: '#8fbc8f' },
    { nome: 'Azul', hex: '#4a90e2' },
    { nome: 'Roxo', hex: '#9b59b6' },
    { nome: 'Laranja', hex: '#f39c12' },
    { nome: 'Vermelho', hex: '#e74c3c' },
    { nome: 'Rosa', hex: '#e91e63' },
    { nome: 'Ciano', hex: '#00bcd4' },
    { nome: 'Amarelo', hex: '#ffd700' },
  ]

  // Form state
  const [formData, setFormData] = useState({
    nome: pasta.nome,
    descricao: pasta.descricao || '',
    cor: pasta.cor,
    icone: pasta.icone,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao || undefined,
        cor: formData.cor,
        icone: formData.icone,
      }

      const response = await fetch(`/api/pastas/${pasta.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar pasta')
      }

      toast.success('Pasta atualizada com sucesso!', {
        description: `As alterações em "${formData.nome}" foram salvas.`,
      })

      router.push(`/dashboard/cadernos/pastas/${pasta.id}`)
      router.refresh()
    } catch (err: any) {
      toast.error('Erro ao atualizar pasta', {
        description: err.message,
      })
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/cadernos/pastas/${pasta.id}`}
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para {pasta.nome}
        </Link>
        <h1 className="text-3xl font-bold text-white">Editar Pasta</h1>
        <p className="text-gray-400 mt-2">
          Atualize as informações da pasta "{pasta.nome}"
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
            Nome da Pasta <span className="text-red-500">*</span>
          </label>
          <Input
            id="nome"
            type="text"
            placeholder="Ex: Concurso PM-SP 2025"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            minLength={2}
            maxLength={200}
            className="bg-gray-900 border-gray-800 text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mínimo 2 caracteres, máximo 200
          </p>
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-300 mb-2">
            Descrição (opcional)
          </label>
          <Textarea
            id="descricao"
            placeholder="Ex: Pasta com todos os cadernos para o concurso da Polícia Militar de São Paulo"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            rows={3}
            className="bg-gray-900 border-gray-800 text-white resize-none"
          />
        </div>

        {/* Cor */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cor da Pasta
          </label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {CORES_PREDEFINIDAS.map((cor) => (
              <button
                key={cor.hex}
                type="button"
                onClick={() => setFormData({ ...formData, cor: cor.hex })}
                className={`group relative rounded-lg p-3 border-2 transition-all ${
                  formData.cor === cor.hex
                    ? 'border-white'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
                title={cor.nome}
              >
                <div
                  className="w-full h-8 rounded"
                  style={{ backgroundColor: cor.hex }}
                />
                {formData.cor === cor.hex && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gray-900" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cor selecionada: <span style={{ color: formData.cor }}>{formData.cor}</span>
          </p>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading || !formData.nome}
            className="bg-[#8fbc8f] hover:bg-[#7aa87a] text-gray-900 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
          <Link href={`/dashboard/cadernos/pastas/${pasta.id}`}>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="border-gray-800 text-gray-300 hover:bg-gray-900"
            >
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
