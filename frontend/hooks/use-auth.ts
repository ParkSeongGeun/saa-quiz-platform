import { useEffect, useState } from 'react'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 이제 미들웨어가 리다이렉트를 처리하므로, 여기서는 단순히 상태값만 동기화합니다.
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
    setIsLoading(false)
  }, [])

  return { token, isLoading }
}
