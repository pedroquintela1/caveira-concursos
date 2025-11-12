import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BookOpen,
  Trophy,
  Zap,
  Target,
  Brain,
  Award,
  Shield,
  CheckCircle,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=2000')",
          }}
        />

        {/* Dark Overlay com tom azulado */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black opacity-95" />

        {/* Scanlines Effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
          }}
        />

        {/* Top Bar */}
        <div className="relative z-10 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-[#8fbc8f]" />
              <span className="font-saira text-xl font-bold text-white">
                KAV CONCURSOS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="font-saira text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#8fbc8f] font-saira font-semibold text-gray-900 hover:bg-[#7da87d]">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8fbc8f]/30 bg-[#8fbc8f]/10 px-4 py-2">
              <Trophy className="h-4 w-4 text-[#8fbc8f]" />
              <span className="font-saira text-sm font-medium text-[#8fbc8f]">
                #1 em Preparação Policial
              </span>
            </div>

            {/* Título Principal */}
            <div className="space-y-4">
              <h1 className="font-saira text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl lg:text-8xl">
                A MAIOR PREPARAÇÃO
                <br />
                <span className="text-[#8fbc8f]">POLICIAL DO BRASIL</span>
              </h1>

              <p className="mx-auto max-w-3xl font-saira text-lg font-light leading-relaxed text-gray-300 md:text-xl">
                Tudo o que você precisa para a sua aprovação em um só lugar:
                Videoaulas com os melhores professores, Planejamento de Estudos,
                Banco de Questões, Resumos Interativos, Flashcards, Banco de
                Leis e Simulados.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col justify-center gap-4 pt-8 sm:flex-row">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="transform bg-[#8fbc8f] px-8 py-6 font-saira text-lg font-bold text-gray-900 shadow-2xl transition-all hover:scale-105 hover:bg-[#7da87d] active:scale-95"
                >
                  COMEÇAR GRATUITAMENTE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="transform border-2 border-[#8fbc8f] bg-transparent px-8 py-6 font-saira text-lg font-bold text-[#8fbc8f] transition-all hover:scale-105 hover:bg-[#8fbc8f] hover:text-gray-900 active:scale-95"
                >
                  JÁ TENHO CONTA
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto grid max-w-3xl grid-cols-3 gap-8 pt-16">
              <div className="space-y-2 text-center">
                <div className="font-saira text-4xl font-bold text-[#8fbc8f] md:text-5xl">
                  10K+
                </div>
                <div className="font-saira text-sm uppercase tracking-wider text-gray-400">
                  Questões
                </div>
              </div>
              <div className="space-y-2 text-center">
                <div className="font-saira text-4xl font-bold text-[#8fbc8f] md:text-5xl">
                  5K+
                </div>
                <div className="font-saira text-sm uppercase tracking-wider text-gray-400">
                  Alunos
                </div>
              </div>
              <div className="space-y-2 text-center">
                <div className="font-saira text-4xl font-bold text-[#8fbc8f] md:text-5xl">
                  98%
                </div>
                <div className="font-saira text-sm uppercase tracking-wider text-gray-400">
                  Aprovação
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-gray-950 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="font-saira text-4xl font-bold text-white md:text-5xl">
              RECURSOS QUE FAZEM A DIFERENÇA
            </h2>
            <p className="mx-auto max-w-2xl font-saira text-lg text-gray-400">
              Ferramentas profissionais para acelerar sua aprovação
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#8fbc8f]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#8fbc8f]/10 transition-colors group-hover:bg-[#8fbc8f]/20">
                <BookOpen className="h-7 w-7 text-[#8fbc8f]" />
              </div>
              <h3 className="mb-3 font-saira text-2xl font-bold text-white">
                Lei Seca Descomplicada
              </h3>
              <p className="font-saira leading-relaxed text-gray-400">
                Estude legislação de forma prática com questões comentadas,
                mnemônicos e flashcards inteligentes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#8fbc8f]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#8fbc8f]/10 transition-colors group-hover:bg-[#8fbc8f]/20">
                <Brain className="h-7 w-7 text-[#8fbc8f]" />
              </div>
              <h3 className="mb-3 font-saira text-2xl font-bold text-white">
                Sistema Inteligente
              </h3>
              <p className="font-saira leading-relaxed text-gray-400">
                Algoritmo de repetição espaçada que otimiza sua memorização e
                identifica seus pontos fracos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#8fbc8f]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#8fbc8f]/10 transition-colors group-hover:bg-[#8fbc8f]/20">
                <Trophy className="h-7 w-7 text-[#8fbc8f]" />
              </div>
              <h3 className="mb-3 font-saira text-2xl font-bold text-white">
                Gamificação Total
              </h3>
              <p className="font-saira leading-relaxed text-gray-400">
                Conquiste badges, suba no ranking e mantenha sua motivação com
                desafios diários e semanais.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#8fbc8f]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#8fbc8f]/10 transition-colors group-hover:bg-[#8fbc8f]/20">
                <Target className="h-7 w-7 text-[#8fbc8f]" />
              </div>
              <h3 className="mb-3 font-saira text-2xl font-bold text-white">
                Análise de Bancas
              </h3>
              <p className="font-saira leading-relaxed text-gray-400">
                Inteligência artificial analisa padrões de cobrança e prevê
                temas mais prováveis em sua prova.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#8fbc8f]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#8fbc8f]/10 transition-colors group-hover:bg-[#8fbc8f]/20">
                <Zap className="h-7 w-7 text-[#8fbc8f]" />
              </div>
              <h3 className="mb-3 font-saira text-2xl font-bold text-white">
                Cadernos Inteligentes
              </h3>
              <p className="font-saira leading-relaxed text-gray-400">
                Crie cadernos personalizados por tema, banca e dificuldade. IA
                sugere questões baseadas no seu desempenho.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#8fbc8f]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#8fbc8f]/10 transition-colors group-hover:bg-[#8fbc8f]/20">
                <Award className="h-7 w-7 text-[#8fbc8f]" />
              </div>
              <h3 className="mb-3 font-saira text-2xl font-bold text-white">
                Ranking Nacional
              </h3>
              <p className="font-saira leading-relaxed text-gray-400">
                Compare seu desempenho com milhares de concurseiros. Motivação
                extra para manter o foco.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative bg-black py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="font-saira text-4xl font-bold text-white md:text-5xl">
              COMO FUNCIONA
            </h2>
            <p className="mx-auto max-w-2xl font-saira text-lg text-gray-400">
              Apenas 3 passos para começar sua jornada rumo à aprovação
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* Step 1 */}
            <div className="flex flex-col items-start gap-6 rounded-xl border border-gray-800 bg-gray-900/30 p-8 md:flex-row">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#8fbc8f]">
                <span className="font-saira text-2xl font-bold text-gray-900">
                  1
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-saira text-2xl font-bold text-white">
                  Crie sua conta gratuitamente
                </h3>
                <p className="font-saira text-gray-400">
                  Cadastro rápido em menos de 1 minuto. Sem cartão de crédito,
                  sem compromisso. Comece com 5 questões por dia no plano FREE.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-start gap-6 rounded-xl border border-gray-800 bg-gray-900/30 p-8 md:flex-row">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#8fbc8f]">
                <span className="font-saira text-2xl font-bold text-gray-900">
                  2
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-saira text-2xl font-bold text-white">
                  Escolha seu concurso e comece a estudar
                </h3>
                <p className="font-saira text-gray-400">
                  Selecione a banca, órgão e disciplinas que você precisa
                  estudar. Nosso sistema cria um plano personalizado para você.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-start gap-6 rounded-xl border border-gray-800 bg-gray-900/30 p-8 md:flex-row">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#8fbc8f]">
                <span className="font-saira text-2xl font-bold text-gray-900">
                  3
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-saira text-2xl font-bold text-white">
                  Acompanhe seu progresso e aprove
                </h3>
                <p className="font-saira text-gray-400">
                  Dashboard completo mostra sua evolução, pontos fortes e
                  fracos. Conquiste badges e suba no ranking enquanto estuda.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="transform bg-[#8fbc8f] px-12 py-6 font-saira text-xl font-bold text-gray-900 shadow-2xl transition-all hover:scale-105 hover:bg-[#7da87d]"
              >
                COMEÇAR AGORA - É GRÁTIS
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <p className="mt-4 font-saira text-sm text-gray-500">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="relative border-t border-gray-900 bg-gray-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-saira text-3xl font-bold text-white md:text-4xl">
                JUNTE-SE A MILHARES DE APROVADOS
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-[#8fbc8f]" />
                <span className="font-saira text-gray-400">
                  Mais de 5.000 alunos já confiam na KAV Concursos
                </span>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-4 w-4 text-[#8fbc8f]" />
                  ))}
                </div>
                <p className="font-saira text-sm italic text-gray-300">
                  "Os mnemônicos me ajudaram a decorar artigos complexos do CPM.
                  Aprovado para PM-SP em 6 meses!"
                </p>
                <div className="text-sm">
                  <p className="font-saira font-bold text-white">
                    Carlos Silva
                  </p>
                  <p className="font-saira text-gray-500">PM-SP 2024</p>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-4 w-4 text-[#8fbc8f]" />
                  ))}
                </div>
                <p className="font-saira text-sm italic text-gray-300">
                  "O sistema de repetição espaçada é sensacional. Nunca estudei
                  de forma tão eficiente."
                </p>
                <div className="text-sm">
                  <p className="font-saira font-bold text-white">
                    Mariana Costa
                  </p>
                  <p className="font-saira text-gray-500">PRF 2024</p>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="h-4 w-4 text-[#8fbc8f]" />
                  ))}
                </div>
                <p className="font-saira text-sm italic text-gray-300">
                  "Melhor plataforma de preparação que já usei. Valeu cada
                  centavo do investimento."
                </p>
                <div className="text-sm">
                  <p className="font-saira font-bold text-white">João Pedro</p>
                  <p className="font-saira text-gray-500">PF 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-[#8fbc8f]" />
              <span className="font-saira text-lg font-bold text-white">
                KAV CONCURSOS
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link
                href="/termos"
                className="font-saira text-gray-400 transition-colors hover:text-white"
              >
                Termos de Uso
              </Link>
              <Link
                href="/privacidade"
                className="font-saira text-gray-400 transition-colors hover:text-white"
              >
                Privacidade
              </Link>
              <Link
                href="/contato"
                className="font-saira text-gray-400 transition-colors hover:text-white"
              >
                Contato
              </Link>
            </div>
            <p className="font-saira text-sm text-gray-500">
              © 2025 KAV Concursos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
