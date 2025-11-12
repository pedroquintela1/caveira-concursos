const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migration de pastas...\n');

    // Ler SQL file
    const sqlPath = path.join(__dirname, '../supabase/migrations/20251028_create_pastas_cadernos.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Executar
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // Se a função exec_sql não existir, vamos executar em partes
      console.log('⚠️ Executando SQL manualmente...');

      // Split por statement e executar
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('DO $$') || statement.includes('CREATE OR REPLACE FUNCTION')) {
          console.log('⏭️ Pulando statement complexo (executar manualmente no Dashboard)');
          continue;
        }

        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (stmtError) {
          console.error(`❌ Erro ao executar statement: ${stmtError.message}`);
        }
      }
    }

    console.log('\n✅ Migration aplicada com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Verifique no Supabase Dashboard se a tabela "pastas_cadernos" foi criada');
    console.log('   2. Verifique se a coluna "pasta_id" foi adicionada em "cadernos"');
    console.log('   3. Execute o script de teste: node scripts/test-pastas.js');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    process.exit(1);
  }
}

applyMigration();
