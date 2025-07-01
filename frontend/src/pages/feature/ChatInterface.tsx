import React, { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { featureService } from '@/api/services/feature'
import { ApiResponse, Thread } from '@/types/chat'
import { useApi } from '@/hooks/useApi'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

interface ChatInterfaceProps {
  threadId?: string
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ threadId }) => {
  const [newThreadFlag, setNewThreadFlag] = useState(true)
  const [messageText, setMessageText] = useState('')
  const navigate = useNavigate()

  const { execute: executeGetThread, error: apiError } = useApi<ApiResponse<Thread>, [string]>(
    featureService.getThread
  )

  const { execute: executeAddMessage } = useApi<ApiResponse<Thread>, [string, string]>(
    featureService.addMessage
  )

  const { execute: executeAddThread } = useApi<ApiResponse<Thread>, [string]>(
    featureService.addThread
  )

  const { updateThread, unshiftThread } = useAppStore()

  useEffect(() => {
    if (threadId) {
      setNewThreadFlag(false)
      executeGetThread(threadId)
        .then(response => {
          if (response?.data) {
            updateThread(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch thread:', error)
          toast.error('Failed to load conversation')
        })
    } else {
      setNewThreadFlag(true)
    }
  }, [threadId, executeGetThread])

  useEffect(() => {
    if (apiError) {
      toast('Error in fetching messages')
    }
  }, [apiError])

  const thread = useAppStore(state => state.threads.find(t => t.id === threadId))

  const handleSendMessage = async () => {
    try {
      if (messageText && thread) {
        const res = await executeAddMessage(thread.id, messageText)
        updateThread(res.data)
        setMessageText('')
      } else {
        const res = await executeAddThread(messageText)
        unshiftThread(res.data)
        setMessageText('')
        navigate(`/chat/${res.data.id}`)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="border-t border-gray-500 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">{thread?.title}</div>
        </div>
      </div>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {newThreadFlag ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Start a new conversation
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Type a message below to begin</p>
            </div>
          </div>
        ) : (
          thread?.message?.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {formatContent(message.content)}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-blue-100 dark:text-blue-200'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent max-h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              style={{
                minHeight: '48px',
                height: 'auto',
              }}
              onInput={e => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer text-white rounded-full p-3 transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
