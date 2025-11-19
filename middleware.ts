import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes for admin panel
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || 
                       request.nextUrl.pathname.startsWith('/dashboard')
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  // Redirect unauthenticated users from admin routes to login
  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If user is authenticated and on /auth/login, redirect to their dashboard
  if (isAuthRoute && user && request.nextUrl.pathname === '/auth/login') {
    // Check if platform admin
    const { data: platformAdmin } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .eq('role', 'platform_admin')
      .maybeSingle()

    if (platformAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Check if restaurant admin
    const { data: restaurantAdmin } = await supabase
      .from('restaurant_admins')
      .select('id, restaurant_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (restaurantAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // For other /auth routes, only redirect if already authenticated
  if (isAuthRoute && user && !request.nextUrl.pathname.startsWith('/auth/login')) {
    // Check if platform admin
    const { data: platformAdmin } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .eq('role', 'platform_admin')
      .maybeSingle()

    if (platformAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Check if restaurant admin
    const { data: restaurantAdmin } = await supabase
      .from('restaurant_admins')
      .select('id, restaurant_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (restaurantAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
