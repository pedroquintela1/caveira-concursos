import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const questaoSchema = z.object({
  enunciado: z.string().min(10, 'Enunciado deve ter pelo menos 10 caracteres'),
  alternativa_a: z.string().min(1, 'Alternativa A é obrigatória'),
  alternativa_b: z.string().min(1, 'Alternativa B é obrigatória'),
  alternativa_c: z.string().min(1, 'Alternativa C é obrigatória'),
  alternativa_d: z.string().min(1, 'Alternativa D é obrigatória'),
  alternativa_e: z.string().min(1, 'Alternativa E é obrigatória'),
  gabarito: z.enum(['A', 'B', 'C', 'D', 'E']),
  explicacao: z.string().nullable().optional(),
  banca_id: z.number().int().positive('Banca é obrigatória'),
  orgao_id: z.number().int().positive().nullable().optional(),
  disciplina_id: z.number().int().positive('Disciplina é obrigatória'),
  artigo_id: z.number().int().positive().nullable().optional(),
  ano: z.number().int().min(2000).max(2030),
  cargo: z.string().nullable().optional(),
  dificuldade: z.enum(['facil', 'medio', 'dificil']).nullable().optional(),
  tipo_questao: z.enum(['objetiva', 'discursiva']).default('objetiva'),
  codigo_original: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  assuntos_ids: z.array(z.number().int().positive()).optional().default([]),
});

// GET - Buscar questão por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: questao, error } = await supabase
      .from('questoes')
      .select(`
        *,
        bancas (id, nome, sigla),
        orgaos (id, nome, sigla),
        disciplinas (id, nome, slug)
      `)
      .eq('id', params.id)
      .single();

    if (error || !questao) {
      return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
    }

    // Buscar assuntos relacionados
    const { data: assuntosRelacionados } = await supabase
      .from('questoes_assuntos')
      .select('assunto_id')
      .eq('questao_id', params.id);

    const assuntos_ids = assuntosRelacionados?.map((a) => a.assunto_id) || [];

    return NextResponse.json({ questao: { ...questao, assuntos_ids } }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar questão
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Atualizar questão
    const { data: questao, error } = await supabase
      .from('questoes')
      .update(questaoData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Atualizar assuntos relacionados
    // 1. Deletar todos os assuntos antigos
    await supabase
      .from('questoes_assuntos')
      .delete()
      .eq('questao_id', params.id);

    // 2. Inserir novos assuntos (se houver)
    if (assuntos_ids && assuntos_ids.length > 0) {
      const assuntosData = assuntos_ids.map((assunto_id) => ({
        questao_id: parseInt(params.id),
        assunto_id,
      }));

      const { error: assuntosError } = await supabase
        .from('questoes_assuntos')
        .insert(assuntosData);

      if (assuntosError) {
        console.error('Erro ao atualizar assuntos:', assuntosError);
        // Não falha a operação, apenas loga o erro
      }
    }

    return NextResponse.json(
      { message: 'Questão atualizada com sucesso', questao },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar questão (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Soft delete
    const { error } = await supabase
      .from('questoes')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Questão desativada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar questão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
