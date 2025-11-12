'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ArrowLeft, Shield } from 'lucide-react';

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      // Sucesso!
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);

      // Mensagens de erro em português
      if (err.message?.includes('Email not found')) {
        setError('Email não encontrado. Verifique e tente novamente.');
      } else if (err.message?.includes('Email rate limit exceeded')) {
        setError(
          'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
        );
      } else {
        setError('Erro ao enviar email de recuperação. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de sucesso
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
          <div className="rounded-lg border border-gray-800 bg-gray-900/90 p-8 shadow-2xl backdrop-blur-sm">
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-600 bg-green-600/20">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="font-saira text-2xl font-bold text-white">
                  EMAIL ENVIADO!
                </h2>
                <p className="text-gray-400">
                  Enviamos um link para redefinir sua senha para{' '}
                  <strong className="text-white">{email}</strong>
                </p>
              </div>

              <div className="rounded-lg border border-blue-800/50 bg-blue-900/20 p-4">
                <p className="mb-2 text-sm font-medium text-blue-300">
                  Próximos passos:
                </p>
                <ol className="list-inside list-decimal space-y-1 text-left text-sm text-blue-200">
                  <li>Verifique sua caixa de entrada</li>
                  <li>Clique no link de recuperação</li>
                  <li>Defina uma nova senha</li>
                </ol>
              </div>

              <p className="text-xs text-gray-500">
                Não recebeu o email?{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="font-medium text-[#8fbc8f] transition-colors hover:text-[#7da87d]"
                >
                  Enviar novamente
                </button>
              </p>

              <Link href="/auth/login" className="block">
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de reset
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
                  ESQUECI MINHA SENHA
                </h1>
                <p className="text-sm text-gray-400">
                  Digite seu email e enviaremos um link para redefinir sua senha
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPassword} className="space-y-5 p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-800/50 bg-red-900/20 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300"
                >
                  Email Cadastrado
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

              <div className="rounded-lg border border-blue-800/50 bg-blue-900/20 p-3">
                <p className="text-xs text-blue-300">
                  <strong>Importante:</strong> O link de recuperação expira em 1
                  hora por segurança.
                </p>
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
                    ENVIANDO EMAIL...
                  </>
                ) : (
                  'ENVIAR LINK DE RECUPERAÇÃO'
                )}
              </Button>

              <Link href="/auth/login" className="block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Login
                </Button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
