import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface Questao {
  id: number
  codigo: string
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  alternativa_e: string
  gabarito_oficial: string
  ano: number
  cargo: string
  disciplinas: { nome: string }
  bancas: { nome: string; sigla: string }
  orgaos: { nome: string; sigla: string }
  assuntos?: { nome: string }
  ja_respondida: boolean
  resposta_usuario: string | null
  respondeu_corretamente: boolean | null
}

interface ConfiguracaoImpressao {
  qtdMaxima: number
  inicioImpressao: 'a-partir' | 'aleatoriamente'
  questaoInicial: number
  tamanhoFonte: 'normal' | 'grande' | 'extra-grande'
  imprimirCabecalho: 'com-materia' | 'sem-materia' | 'nao-imprimir'
  imprimirGabaritos: 'fim' | 'junto' | 'nao-imprimir'
  removerQuestoes: 'nenhuma' | 'resolvi' | 'acertei' | 'nao-favoritas'
  espacoRascunho: 'nao' | 'lateral' | 'entre-questoes' | 'entre-alternativas'
  imprimirQRCode: boolean
}

export async function gerarPDFCaderno(
  questoes: Questao[],
  cadernoNome: string,
  config: ConfiguracaoImpressao
) {
  // Filtrar questões conforme configuração
  let questoesFiltradas = filtrarQuestoes(questoes, config)

  // Limitar quantidade
  if (config.inicioImpressao === 'a-partir') {
    questoesFiltradas = questoesFiltradas.slice(config.questaoInicial - 1, config.questaoInicial - 1 + config.qtdMaxima)
  } else {
    // Aleatório
    questoesFiltradas = shuffleArray([...questoesFiltradas]).slice(0, config.qtdMaxima)
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Configurar tamanho de fonte base
  const fontSizeBase = getFontSize(config.tamanhoFonte)

  let currentY = 20
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  // Cabeçalho do Caderno
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text(cadernoNome, margin, currentY)
  currentY += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Total de questões: ${questoesFiltradas.length}`, margin, currentY)
  currentY += 5
  pdf.text(`Data de impressão: ${new Date().toLocaleDateString('pt-BR')}`, margin, currentY)
  currentY += 15

  // Linha separadora
  pdf.setLineWidth(0.5)
  pdf.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 10

  // Renderizar cada questão
  questoesFiltradas.forEach((questao, index) => {
    const numeroQuestao = index + 1

    // Verificar se precisa de nova página
    if (currentY > pageHeight - 50) {
      pdf.addPage()
      currentY = 20
    }

    // Cabeçalho da Questão (se configurado)
    if (config.imprimirCabecalho !== 'nao-imprimir') {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(100, 100, 100)

      let cabecalhoText = ''
      if (config.imprimirCabecalho === 'com-materia') {
        cabecalhoText = `${questao.disciplinas?.nome || 'N/A'} • ${questao.assuntos?.nome || 'N/A'} | ${questao.bancas?.sigla || 'N/A'} • ${questao.orgaos?.sigla || 'N/A'} • ${questao.ano} • ${questao.cargo}`
      } else {
        cabecalhoText = `${questao.bancas?.sigla || 'N/A'} • ${questao.orgaos?.sigla || 'N/A'} • ${questao.ano} • ${questao.cargo}`
      }

      pdf.text(cabecalhoText, margin, currentY)
      currentY += 5
    }

    // Número da Questão
    pdf.setFontSize(fontSizeBase)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Questão ${numeroQuestao}`, margin, currentY)

    if (config.imprimirQRCode) {
      // TODO: Adicionar QR Code com link para questão
      pdf.text(`[QR: Q${questao.id}]`, pageWidth - margin - 30, currentY)
    }

    currentY += 7

    // Enunciado
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(fontSizeBase)
    const enunciadoLines = pdf.splitTextToSize(questao.enunciado, contentWidth - 5)
    pdf.text(enunciadoLines, margin + 2, currentY)
    currentY += enunciadoLines.length * (fontSizeBase * 0.4) + 5

    // Alternativas
    const alternativas = [
      { letra: 'A', texto: questao.alternativa_a },
      { letra: 'B', texto: questao.alternativa_b },
      { letra: 'C', texto: questao.alternativa_c },
      { letra: 'D', texto: questao.alternativa_d },
      { letra: 'E', texto: questao.alternativa_e },
    ]

    alternativas.forEach((alt) => {
      if (!alt.texto) return

      // Verificar espaço
      if (currentY > pageHeight - 30) {
        pdf.addPage()
        currentY = 20
      }

      pdf.setFont('helvetica', 'bold')
      pdf.text(`${alt.letra})`, margin + 5, currentY)

      pdf.setFont('helvetica', 'normal')
      const altTextoLines = pdf.splitTextToSize(alt.texto, contentWidth - 15)
      pdf.text(altTextoLines, margin + 12, currentY)
      currentY += altTextoLines.length * (fontSizeBase * 0.4) + 3

      // Espaço para rascunho entre alternativas
      if (config.espacoRascunho === 'entre-alternativas') {
        currentY += 8
        pdf.setLineWidth(0.1)
        pdf.line(margin + 12, currentY, pageWidth - margin - 5, currentY)
        currentY += 8
      }
    })

    // Gabarito junto com a questão (se configurado)
    if (config.imprimirGabaritos === 'junto') {
      currentY += 3
      pdf.setFontSize(fontSizeBase - 1)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 100, 0)
      pdf.text(`Gabarito: ${questao.gabarito_oficial}`, margin + 5, currentY)
      pdf.setTextColor(0, 0, 0)
      currentY += 5
    }

    // Espaço para rascunho entre questões
    if (config.espacoRascunho === 'entre-questoes') {
      currentY += 10
      pdf.setLineWidth(0.3)
      for (let i = 0; i < 3; i++) {
        pdf.line(margin, currentY, pageWidth - margin, currentY)
        currentY += 8
      }
      currentY += 5
    }

    currentY += 10 // Espaço entre questões
  })

  // Gabarito no final (se configurado)
  if (config.imprimirGabaritos === 'fim') {
    pdf.addPage()
    currentY = 20

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('GABARITO', margin, currentY)
    currentY += 15

    pdf.setFontSize(fontSizeBase)
    pdf.setFont('helvetica', 'normal')

    questoesFiltradas.forEach((questao, index) => {
      if (currentY > pageHeight - 20) {
        pdf.addPage()
        currentY = 20
      }

      const numeroQuestao = index + 1
      pdf.text(`${numeroQuestao}. ${questao.gabarito_oficial}`, margin + 5, currentY)
      currentY += 6
    })
  }

  // Download do PDF
  const fileName = `${sanitizeFileName(cadernoNome)}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

// Funções auxiliares
function filtrarQuestoes(questoes: Questao[], config: ConfiguracaoImpressao): Questao[] {
  return questoes.filter((questao) => {
    if (config.removerQuestoes === 'nenhuma') return true
    if (config.removerQuestoes === 'resolvi') return !questao.ja_respondida
    if (config.removerQuestoes === 'acertei') return !questao.respondeu_corretamente
    // TODO: 'nao-favoritas' requer campo de favoritos
    return true
  })
}

function getFontSize(tamanho: 'normal' | 'grande' | 'extra-grande'): number {
  switch (tamanho) {
    case 'normal':
      return 10
    case 'grande':
      return 12
    case 'extra-grande':
      return 14
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
}
