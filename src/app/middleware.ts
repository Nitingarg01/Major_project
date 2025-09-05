export { auth as middleware } from '@/app/auth'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/create/:path*',
    '/interview/:path*',
    '/resume-analyzer/:path*'
  ]
}