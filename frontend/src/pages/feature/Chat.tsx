import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { authService } from '@/api/services/auth'
import { useApi } from '@/hooks/useApi'
import ThreadSidebar from '@/pages/feature/ThreadSidebar'
import ChatInterface from '@/pages/feature/ChatInterface'
import { useAppStore } from '@/store/appStore'

const Chat: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { threadId } = useParams<{ threadId: string }>()
  const { logout: zustandLogout } = useAppStore()
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

  const isNewChat = !threadId || threadId === 'new'

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ThreadSidebar currentThreadId={threadId} onLogout={handleLogout} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface threadId={threadId} isNewChat={isNewChat} />
      </div>
    </div>
  )
}

export default Chat
