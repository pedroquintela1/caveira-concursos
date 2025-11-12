import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('   Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Artigo {
  numero: string;
  titulo: string | null;
  texto_completo: string;
  texto_formatado: string;
  capitulo: string | null;
  secao: string | null;
  is_muito_cobrado: boolean;
  peso_edital: number;
  ordem: number;
  palavras_chave: string[];
}

interface LeiData {
  lei: {
    nome: string;
    nome_curto: string;
    sigla: string;
    numero_lei: string | null;
    ementa: string;
    data_publicacao: string;
    link_oficial: string;
    disciplina_slug: string;
    total_artigos: number;
    ordem: number;
    is_mais_cobrada: boolean;
    is_active: boolean;
  };
  artigos: Artigo[];
}

async function importLei(jsonFile: string) {
  console.log('🚀 IMPORTADOR DE LEIS PARA O SUPABASE\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Ler arquivo JSON
    const filePath = path.join(__dirname, 'leis', jsonFile);
    console.log(`📖 Lendo arquivo: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: LeiData = JSON.parse(fileContent);

    console.log(`✅ Arquivo carregado com sucesso!`);
    console.log(`   - Lei: ${data.lei.nome_curto}`);
    console.log(`   - Total de artigos: ${data.artigos.length}\n`);

    // 1. Buscar disciplina_id
    console.log(`🔍 Buscando disciplina: ${data.lei.disciplina_slug}...`);
    const { data: disciplina, error: disciplinaError } = await supabase
      .from('disciplinas')
      .select('id')
      .eq('slug', data.lei.disciplina_slug)
      .single();

    if (disciplinaError || !disciplina) {
      throw new Error(`Disciplina não encontrada: ${data.lei.disciplina_slug}`);
    }

    console.log(`✅ Disciplina encontrada! ID: ${disciplina.id}\n`);

    // 2. Verificar se a lei já existe
    console.log(`🔍 Verificando se a lei já existe...`);
    const { data: leiExistente } = await supabase
      .from('leis')
      .select('id')
      .eq('sigla', data.lei.sigla)
      .single();

    let leiId: number;

    if (leiExistente) {
      console.log(`⚠️  Lei já existe! ID: ${leiExistente.id}`);
      console.log(`   Deletando artigos antigos para re-importar...\n`);

      // Deletar artigos antigos
      const { error: deleteError } = await supabase
        .from('artigos')
        .delete()
        .eq('lei_id', leiExistente.id);

      if (deleteError) {
        console.error('Erro ao deletar artigos antigos:', deleteError);
      }

      leiId = leiExistente.id;

      // Atualizar lei
      const { error: updateError } = await supabase
        .from('leis')
        .update({
          nome: data.lei.nome,
          nome_curto: data.lei.nome_curto,
          ementa: data.lei.ementa,
          data_publicacao: data.lei.data_publicacao,
          link_oficial: data.lei.link_oficial,
          total_artigos: data.lei.total_artigos,
          is_mais_cobrada: data.lei.is_mais_cobrada,
          is_active: data.lei.is_active
        })
        .eq('id', leiId);

      if (updateError) {
        console.error('Erro ao atualizar lei:', updateError);
      }

    } else {
      // 3. Inserir lei
      console.log(`📝 Inserindo lei no banco de dados...`);
      const { data: leiInserida, error: leiError } = await supabase
        .from('leis')
        .insert({
          disciplina_id: disciplina.id,
          nome: data.lei.nome,
          nome_curto: data.lei.nome_curto,
          sigla: data.lei.sigla,
          numero_lei: data.lei.numero_lei,
          ementa: data.lei.ementa,
          data_publicacao: data.lei.data_publicacao,
          link_oficial: data.lei.link_oficial,
          total_artigos: data.lei.total_artigos,
          ordem: data.lei.ordem,
          is_mais_cobrada: data.lei.is_mais_cobrada,
          is_active: data.lei.is_active
        })
        .select()
        .single();

      if (leiError || !leiInserida) {
        throw new Error(`Erro ao inserir lei: ${leiError?.message}`);
      }

      leiId = leiInserida.id;
      console.log(`✅ Lei inserida! ID: ${leiId}\n`);
    }

    // 4. Inserir artigos em lotes (batch de 50)
    console.log(`📚 Inserindo ${data.artigos.length} artigos...\n`);

    const BATCH_SIZE = 50;
    let totalInseridos = 0;
    let totalErros = 0;

    for (let i = 0; i < data.artigos.length; i += BATCH_SIZE) {
      const batch = data.artigos.slice(i, i + BATCH_SIZE);

      const artigosParaInserir = batch.map(artigo => ({
        lei_id: leiId,
        numero: artigo.numero,
        titulo: artigo.titulo,
        texto_completo: artigo.texto_completo,
        texto_formatado: artigo.texto_formatado,
        capitulo: artigo.capitulo,
        secao: artigo.secao,
        is_muito_cobrado: artigo.is_muito_cobrado,
        peso_edital: artigo.peso_edital,
        ordem: artigo.ordem,
        palavras_chave: artigo.palavras_chave
      }));

      const { data: artigosInseridos, error: artigosError } = await supabase
        .from('artigos')
        .insert(artigosParaInserir)
        .select();

      if (artigosError) {
        console.error(`❌ Erro ao inserir batch ${i / BATCH_SIZE + 1}:`, artigosError.message);
        totalErros += batch.length;
      } else {
        totalInseridos += artigosInseridos?.length || 0;
        const progresso = Math.round((totalInseridos / data.artigos.length) * 100);
        console.log(`   ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(data.artigos.length / BATCH_SIZE)} - ${totalInseridos}/${data.artigos.length} artigos (${progresso}%)`);
      }
    }

    console.log('\n✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('📊 Estatísticas Finais:');
    console.log(`   - Lei inserida: ${data.lei.nome_curto} (ID: ${leiId})`);
    console.log(`   - Artigos inseridos: ${totalInseridos}`);
    console.log(`   - Artigos com erro: ${totalErros}`);
    console.log(`   - Taxa de sucesso: ${((totalInseridos / data.artigos.length) * 100).toFixed(1)}%`);

    console.log('\n🎉 Acesse o painel admin para visualizar!');
    console.log('   http://localhost:3000/admin/configuracoes/leis');
    console.log('   http://localhost:3000/admin/configuracoes/artigos\n');

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar
const args = process.argv.slice(2);
const jsonFile = args[0] || 'cf88-completa.json';

importLei(jsonFile);
