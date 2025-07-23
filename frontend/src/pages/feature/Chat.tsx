import React, { useState, useEffect } from 'react'
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
import { LogOut, Menu, X } from 'lucide-react'
import echowriteLogo from '@/assets/echowrite-logo.png'

const Chat: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { threadId } = useParams<{ threadId: string }>()
  const { logout: zustandLogout } = useAppStore()
  const { execute: executeLogout } = useApi<{ success: boolean }, []>(authService.logout)

  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto-close sidebar on mobile when window resizes
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when threadId changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [threadId, isMobile])

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex h-screen w-full relative">
        {/* Mobile Header */}
        <div
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4"
          style={{
            background: 'oklch(0.205 0 0)',
            borderBottom: '1px solid oklch(1 0 0 / 10%)',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:scale-[1.02] transition-all duration-200"
            style={{
              color: 'oklch(0.985 0 0)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(180, 64, 10, 0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-2">
            <img src={echowriteLogo} alt="Echowrite Logo" className="h-6 w-6 object-contain" />
            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'oklch(0.985 0 0)' }}>
              Echowrite
            </h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="p-2 hover:scale-[1.02] transition-all duration-200"
            style={{
              color: 'oklch(0.985 0 0)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(180, 64, 10, 0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <div
              className="fixed left-0 top-0 bottom-0 w-80 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl"
              style={{
                background: 'oklch(0.205 0 0)',
              }}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Sidebar Header */}
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={echowriteLogo}
                        alt="Echowrite Logo"
                        className="h-6 w-6 object-contain"
                      />
                      <h2
                        className="text-xl font-bold tracking-tight"
                        style={{ color: 'oklch(0.985 0 0)' }}
                      >
                        Echowrite
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                      className="h-8 w-8 p-0 transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        color: 'oklch(0.985 0 0)',
                        background: 'transparent',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(180, 64, 10, 0.08)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Mobile Sidebar Content */}
                <div className="flex-1 overflow-hidden">
                  <ThreadSidebar currentThreadId={threadId} />
                </div>

                {/* Mobile Sidebar Footer */}
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full relative overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] h-10 font-medium"
                    onClick={handleLogout}
                    style={{
                      background: 'oklch(1 0 0 / 15%)',
                      color: 'oklch(0.985 0 0)',
                      border: '1px solid oklch(1 0 0 / 10%)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(180, 64, 10, 0.08)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'oklch(1 0 0 / 15%)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mobile Chat Interface */}
        <div
          className="flex-1 pt-16"
          style={{
            background: 'oklch(0.205 0 0)',
          }}
        >
          <ChatInterface threadId={threadId} />
        </div>
      </div>
    )
  }

  // Desktop layout (original)
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
                <img src={echowriteLogo} alt="Echowrite Logo" className="h-6 w-6 object-contain" />
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

/* Add these mobile-specific styles to your CSS file */
