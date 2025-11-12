import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

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

// Artigos mais cobrados em concursos (baseado em estatísticas)
const ARTIGOS_MUITO_COBRADOS = [
  'Art. 1º', 'Art. 2º', 'Art. 3º', 'Art. 4º', 'Art. 5º',
  'Art. 37', 'Art. 93', 'Art. 144', 'Art. 205', 'Art. 225'
];

async function scrapeConstituicao(): Promise<LeiData> {
  console.log('🔍 Iniciando scraping da Constituição Federal de 1988...\n');

  const url = 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm';

  try {
    console.log(`📡 Fazendo download de: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('✅ Download concluído!\n');
    console.log('🔧 Processando HTML...\n');

    const $ = cheerio.load(response.data);
    const artigos: Artigo[] = [];

    let currentCapitulo: string | null = null;
    let currentSecao: string | null = null;
    let ordemCounter = 1;

    // Processar todo o conteúdo
    $('p, h1, h2, h3, h4, h5').each((index, element) => {
      const $el = $(element);
      const text = $el.text().trim();

      // Detectar Títulos
      if (text.match(/^TÍTULO\s+[IVXLCDM]+/i)) {
        currentCapitulo = text;
        currentSecao = null;
        console.log(`📖 ${currentCapitulo}`);
        return;
      }

      // Detectar Capítulos
      if (text.match(/^CAPÍTULO\s+[IVXLCDM]+/i) || text.match(/^Capítulo\s+[IVXLCDM]+/i)) {
        currentSecao = text;
        console.log(`  📑 ${currentSecao}`);
        return;
      }

      // Detectar Seções
      if (text.match(/^SEÇÃO\s+[IVXLCDM]+/i) || text.match(/^Seção\s+[IVXLCDM]+/i)) {
        currentSecao = (currentSecao || '') + ' - ' + text;
        console.log(`    📄 ${text}`);
        return;
      }

      // Detectar Artigos
      const artigoMatch = text.match(/^Art\.?\s+(\d+[ºª]?\.?)/i);
      if (artigoMatch) {
        const numeroArtigo = `Art. ${artigoMatch[1].replace('.', '')}`;

        // Pegar o texto completo do artigo (pode ter múltiplos parágrafos)
        let textoCompleto = text;
        let $next = $el.next();

        // Agregar parágrafos, incisos e alíneas que fazem parte do mesmo artigo
        while ($next.length > 0) {
          const nextText = $next.text().trim();

          // Se encontrar outro artigo, parar
          if (nextText.match(/^Art\.?\s+\d+/i)) {
            break;
          }

          // Se for parágrafo, inciso, alínea do artigo atual
          if (nextText.match(/^§\s*\d+[ºª]?/i) ||
              nextText.match(/^[IVXLCDM]+\s*-/i) ||
              nextText.match(/^[a-z]\)/i) ||
              nextText.match(/^\d+\)/i)) {
            textoCompleto += '\n' + nextText;
            $next = $next.next();
          } else if (nextText.length > 0 && !nextText.match(/^(TÍTULO|CAPÍTULO|SEÇÃO)/i)) {
            // Texto que continua o artigo
            textoCompleto += ' ' + nextText;
            $next = $next.next();
          } else {
            break;
          }
        }

        // Limpar texto
        textoCompleto = textoCompleto
          .replace(/\s+/g, ' ')
          .replace(/\n\s+/g, '\n')
          .trim();

        // Verificar se é artigo muito cobrado
        const isMuitoCobrado = ARTIGOS_MUITO_COBRADOS.some(art =>
          numeroArtigo.toLowerCase().includes(art.toLowerCase())
        );

        // Calcular peso baseado em artigos conhecidamente importantes
        let peso = 2; // padrão
        if (isMuitoCobrado) peso = 5;
        else if (numeroArtigo.includes('Art. 5º') || numeroArtigo.includes('Art. 37') || numeroArtigo.includes('Art. 144')) peso = 5;
        else if (parseInt(numeroArtigo.match(/\d+/)?.[0] || '0') <= 10) peso = 4;

        // Extrair palavras-chave do texto (palavras com mais de 5 letras, limitado a 10)
        const palavrasChave = textoCompleto
          .toLowerCase()
          .replace(/[.,;:!?()]/g, '')
          .split(/\s+/)
          .filter(palavra => palavra.length > 5 && !['artigo', 'parágrafo', 'inciso'].includes(palavra))
          .filter((palavra, index, self) => self.indexOf(palavra) === index)
          .slice(0, 10);

        // Criar texto formatado (destacar palavras-chave principais)
        let textoFormatado = textoCompleto;
        const palavrasDestaque = ['constituição', 'direito', 'dever', 'república', 'união', 'estado', 'município',
                                   'poder', 'lei', 'garantia', 'princípio', 'administração', 'público'];
        palavrasDestaque.forEach(palavra => {
          const regex = new RegExp(`\\b(${palavra}[a-zção]*)\\b`, 'gi');
          textoFormatado = textoFormatado.replace(regex, '<strong>$1</strong>');
        });

        artigos.push({
          numero: numeroArtigo,
          titulo: null, // Título pode ser extraído manualmente depois
          texto_completo: textoCompleto,
          texto_formatado: textoFormatado,
          capitulo: currentCapitulo,
          secao: currentSecao,
          is_muito_cobrado: isMuitoCobrado,
          peso_edital: peso,
          ordem: ordemCounter++,
          palavras_chave: palavrasChave
        });

        console.log(`    ✓ ${numeroArtigo} (${textoCompleto.substring(0, 50)}...)`);
      }
    });

    console.log(`\n✅ Total de artigos extraídos: ${artigos.length}`);

    const leiData: LeiData = {
      lei: {
        nome: 'Constituição da República Federativa do Brasil de 1988',
        nome_curto: 'CF/88',
        sigla: 'CF',
        numero_lei: null,
        ementa: 'Constituição Federal de 1988 - Norma fundamental e suprema do ordenamento jurídico brasileiro',
        data_publicacao: '1988-10-05',
        link_oficial: url,
        disciplina_slug: 'direito-constitucional',
        total_artigos: artigos.length,
        ordem: 1,
        is_mais_cobrada: true,
        is_active: true
      },
      artigos
    };

    return leiData;

  } catch (error: any) {
    console.error('❌ Erro ao fazer scraping:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🏛️  SCRAPER DA CONSTITUIÇÃO FEDERAL DE 1988\n');
  console.log('=' .repeat(60) + '\n');

  try {
    const data = await scrapeConstituicao();

    const outputPath = path.join(__dirname, 'leis', 'cf88-completa.json');

    console.log(`\n💾 Salvando em: ${outputPath}`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log('\n✅ SCRAPING CONCLUÍDO COM SUCESSO!\n');
    console.log('📊 Estatísticas:');
    console.log(`   - Total de artigos: ${data.artigos.length}`);
    console.log(`   - Artigos muito cobrados: ${data.artigos.filter(a => a.is_muito_cobrado).length}`);
    console.log(`   - Artigos peso 5: ${data.artigos.filter(a => a.peso_edital === 5).length}`);
    console.log(`   - Arquivo gerado: cf88-completa.json`);
    console.log('\n🚀 Próximo passo: Execute o script de importação!');
    console.log('   npm run seed:import cf88-completa.json\n');

  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error);
    process.exit(1);
  }
}

main();
