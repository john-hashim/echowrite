import { Button } from '@/components/ui/button'
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  return (
    <>
      <div>Dashboard Component</div>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  )
}

export default Dashboard
