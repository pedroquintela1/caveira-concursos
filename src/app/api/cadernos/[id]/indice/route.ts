import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// ====================================
// GET: Buscar Índice Hierárquico do Caderno
// ====================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // 1. Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 }
      );
    }

    // 2. Validar ID
    const cadernoId = parseInt(params.id);
    if (isNaN(cadernoId)) {
      return NextResponse.json(
        { error: 'ID de caderno inválido.' },
        { status: 400 }
      );
    }

    // 3. Verificar se caderno existe e pertence ao usuário (buscar com todos os filtros)
    const { data: caderno, error: cadernoError } = await supabase
      .from('cadernos')
      .select('*')
      .eq('id', cadernoId)
      .eq('user_id', user.id)
      .single();

    if (cadernoError || !caderno) {
      return NextResponse.json(
        { error: 'Caderno não encontrado ou você não tem permissão.' },
        { status: 404 }
      );
    }

    // 4. Preparar filtros do caderno
    const filtros = {
      disciplina_id: caderno.disciplina_id,
      banca_id: caderno.banca_id,
      orgao_id: caderno.orgao_id,
      ano_inicio: caderno.ano_inicio,
      ano_fim: caderno.ano_fim,
      dificuldade: caderno.dificuldade,
      limite: caderno.limite_questoes || 50,
    };

    // Query com filtros
    let query = supabase.from('questoes').select(`
        id,
        disciplina_id,
        artigo_id,
        disciplinas!disciplina_id (id, nome, slug),
        artigos!artigo_id (id, numero, titulo, texto_completo, lei_id, leis!lei_id (id, nome, sigla))
      `);

    if (filtros.disciplina_id)
      query = query.eq('disciplina_id', filtros.disciplina_id);
    if (filtros.banca_id) query = query.eq('banca_id', filtros.banca_id);
    if (filtros.orgao_id) query = query.eq('orgao_id', filtros.orgao_id);
    if (filtros.ano_inicio) query = query.gte('ano', filtros.ano_inicio);
    if (filtros.ano_fim) query = query.lte('ano', filtros.ano_fim);
    if (filtros.dificuldade)
      query = query.eq('dificuldade', filtros.dificuldade);

    query = query.limit(filtros.limite);

    const { data: questoesFiltradas, error: questoesErro } = await query;

    if (questoesErro) {
      console.error('Erro ao buscar questões:', questoesErro);
      return NextResponse.json(
        { error: 'Erro ao buscar questões do caderno.' },
        { status: 500 }
      );
    }

    // 6. Agrupar por disciplina e artigo
    interface IndiceItem {
      tipo: 'disciplina' | 'artigo';
      id: number | string;
      nome: string;
      questoes: number;
      percentual: number;
      children?: IndiceItem[];
    }

    const disciplinasMap = new Map<number, IndiceItem>();
    const total = questoesFiltradas?.length || 0;

    questoesFiltradas?.forEach((questao: any) => {
      const disciplina = questao.disciplinas;
      const artigo = questao.artigos;

      if (!disciplina) return;

      // Criar ou obter disciplina
      if (!disciplinasMap.has(disciplina.id)) {
        disciplinasMap.set(disciplina.id, {
          tipo: 'disciplina',
          id: disciplina.id,
          nome: disciplina.nome,
          questoes: 0,
          percentual: 0,
          children: [],
        });
      }

      const disciplinaItem = disciplinasMap.get(disciplina.id)!;
      disciplinaItem.questoes++;

      // Se tem artigo, adicionar como child
      if (artigo) {
        const artigoNome = `Art. ${artigo.numero} - ${artigo.leis?.sigla || 'Lei'}`;
        const artigoId = `${disciplina.id}-${artigo.id}`;

        let artigoItem = disciplinaItem.children?.find(
          (c) => c.id === artigoId
        );

        if (!artigoItem) {
          artigoItem = {
            tipo: 'artigo',
            id: artigoId,
            nome: artigoNome,
            questoes: 0,
            percentual: 0,
          };
          disciplinaItem.children?.push(artigoItem);
        }

        artigoItem.questoes++;
      }
    });

    // 7. Calcular percentuais
    const indiceHierarquico: IndiceItem[] = Array.from(
      disciplinasMap.values()
    ).map((disciplina) => {
      disciplina.percentual =
        total > 0 ? (disciplina.questoes / total) * 100 : 0;

      if (disciplina.children && disciplina.children.length > 0) {
        disciplina.children = disciplina.children.map((artigo) => {
          artigo.percentual =
            disciplina.questoes > 0
              ? (artigo.questoes / disciplina.questoes) * 100
              : 0;
          return artigo;
        });
      }

      return disciplina;
    });

    // 8. Ordenar por quantidade de questões (decrescente)
    indiceHierarquico.sort((a, b) => b.questoes - a.questoes);
    indiceHierarquico.forEach((disc) => {
      if (disc.children) {
        disc.children.sort((a, b) => b.questoes - a.questoes);
      }
    });

    return NextResponse.json({
      caderno: {
        id: caderno.id,
        nome: caderno.nome,
        total_questoes: total,
      },
      indice: indiceHierarquico,
      meta: {
        total_disciplinas: indiceHierarquico.length,
        total_artigos: indiceHierarquico.reduce(
          (sum, d) => sum + (d.children?.length || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error('Erro inesperado ao buscar índice:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
