import { featureService } from '@/api/services/feature'
import { Thread, ApiResponse } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/useApi'
import { useAppStore } from '@/store/appStore'
import { MessageSquarePlus, Trash2, Loader2, Edit, MoreHorizontal, Sparkles } from 'lucide-react'
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
    setOpenDropdownId(null)
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
      <div className="flex flex-col h-full">
        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            className={`w-full justify-start gap-3 h-10 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-0 ${
              currentThreadId === undefined || currentThreadId === 'new'
                ? 'text-white'
                : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            variant="outline"
            style={
              currentThreadId === undefined || currentThreadId === 'new'
                ? {
                    background: 'rgba(180, 64, 10, 0.08)',
                    color: '#E2E8F0',
                  }
                : {}
            }
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-3 mb-3 p-2 text-sm text-red-200 bg-red-900/30 border border-red-800/50 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && threads.length === 0 && (
          <div className="flex items-center justify-center p-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
              <span className="text-sm text-slate-300">Loading conversations...</span>
            </div>
          </div>
        )}

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 px-3">
            {threads.map((thread: Thread) => (
              <div
                key={thread.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                  currentThreadId === thread.id ? '' : 'hover:bg-slate-700/30'
                }`}
                onClick={() => handleThreadClick(thread.id)}
                style={
                  currentThreadId === thread.id
                    ? {
                        background: 'rgba(180, 64, 10, 0.06)',
                      }
                    : {}
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-semibold text-sm truncate transition-colors ${
                        currentThreadId === thread.id
                          ? 'text-slate-100'
                          : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {thread.title}
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
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-7 w-7 p-0 hover:bg-slate-600/50 text-slate-300 hover:text-white"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-36 bg-slate-800 border-slate-600 shadow-xl"
                    >
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation()
                          handleRenameClick(thread)
                        }}
                        className="cursor-pointer text-slate-200 hover:text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteThread(thread.id)
                        }}
                        className="cursor-pointer text-red-300 hover:text-red-200 hover:bg-red-900/30 focus:bg-red-900/30 focus:text-red-200"
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

          {/* Empty State */}
          {!isLoading && threads.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 rounded-xl mb-4 bg-slate-800/50 border border-slate-600">
                <Sparkles className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-200 mb-1">No conversations yet</p>
              <p className="text-sm text-slate-400">Start a new chat to begin your journey</p>
            </div>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={openRenameDialog} onOpenChange={setOpenRenameDialog}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-600 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Rename Conversation</DialogTitle>
            <DialogDescription className="text-slate-300">
              Give your conversation a memorable name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <Input
              value={renameTitle}
              onChange={e => setRenameTitle(e.target.value)}
              placeholder="Enter conversation title..."
              autoFocus
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleRenameSubmit()
                }
              }}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleRenameCancel}
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenameSubmit}
                disabled={!renameTitle.trim()}
                className="font-medium border-0"
                style={
                  renameTitle.trim()
                    ? {
                        background: 'rgba(180, 64, 10, 0.08)',
                        color: '#E2E8F0',
                      }
                    : { backgroundColor: '#64748B', color: 'white' }
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ThreadSidebar
