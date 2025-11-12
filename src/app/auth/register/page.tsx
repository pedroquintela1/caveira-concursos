'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              nome_completo: nomeCompleto,
            },
          },
        }
      );

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Criar perfil na tabela profiles
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: email,
        nome_completo: nomeCompleto,
        plano: 'free',
        role: 'user',
        is_active: true,
      });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Não falha o cadastro, o perfil pode ser criado depois via trigger
      }

      // Sucesso!
      setSuccess(true);

      // Redirecionar após 3 segundos
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    } catch (err: any) {
      console.error('Erro no cadastro:', err);

      // Mensagens de erro em português
      if (err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (err.message?.includes('Password should be')) {
        setError('A senha deve ter no mínimo 6 caracteres.');
      } else if (err.message?.includes('Invalid email')) {
        setError('Email inválido. Verifique e tente novamente.');
      } else if (err.message?.includes('Email rate limit exceeded')) {
        setError(
          'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
        );
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Se cadastro foi bem-sucedido
  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-4">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=2000')",
          }}
        />

        {/* Dark Overlay com tom azulado */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black opacity-95" />

        <div className="relative z-10 w-full max-w-md">
          <div className="space-y-6 rounded-lg border border-gray-800 bg-gray-900/90 p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-600 bg-green-600/20">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="font-saira text-2xl font-bold text-white">
                CONTA CRIADA COM SUCESSO!
              </h2>
              <p className="text-gray-400">
                Bem-vindo ao KAV Concursos! Você será redirecionado para o
                dashboard em instantes...
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#8fbc8f] border-t-transparent" />
              Redirecionando...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Image with Overlay */}
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

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900/90 shadow-2xl backdrop-blur-sm">
            {/* Header */}
            <div className="border-b border-gray-800 px-6 pb-6 pt-8 text-center">
              {/* Logo/Icon */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-700 bg-gray-800">
                  <Shield className="h-8 w-8 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="font-saira text-3xl font-bold tracking-tight text-white">
                  CRIAR CONTA GRATUITA
                </h1>
                <p className="text-sm text-gray-400">
                  Comece a estudar para concursos hoje mesmo
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5 p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-800/50 bg-red-900/20 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Nome Completo */}
              <div className="space-y-2">
                <label
                  htmlFor="nome"
                  className="text-sm font-medium text-gray-300"
                >
                  Nome Completo
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#8fbc8f] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#8fbc8f] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 pr-12 text-white transition-all placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#8fbc8f] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-300"
                >
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 pr-12 text-white transition-all placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#8fbc8f] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full transform rounded-lg bg-[#8fbc8f] py-3 font-saira font-semibold text-gray-900 transition-all hover:scale-[1.02] hover:bg-[#7da87d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                    CRIANDO CONTA...
                  </>
                ) : (
                  'CRIAR CONTA GRATUITA'
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-400">
                Já tem uma conta?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-[#8fbc8f] transition-colors hover:text-[#7da87d]"
                >
                  Entrar
                </Link>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 pb-6 text-center text-xs text-gray-500">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link
                href="/termos"
                className="text-gray-400 underline hover:text-gray-300"
              >
                Termos de Uso
              </Link>
              {' e '}
              <Link
                href="/privacidade"
                className="text-gray-400 underline hover:text-gray-300"
              >
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
