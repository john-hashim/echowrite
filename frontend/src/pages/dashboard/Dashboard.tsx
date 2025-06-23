import { Button } from '@/components/ui/button'
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/api/services/auth'
import { useApi } from '@/hooks/useApi'
import { useUserStore } from '@/store/userStore'

const Dashboard: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { logout: zustandLogout } = useUserStore()

  const { execute: executeLogout } = useApi<{ success: boolean }, []>(authService.logout)

  const handleLogout = async () => {
    try {
      await executeLogout()
      logout()
      zustandLogout()
      navigate('/login')
    } catch (error) {
      logout()
      zustandLogout()
      navigate('/login')
    }
  }

  return (
    <>
      <div>Dashboard Component</div>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  )
}

export default Dashboard
