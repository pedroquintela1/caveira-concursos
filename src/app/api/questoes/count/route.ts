import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Construir query com filtros
    let query = supabase
      .from('questoes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Aplicar filtros
    if (body.disciplina_id) {
      query = query.eq('disciplina_id', body.disciplina_id)
    }

    if (body.assunto_id) {
      query = query.eq('assunto_id', body.assunto_id)
    }

    if (body.banca_id) {
      query = query.eq('banca_id', body.banca_id)
    }

    if (body.orgao_id) {
      query = query.eq('orgao_id', body.orgao_id)
    }

    if (body.area_carreira_id) {
      query = query.eq('area_carreira_id', body.area_carreira_id)
    }

    if (body.escolaridade) {
      query = query.eq('escolaridade', body.escolaridade)
    }

    if (body.formacao_id) {
      query = query.eq('formacao_id', body.formacao_id)
    }

    // Filtro de região (precisa JOIN com órgãos para funcionar corretamente)
    // Por enquanto, deixamos o filtro pelo orgao_id que já cobre a região

    // Filtro de anos - aceita tanto array quanto range
    if (body.anos && Array.isArray(body.anos) && body.anos.length > 0) {
      query = query.in('ano', body.anos)
    } else if (body.ano_inicio || body.ano_fim) {
      // Range de anos
      if (body.ano_inicio && body.ano_fim) {
        query = query.gte('ano', body.ano_inicio).lte('ano', body.ano_fim)
      } else if (body.ano_inicio) {
        query = query.gte('ano', body.ano_inicio)
      } else if (body.ano_fim) {
        query = query.lte('ano', body.ano_fim)
      }
    }

    if (body.dificuldade) {
      query = query.eq('dificuldade', body.dificuldade)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error counting questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Error in count API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
