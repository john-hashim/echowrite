import { featureService } from '@/api/services/feature'
import { Thread, ApiResponse } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/useApi'
import { useAppStore } from '@/store/appStore'
import {
  MessageSquarePlus,
  MessageSquare,
  LogOut,
  Trash2,
  Loader2,
  Edit,
  MoreHorizontal,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ThreadSidebarProps {
  currentThreadId?: string
}

const ThreadSidebar: React.FC<ThreadSidebarProps> = ({ currentThreadId }) => {
  const navigate = useNavigate()
  const [openRenameDialog, setOpenRenameDialog] = useState(false)
  const [renameTitle, setRenameTitle] = useState('')
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const {
    isLoading: storeLoading,
    error,
    setThreads,
    setLoading,
    setError,
    clearError,
    deleteThread,
  } = useAppStore()

  const threads = useAppStore(state => state.threads)

  const {
    execute: executeGetThreads,
    loading: apiLoading,
    data: threadsData,
    error: apiError,
  } = useApi<ApiResponse<Thread[]>, []>(featureService.getThreads)

  const { execute: executeDeleteThread, loading: deleteApiLoading } = useApi<
    ApiResponse<Thread>,
    [string]
  >(featureService.deleteThread)

  const { execute: executeUpdateThread } = useApi<ApiResponse<Thread>, [string, string]>(
    featureService.updateThread
  )

  const handleNewChat = () => {
    navigate('/chat/new')
  }

  const { updateThread } = useAppStore()

  const handleThreadClick = (threadId: string) => {
    navigate(`/chat/${threadId}`)
  }

  const handleDeleteThread = async (threadId: string) => {
    try {
      const res = await executeDeleteThread(threadId)
      if (res?.success) {
        deleteThread(res.data.id)
        toast('Chat successfully deleted')
        if (currentThreadId === threadId) {
          handleNewChat()
        }
      } else {
        toast('Error in deleting chat')
      }
    } catch (error) {
      console.error('Delete thread error:', error)
      toast('Error in deleting chat')
    }
  }

  const handleRenameClick = (thread: Thread) => {
    setSelectedThread(thread)
    setRenameTitle(thread.title)
    setOpenDropdownId(null) // Close dropdown first
    setTimeout(() => {
      setOpenRenameDialog(true)
    }, 100)
  }

  const handleRenameSubmit = async () => {
    if (selectedThread && renameTitle.trim()) {
      console.log('Renaming thread:', selectedThread.id, 'to:', renameTitle)
      const res = await executeUpdateThread(selectedThread.id, renameTitle)
      updateThread(res.data)

      toast('Thread renamed successfully')
    }
    handleRenameCancel()
  }

  const handleRenameCancel = () => {
    setOpenRenameDialog(false)
    setRenameTitle('')
    setSelectedThread(null)
  }

  // Load threads on component mount
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

  // Handle threads data updates
  useEffect(() => {
    if (threadsData?.success && threadsData.data) {
      setThreads(threadsData.data)
    }
  }, [threadsData, setThreads])

  useEffect(() => {
    if (apiError) {
      setError('Failed to load threads')
    }
  }, [apiError, setError])

  const isLoading = storeLoading || apiLoading

  return (
    <>
      <div className="border-r border-border bg-card flex flex-col h-screen">
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

        {/* Show general errors */}
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
            {threads.map((thread: Thread) => (
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
                  <DropdownMenu
                    open={openDropdownId === thread.id}
                    onOpenChange={open => setOpenDropdownId(open ? thread.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation()
                          handleRenameClick(thread)
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteThread(thread.id)
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                        disabled={deleteApiLoading}
                      >
                        {deleteApiLoading ? (
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
      </div>

      {/* Separate Dialog outside of any dropdown or nested components */}
      <Dialog open={openRenameDialog} onOpenChange={setOpenRenameDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Thread</DialogTitle>
            <DialogDescription>Enter a new name for this thread</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={renameTitle}
              onChange={e => setRenameTitle(e.target.value)}
              placeholder="Thread title"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleRenameSubmit()
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleRenameCancel}>
                Cancel
              </Button>
              <Button onClick={handleRenameSubmit} disabled={!renameTitle.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ThreadSidebar
