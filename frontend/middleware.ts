import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // 1. 이미 로그인/회원가입 페이지에 있는 경우
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      // 이미 토큰이 있다면 메인으로 리다이렉트
      return NextResponse.redirect(new URL('/', request.url))
    }
    // 토큰 없으면 그대로 진행
    return NextResponse.next()
  }

  // 2. 보호된 페이지에 접근하는데 토큰이 없는 경우
  if (!token) {
    // 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 3. 그 외 (토큰이 있고 보호된 페이지 접근) 정상 진행
  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정 (최적화)
export const config = {
  matcher: [
    /*
     * 아래 경로들을 제외한 모든 경로에서 미들웨어 실행:
     * - api: API 라우트
     * - _next/static: 정적 파일 (JS, CSS)
     * - _next/image: 이미지 최적화 파일
     * - favicon.ico, public 폴더 이미지 등
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}
