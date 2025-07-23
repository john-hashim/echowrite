import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { authService } from '@/api/services/auth'
import { useApi } from '@/hooks/useApi'
import ThreadSidebar from '@/pages/feature/ThreadSidebar'
import ChatInterface from '@/pages/feature/ChatInterface'
import { useAppStore } from '@/store/appStore'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon" className="border-r transition-all duration-300">
          <SidebarHeader className="border-b p-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold sidebar-fade">Chats</h2>
              <SidebarTrigger className="h-8 w-8" />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <div className="sidebar-fade h-full">
              <ThreadSidebar currentThreadId={threadId} />
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full relative overflow-hidden"
              onClick={handleLogout}
            >
              <span className="sidebar-fade flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </span>
              <span className="sidebar-icon absolute inset-0 flex items-center justify-center opacity-0">
                <LogOut className="h-4 w-4" />
              </span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="flex h-full flex-col">
            <ChatInterface threadId={threadId} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default Chat
