import { ApiResponse, featureService, Thread } from '@/api/services/feature'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/useApi'
import { useAppStore } from '@/store/appStore'
import { MessageSquarePlus, MessageSquare, LogOut, Trash2, Loader2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface ThreadSidebarProps {
  currentThreadId?: string
  onLogout: () => void
}

const ThreadSidebar: React.FC<ThreadSidebarProps> = ({ currentThreadId, onLogout }) => {
  const navigate = useNavigate()

  const {
    threads,
    isLoading: storeLoading,
    error,
    setThreads,
    setLoading,
    setError,
    clearError,
  } = useAppStore()

  const {
    execute: executeGetThreads,
    loading: apiLoading,
    data,
    error: apiError,
  } = useApi<ApiResponse<Thread[]>, []>(featureService.getThreads)

  const handleNewChat = () => {
    navigate('/chat/new')
  }

  const handleThreadClick = (threadId: string) => {
    navigate(`/chat/${threadId}`)
  }

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      console.log('Thread deleted:', threadId)
    } catch (error) {
      setError('Failed to delete thread')
      console.error('Delete thread error:', error)
    }
  }

  useEffect(() => {
    const loadThreads = async () => {
      try {
        clearError()
        setLoading(true)
        await executeGetThreads()
      } catch (error) {
        setError('Failed to load threads')
      } finally {
        setLoading(false)
      }
    }

    loadThreads()
  }, [executeGetThreads, setLoading, setError, clearError])

  useEffect(() => {
    if (data?.success && data.data) {
      setThreads(data.data)
    }
  }, [data, setThreads])

  useEffect(() => {
    if (apiError) {
      setError('Failed to load threads')
    }
  }, [apiError, setError])

  const isLoading = storeLoading || apiLoading

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
          variant={
            currentThreadId === undefined || currentThreadId === 'new' ? 'default' : 'outline'
          }
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 border-b border-red-200">{error}</div>
      )}

      {isLoading && threads.length === 0 && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading threads...</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {threads.map(thread => (
            <div
              key={thread.id}
              className={`group relative p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                currentThreadId === thread.id ? 'bg-accent' : ''
              }`}
              onClick={() => handleThreadClick(thread.id)}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{thread.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(thread.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={e => handleDeleteThread(thread.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && threads.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Button onClick={onLogout} variant="outline" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default ThreadSidebar
