 import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { jwtDecode } from "jwt-decode";

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  const pathnameParts = request.nextUrl.pathname.split('/');
  const locale = pathnameParts[1] ?? routing.defaultLocale;
  const pathname = '/' + pathnameParts.slice(2).join('/');

  const authToken = request.cookies.get("authToken")?.value;

  console.log("Locale:", locale);
  console.log("Pathname:", pathname);
  console.log("Token:", authToken ? "Sí" : "No");

  const publicRoutes = ["/login", "/register"];
  const routesClients = ["/", "/aboutus", "/contactus"];

  // Rutas públicas y de clientes sin token
  if ((publicRoutes.includes(pathname) || routesClients.includes(pathname)) && !authToken) {
    return intlResponse;
  }

  // Si no hay token y no es pública: redirige
  if (!authToken) {
    console.log("🔁 Sin token. Redirigiendo a /login");
    return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl.origin));
  }

  try {
    const decoded: any = jwtDecode(authToken);
    const userRole = decoded.role;

    const allowedRoutes = {
      USER: [
        "/employee", 
        "/store/products", 
        "/sales/make-sales"
      ],

      ADMIN: [
        "/admin", 
        "/box/cash-history", 
        "/box/manage-cash", 
        "/store/products", 
        "/sales/make-sales", 
        "/sales/sales-invoices",
        "/shopping/edit-purchase", 
        "/shopping/make-purchase", 
        "/shopping/view-purchases",
        "/shopping/suppliers", 
        "/users/customers", 
        "/users/employees"
      ],

      SUPERADMIN:[
        "/admin", 
        "/box/cash-history", 
        "/box/manage-cash", 
        "/store/products", 
        "/sales/make-sales", 
        "/sales/sales-invoices",
        "/shopping/edit-purchase", 
        "/shopping/make-purchase", 
        "/shopping/view-purchases",
        "/shopping/suppliers", 
        "/users/customers", 
        "/users/employees"
      ],
    
    };

    const userRoutes = allowedRoutes[userRole as keyof typeof allowedRoutes];

    const fallback = userRole === "ADMIN" || userRole === "SUPERADMIN" ? "/admin" : "/employee";

    // Solo redirige si NO está en la ruta esperada
    if (!userRoutes?.some(route => pathname.startsWith(route))) {
      if (pathname !== fallback) {
        return NextResponse.redirect(new URL(`/${locale}${fallback}`, request.nextUrl.origin));
      }
    }

    const response = intlResponse;
    response.headers.set("Set-Cookie", `userRole=${userRole}; Path=/; SameSite=Strict`);
    return response;

  } catch (error) {
    console.error("Error al decodificar el token:", error);
    const response = NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl.origin));
    response.headers.set("Set-Cookie", "authToken=; Path=/; HttpOnly; Max-Age=0");
    return response;
  }
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};