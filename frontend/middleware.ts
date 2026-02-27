import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // 로그인이 안 된 상태로 보호된 페이지에 접근할 경우
  if (!token) {
    // 이미 로그인/회원가입 페이지면 그대로 둠
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.next()
    }
    
    // 그 외의 모든 보호된 페이지는 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 로그인이 된 상태에서 로그인/회원가입 페이지에 접근하면 메인으로
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음으로 시작하는 경로를 제외한 모든 경로에서 실행:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     * - public 폴더 내 이미지 등
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
}
