import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const cadernoId = parseInt(params.id, 10)
    if (isNaN(cadernoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Buscar questões do caderno via RPC
    const { data: questoes, error: rpcError } = await supabase.rpc(
      'get_caderno_questoes',
      { p_caderno_id: cadernoId, p_user_id: user.id }
    )

    if (rpcError) {
      return NextResponse.json({ error: 'Erro ao buscar questões' }, { status: 500 })
    }

    // Calcular estatísticas gerais
    const total = questoes?.length || 0
    const respondidas = questoes?.filter((q: any) => q.ja_respondida)?.length || 0
    const acertos = questoes?.filter((q: any) => q.respondeu_corretamente)?.length || 0
    const erros = questoes?.filter((q: any) => q.ja_respondida && !q.respondeu_corretamente)?.length || 0
    const taxaAcerto = respondidas > 0 ? ((acertos / respondidas) * 100).toFixed(2) : '0.00'

    // Estatísticas por disciplina
    const disciplinas: any = {}
    questoes?.forEach((q: any) => {
      const disciplina = q.disciplina_nome || 'Sem disciplina'
      if (!disciplinas[disciplina]) {
        disciplinas[disciplina] = { total: 0, acertos: 0, erros: 0, tempos: [] }
      }
      disciplinas[disciplina].total++
      if (q.respondeu_corretamente) disciplinas[disciplina].acertos++
      if (q.ja_respondida && !q.respondeu_corretamente) disciplinas[disciplina].erros++
      if (q.tempo_resposta_segundos) disciplinas[disciplina].tempos.push(q.tempo_resposta_segundos)
    })

    const desempenhoPorDisciplina = Object.entries(disciplinas).map(([nome, stats]: [string, any]) => ({
      disciplina_id: null,
      disciplina_nome: nome,
      total: stats.total,
      acertos: stats.acertos,
      erros: stats.erros,
      taxa_acerto: stats.total > 0 ? ((stats.acertos / stats.total) * 100).toFixed(2) : '0.00',
      tempo_medio: stats.tempos.length > 0 ? Math.round(stats.tempos.reduce((a: number, b: number) => a + b, 0) / stats.tempos.length) : 0,
    }))

    // Tempo total e médio
    const tempos = questoes?.filter((q: any) => q.tempo_resposta_segundos).map((q: any) => q.tempo_resposta_segundos) || []
    const tempoTotal = tempos.reduce((a: number, b: number) => a + b, 0)
    const tempoMedio = tempos.length > 0 ? Math.round(tempoTotal / tempos.length) : 0
    const tempoMin = tempos.length > 0 ? Math.min(...tempos) : 0
    const tempoMax = tempos.length > 0 ? Math.max(...tempos) : 0

    const formatTempo = (segundos: number) => {
      const horas = Math.floor(segundos / 3600)
      const minutos = Math.floor((segundos % 3600) / 60)
      const segs = segundos % 60
      return horas > 0 ? `${horas}h ${minutos}m ${segs}s` : minutos > 0 ? `${minutos}m ${segs}s` : `${segs}s`
    }

    // Última sessão (última questão respondida)
    const ultimaSessao = questoes?.filter((q: any) => q.respondida_em).sort((a: any, b: any) => new Date(b.respondida_em).getTime() - new Date(a.respondida_em).getTime())[0]?.respondida_em

    return NextResponse.json({
      estatisticas: {
        geral: {
          total_questoes: total,
          questoes_resolvidas: respondidas,
          nao_resolvidas: total - respondidas,
          acertos,
          erros,
          taxa_acerto: parseFloat(taxaAcerto),
          percentual_completo: total > 0 ? ((respondidas / total) * 100).toFixed(2) : '0.00',
        },
        tempo: {
          total_formatado: formatTempo(tempoTotal),
          medio_formatado: formatTempo(tempoMedio),
          minimo_formatado: formatTempo(tempoMin),
          maximo_formatado: formatTempo(tempoMax),
        },
        desempenho_por_disciplina: desempenhoPorDisciplina.sort((a, b) => b.total - a.total),
        ultima_sessao: ultimaSessao,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
