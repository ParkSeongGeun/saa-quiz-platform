import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 1. 토큰 확인
    let storedToken = localStorage.getItem('token')
    
    // 2. 쿠키 동기화 (기존 로직 유지)
    if (!storedToken) {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
      
      if (cookieToken) {
        localStorage.setItem('token', cookieToken)
        storedToken = cookieToken
      }
    }

    // 3. 리다이렉트 로직 (미들웨어 대신 수행)
    const isAuthPage = pathname === '/login' || pathname === '/register'
    
    if (!storedToken && !isAuthPage) {
      router.push('/login')
    } else if (storedToken && isAuthPage) {
      router.push('/')
    } else {
      setToken(storedToken)
      setIsLoading(false)
    }
  }, [router, pathname])

  return { token, isLoading }
}
