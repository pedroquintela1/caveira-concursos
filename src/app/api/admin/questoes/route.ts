import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação
const questaoSchema = z.object({
  enunciado: z.string().min(10, 'Enunciado deve ter pelo menos 10 caracteres'),
  alternativa_a: z.string().min(1, 'Alternativa A é obrigatória'),
  alternativa_b: z.string().min(1, 'Alternativa B é obrigatória'),
  alternativa_c: z.string().min(1, 'Alternativa C é obrigatória'),
  alternativa_d: z.string().min(1, 'Alternativa D é obrigatória'),
  alternativa_e: z.string().min(1, 'Alternativa E é obrigatória'),
  gabarito: z.enum(['A', 'B', 'C', 'D', 'E'], {
    errorMap: () => ({ message: 'Gabarito inválido' }),
  }),
  explicacao: z.string().nullable().optional(),
  banca_id: z.number().int().positive('Banca é obrigatória'),
  orgao_id: z.number().int().positive().nullable().optional(),
  disciplina_id: z.number().int().positive('Disciplina é obrigatória'),
  artigo_id: z.number().int().positive().nullable().optional(),
  ano: z.number().int().min(2000).max(2030, 'Ano inválido'),
  cargo: z.string().nullable().optional(),
  dificuldade: z.enum(['facil', 'medio', 'dificil']).nullable().optional(),
  tipo_questao: z.enum(['objetiva', 'discursiva']).default('objetiva'),
  codigo_original: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  assuntos_ids: z.array(z.number().int().positive()).optional().default([]),
});

// GET - Listar questões com filtros e paginação
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parsear query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const disciplina_id = searchParams.get('disciplina_id');
    const banca_id = searchParams.get('banca_id');
    const orgao_id = searchParams.get('orgao_id');
    const ano = searchParams.get('ano');
    const dificuldade = searchParams.get('dificuldade');
    const busca = searchParams.get('busca');

    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from('questoes')
      .select(`
        *,
        bancas (id, nome, sigla),
        orgaos (id, nome, sigla),
        disciplinas (id, nome, slug),
        questoes_assuntos (
          assunto_id,
          assuntos (id, nome, nivel)
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (disciplina_id) {
      query = query.eq('disciplina_id', disciplina_id);
    }
    if (banca_id) {
      query = query.eq('banca_id', banca_id);
    }
    if (orgao_id) {
      query = query.eq('orgao_id', orgao_id);
    }
    if (ano) {
      query = query.eq('ano', ano);
    }
    if (dificuldade) {
      query = query.eq('dificuldade', dificuldade);
    }
    if (busca) {
      query = query.ilike('enunciado', `%${busca}%`);
    }

    // Aplicar paginação e ordenação
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: questoes, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      questoes,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar questões:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar questão
export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();

    const validationResult = questaoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { assuntos_ids, ...questaoData } = validationResult.data;

    // Inserir questão
    const { data: questao, error } = await supabase
      .from('questoes')
      .insert(questaoData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Inserir assuntos relacionados (se houver)
    if (assuntos_ids && assuntos_ids.length > 0) {
      const assuntosData = assuntos_ids.map((assunto_id) => ({
        questao_id: questao.id,
        assunto_id,
      }));

      const { error: assuntosError } = await supabase
        .from('questoes_assuntos')
        .insert(assuntosData);

      if (assuntosError) {
        console.error('Erro ao inserir assuntos:', assuntosError);
        // Não falha a operação, apenas loga o erro
      }
    }

    return NextResponse.json(
      { message: 'Questão criada com sucesso', questao },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar questão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
