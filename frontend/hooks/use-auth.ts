import { useEffect, useState } from 'react'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. 먼저 localStorage에서 확인
    let storedToken = localStorage.getItem('token')
    
    // 2. 만약 localStorage에 없는데 쿠키에는 있다면 (미들웨어가 통과시킨 경우)
    if (!storedToken) {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
      
      if (cookieToken) {
        // 쿠키의 토큰을 localStorage에 복사하여 API 요청이 가능하게 함
        localStorage.setItem('token', cookieToken)
        storedToken = cookieToken
      }
    }
    
    setToken(storedToken)
    setIsLoading(false)
  }, [])

  return { token, isLoading }
}
