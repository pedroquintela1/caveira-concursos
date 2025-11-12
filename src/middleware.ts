import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log('🔒 [MIDDLEWARE] Tentando acessar:', path);

  // Criar response que pode ser modificado
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Criar cliente Supabase para middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Verificar autenticação
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Rotas públicas (não requerem autenticação)
  const publicPaths = ['/login', '/signup', '/auth/callback', '/'];
  const isPublicPath = publicPaths.includes(path) || path.startsWith('/auth/');

  // Se não autenticado e tentando acessar rota protegida
  if (!user && !isPublicPath) {
    console.log(
      '⛔ [MIDDLEWARE] Usuário não autenticado, redirecionando para /login'
    );
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se autenticado e tentando acessar login/signup, redirecionar para dashboard
  if (user && (path === '/login' || path === '/signup')) {
    console.log(
      '✅ [MIDDLEWARE] Usuário já autenticado, redirecionando para /dashboard'
    );
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Verificar acesso admin
  if (path.startsWith('/admin')) {
    if (!user) {
      console.log('⛔ [MIDDLEWARE] Admin requer autenticação');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('✅ [MIDDLEWARE] Usuário autenticado:', user.email);

    // Buscar role e is_banned do profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', user.id)
      .single();

    console.log('👤 [MIDDLEWARE] Profile:', profile);
    console.log('❌ [MIDDLEWARE] Profile Error:', profileError);

    if (profileError) {
      console.error('⛔ [MIDDLEWARE] Erro ao buscar profile:', profileError);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Verificar se usuário está banido
    if (profile?.is_banned) {
      console.log('⛔ [MIDDLEWARE] Usuário banido');
      return NextResponse.redirect(new URL('/banned', request.url));
    }

    // Verificar se tem permissão admin
    const allowedRoles = ['super_admin', 'admin', 'moderador'];
    if (!profile?.role || !allowedRoles.includes(profile.role)) {
      console.log('⛔ [MIDDLEWARE] Role não permitido:', profile?.role);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log('✅ [MIDDLEWARE] Acesso admin autorizado');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
