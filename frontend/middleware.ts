import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // 1. 로그인/회원가입 페이지 접근 시
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      // 이미 로그인이 되어 있다면 메인으로
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // 2. 그 외 모든 페이지 (보호된 경로)
  if (!token) {
    // 토큰이 없으면 로그인 페이지로
    const loginUrl = new URL('/login', request.url)
    // 현재 가려던 주소를 저장해서 로그인 후 돌아오게 할 수 있음
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// 미들웨어 실행 제외 대상 설정
export const config = {
  matcher: [
    /*
     * 아래로 시작하는 경로를 제외한 모든 경로에서 실행:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico, public 내 이미지 파일들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css)$).*)',
  ],
}
