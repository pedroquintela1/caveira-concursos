const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDeleteCaderno() {
  try {
    console.log('🔍 Testando DELETE de caderno...\n');

    // 1. Listar todos os cadernos
    console.log('1️⃣ Listando cadernos existentes:');
    const { data: cadernos, error: listError } = await supabase
      .from('cadernos')
      .select('id, user_id, nome, total_questoes_resolvidas')
      .order('id', { ascending: true });

    if (listError) {
      console.error('❌ Erro ao listar:', listError.message);
      return;
    }

    if (!cadernos || cadernos.length === 0) {
      console.log('⚠️ Nenhum caderno encontrado no banco');
      return;
    }

    console.log(`✅ Encontrados ${cadernos.length} caderno(s):`);
    cadernos.forEach(c => {
      console.log(`   - ID ${c.id}: "${c.nome}" (user: ${c.user_id}, resolvidas: ${c.total_questoes_resolvidas})`);
    });

    // 2. Verificar RLS policies
    console.log('\n2️⃣ Verificando RLS policies:');
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies
          WHERE tablename = 'cadernos'
        `
      });

    if (policyError) {
      console.log('⚠️ Não foi possível verificar policies (função exec_sql não existe)');
    } else if (policies) {
      console.log('✅ Policies encontradas:', policies.length);
      policies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`);
      });
    }

    // 3. Testar DELETE via service role (bypassa RLS)
    if (cadernos.length > 0) {
      const cadernoId = cadernos[0].id;
      console.log(`\n3️⃣ Tentando deletar caderno ID ${cadernoId} via SERVICE ROLE:`);

      const { data: deleteData, error: deleteError } = await supabase
        .from('cadernos')
        .delete()
        .eq('id', cadernoId)
        .select();

      if (deleteError) {
        console.error('❌ Erro ao deletar:', deleteError.message);
        console.error('   Detalhes:', deleteError);
      } else {
        console.log('✅ Caderno deletado com sucesso!');
        console.log('   Dados:', deleteData);
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

testDeleteCaderno();
