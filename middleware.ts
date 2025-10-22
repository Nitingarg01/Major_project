export { auth as middleware } from './src/app/auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/create/:path*',
    '/interview/:path*',
    '/resume-analyzer/:path*',
    // Explicitly exclude API routes from middleware to prevent session conflicts
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}