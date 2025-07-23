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
import { LogOut, MessageSquare } from 'lucide-react'

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
        <Sidebar
          collapsible="icon"
          className="border-0 shadow-lg transition-all duration-300 ease-in-out"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          }}
        >
          <SidebarHeader className="p-2">
            <div className="flex items-center justify-between">
              <div className="sidebar-fade flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #B4400A 0%, #C66A00 50%, #C69000 100%)',
                  }}
                >
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Echowrite</h2>
              </div>
              <SidebarTrigger className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md transition-colors" />
            </div>
          </SidebarHeader>

          <SidebarContent className="p-0">
            <div className="sidebar-fade h-full">
              <ThreadSidebar currentThreadId={threadId} />
            </div>
          </SidebarContent>

          <SidebarFooter className="p-2">
            <Button
              variant="ghost"
              className="w-full relative overflow-hidden bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white border border-slate-600/30 transition-all duration-200"
              onClick={handleLogout}
            >
              <span className="sidebar-fade flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </span>
              <span className="sidebar-icon absolute inset-0 flex items-center justify-center opacity-0">
                <LogOut className="h-4 w-4" />
              </span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-white">
          <div className="flex h-full flex-col">
            <ChatInterface threadId={threadId} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default Chat
