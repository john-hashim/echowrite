import { Button } from '@/components/ui/button'
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/api/services/auth'
import { useApi } from '@/hooks/useApi'

const Dashboard: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const { execute: executeLogout } = useApi<{ success: boolean }, []>(authService.logout)

  const handleLogout = async () => {
    try {
      await executeLogout()
      logout()
      navigate('/login')
    } catch (error) {
      logout()
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
