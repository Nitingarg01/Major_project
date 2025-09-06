export { auth as middleware } from './src/app/auth'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/create/:path*',
    '/interview/:path*',
    '/resume-analyzer/:path*'
  ]
}