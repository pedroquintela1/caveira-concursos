// Script para verificar se as migrations foram aplicadas corretamente
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Credenciais do Supabase (do arquivo .env)
const supabaseUrl = 'https://qujgtdpgvbsbbytefzjx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1amd0ZHBndmJzYmJ5dGVmemp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjQ1MzgsImV4cCI6MjA3NTk0MDUzOH0.rDjp98Oyy1_TTsonoz24CG3_p_u_pHrz2hiiZ1xLPj8'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDatabase() {
  console.log('🔍 Verificando estrutura do banco de dados...\n')

  // 1. Verificar tabelas existentes
  console.log('1️⃣ Verificando tabelas existentes:')
  const tables = ['disciplinas', 'bancas', 'orgaos', 'leis', 'questoes', 'cadernos', 'respostas_usuarios']

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`   ❌ ${table}: Tabela não existe ou sem permissão`)
        console.log(`      Erro: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: ${count} registros`)
      }
    } catch (err) {
      console.log(`   ❌ ${table}: Erro ao verificar - ${err.message}`)
    }
  }

  // 2. Verificar dados das tabelas auxiliares
  console.log('\n2️⃣ Verificando dados das tabelas auxiliares:')

  // Disciplinas
  try {
    const { data, error } = await supabase
      .from('disciplinas')
      .select('id, nome, slug')
      .order('ordem')

    if (error) throw error

    console.log(`   📚 Disciplinas (${data.length}):`)
    data.forEach(d => console.log(`      - ${d.nome} (${d.slug})`))
  } catch (err) {
    console.log(`   ❌ Erro ao buscar disciplinas: ${err.message}`)
  }

  // Bancas
  try {
    const { data, error } = await supabase
      .from('bancas')
      .select('id, nome, sigla')
      .order('id')

    if (error) throw error

    console.log(`\n   🏛️ Bancas (${data.length}):`)
    data.forEach(b => console.log(`      - ${b.sigla}: ${b.nome}`))
  } catch (err) {
    console.log(`   ❌ Erro ao buscar bancas: ${err.message}`)
  }

  // Órgãos
  try {
    const { data, error } = await supabase
      .from('orgaos')
      .select('id, nome, sigla, esfera')
      .order('id')

    if (error) throw error

    console.log(`\n   🏢 Órgãos (${data.length}):`)
    data.forEach(o => console.log(`      - ${o.sigla}: ${o.nome} (${o.esfera})`))
  } catch (err) {
    console.log(`   ❌ Erro ao buscar órgãos: ${err.message}`)
  }

  // Questões
  try {
    const { data, error } = await supabase
      .from('questoes')
      .select('id, ano, disciplina_id, banca_id')
      .order('id')
      .limit(5)

    if (error) throw error

    console.log(`\n   ❓ Questões (primeiras 5):`)
    data.forEach(q => console.log(`      - ID ${q.id}: Ano ${q.ano}, Disciplina ${q.disciplina_id}, Banca ${q.banca_id}`))
  } catch (err) {
    console.log(`   ❌ Erro ao buscar questões: ${err.message}`)
  }

  // 3. Testar query complexa (como na página de cadernos)
  console.log('\n3️⃣ Testando query complexa (JOIN de disciplinas, bancas, órgãos):')

  try {
    const { data, error } = await supabase
      .from('questoes')
      .select(`
        id,
        enunciado,
        ano,
        disciplinas:disciplina_id(id, nome, slug),
        bancas:banca_id(id, nome, sigla),
        orgaos:orgao_id(id, nome, sigla)
      `)
      .limit(1)

    if (error) throw error

    if (data && data.length > 0) {
      console.log('   ✅ Query com JOINs funcionando!')
      console.log(`   Exemplo: Questão ${data[0].id} - ${data[0].disciplinas?.nome || 'N/A'} / ${data[0].bancas?.sigla || 'N/A'}`)
    } else {
      console.log('   ⚠️ Query funcionou mas sem resultados')
    }
  } catch (err) {
    console.log(`   ❌ Erro na query complexa: ${err.message}`)
  }

  // 4. Verificar se página de cadernos vai funcionar
  console.log('\n4️⃣ Simulando query da página de cadernos:')

  try {
    // Simular usuário autenticado (não vai funcionar sem auth real, mas mostra erro específico)
    const { data, error } = await supabase
      .from('cadernos')
      .select(`
        *,
        disciplinas:disciplina_id(id, nome, slug),
        bancas:banca_id(id, nome, sigla),
        orgaos:orgao_id(id, nome, sigla)
      `)
      .limit(1)

    if (error) {
      // Esperado: erro de RLS (sem usuário autenticado)
      if (error.message.includes('RLS') || error.message.includes('policy')) {
        console.log('   ✅ Tabela cadernos existe e RLS está ativo (erro de autenticação esperado)')
      } else {
        console.log(`   ⚠️ Erro inesperado: ${error.message}`)
      }
    } else {
      console.log(`   ✅ Query de cadernos funcionando! ${data?.length || 0} cadernos encontrados`)
    }
  } catch (err) {
    console.log(`   ❌ Erro ao testar query de cadernos: ${err.message}`)
  }

  console.log('\n✅ Verificação concluída!\n')
  console.log('📝 Resumo:')
  console.log('   - Se todas as tabelas aparecem com ✅, as migrations funcionaram')
  console.log('   - Se houver ❌, execute as migrations manualmente no Supabase Dashboard')
  console.log('   - Acesse: https://supabase.com/dashboard/project/qujgtdpgvbsbbytefzjx/sql\n')
}

verifyDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erro fatal:', err)
    process.exit(1)
  })
