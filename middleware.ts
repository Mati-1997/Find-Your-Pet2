import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Esta función se ejecuta antes de cada solicitud
export function middleware(request: NextRequest) {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/register", "/forgot-password"]

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname === "/",
  )

  // Simulación de verificación de autenticación
  // En una aplicación real, verificarías un token o cookie de sesión
  const isAuthenticated = request.cookies.has("auth_token")

  // Si no está autenticado y la ruta no es pública, redirigir al login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si está autenticado y está intentando acceder a una ruta pública, redirigir a home
  if (isAuthenticated && isPublicRoute && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (archivos de Next.js)
     * 3. /_static (si usas Vercel para servir archivos estáticos)
     * 4. /favicon.ico, /sitemap.xml, /robots.txt (archivos comunes)
     */
    "/((?!api|_next|_static|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
