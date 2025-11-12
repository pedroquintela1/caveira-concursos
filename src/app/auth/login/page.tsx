'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // Login bem-sucedido - redirecionar para dashboard
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Erro no login:', err);

      // Mensagens de erro em português
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Tente novamente.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login.');
      } else if (err.message?.includes('Too many requests')) {
        setError(
          'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
        );
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                <p className="font-saira text-xs uppercase tracking-wider text-gray-500">
                  BEM-VINDO
                </p>
                <h1 className="font-saira text-3xl font-bold tracking-tight text-white">
                  FAÇA SEU LOGIN
                </h1>
                <p className="text-sm text-gray-400">
                  Não é cadastrado ainda?{' '}
                  <Link
                    href="/auth/register"
                    className="font-medium text-[#8fbc8f] transition-colors hover:text-[#7da87d]"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5 p-6">
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
                  E-mail
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
                    placeholder="••••••••"
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

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-[#8fbc8f] focus:ring-[#8fbc8f] focus:ring-offset-0"
                  />
                  <span className="text-gray-400">Lembrar login</span>
                </label>

                <Link
                  href="/auth/reset-password"
                  className="text-[#8fbc8f] transition-colors hover:text-[#7da87d]"
                >
                  Esqueci a senha
                </Link>
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
                    ENTRANDO...
                  </>
                ) : (
                  'ENTRAR'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="px-6 pb-6 text-center text-xs text-gray-500">
              Ao fazer login, você concorda com nossos{' '}
              <Link
                href="/termos"
                className="text-gray-400 underline hover:text-gray-300"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
