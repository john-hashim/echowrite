import React, { useEffect, useState, useRef } from 'react'
import { Send, Sparkles, Copy, Check } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { featureService } from '@/api/services/feature'
import { ApiResponse, Thread } from '@/types/chat'
import { useApi } from '@/hooks/useApi'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

interface ChatInterfaceProps {
  threadId?: string
}

interface StreamingMessage {
  id: string
  fullContent: string
  displayedContent: string
  isStreaming: boolean
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ threadId }) => {
  const [newThreadFlag, setNewThreadFlag] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tempMessages, setTempMessages] = useState<
    Array<{ id: string; role: string; content: string; createdAt: string }>
  >([])
  const [streamingMessages, setStreamingMessages] = useState<Record<string, StreamingMessage>>({})
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const streamingIntervals = useRef<Record<string, NodeJS.Timeout>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 50)
    return () => clearTimeout(timer)
  }, [streamingMessages])

  useEffect(() => {
    console.log(threadId)
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

  const startStreamingMessage = (messageId: string, content: string) => {
    // Clear any existing interval for this message
    if (streamingIntervals.current[messageId]) {
      clearInterval(streamingIntervals.current[messageId])
    }

    const streamingState: StreamingMessage = {
      id: messageId,
      fullContent: content,
      displayedContent: '',
      isStreaming: true,
    }

    setStreamingMessages(prev => ({
      ...prev,
      [messageId]: streamingState,
    }))

    let currentIndex = 0
    const words = content.split(' ')

    streamingIntervals.current[messageId] = setInterval(() => {
      if (currentIndex < words.length) {
        setStreamingMessages(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            displayedContent: words.slice(0, currentIndex + 1).join(' '),
          },
        }))
        currentIndex++
      } else {
        // Streaming complete
        clearInterval(streamingIntervals.current[messageId])
        delete streamingIntervals.current[messageId]
        setStreamingMessages(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            isStreaming: false,
          },
        }))
      }
    }, 20) // Increased speed from 50ms to 20ms
  }

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast.success('Message copied to clipboard')

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  const thread = useAppStore(state => state.threads.find(t => t.id === threadId))

  const handleSendMessage = async () => {
    const userMessage = messageText.trim()
    if (!userMessage) return

    setIsLoading(true)
    setMessageText('')

    // Add temporary user message
    const tempUserMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    }

    // Add temporary loading message
    const tempLoadingMessage = {
      id: `temp-loading-${Date.now()}`,
      role: 'assistant',
      content: 'EchoWrite is thinking',
      createdAt: new Date().toISOString(),
    }

    setTempMessages([tempUserMessage, tempLoadingMessage])

    try {
      if (thread) {
        const res = await executeAddMessage(thread.id, userMessage)
        updateThread(res.data)
        setTempMessages([])

        // Start streaming the latest assistant message
        if (res.data.message && res.data.message.length > 0) {
          const latestMessage = res.data.message[res.data.message.length - 1]
          if (latestMessage && latestMessage.role === 'assistant') {
            startStreamingMessage(latestMessage.id, latestMessage.content)
          }
        }
      } else {
        const res = await executeAddThread(userMessage)
        unshiftThread(res.data)
        setTempMessages([])

        // Start streaming the latest assistant message
        if (res.data.message && res.data.message.length > 0) {
          const latestMessage = res.data.message[res.data.message.length - 1]
          if (latestMessage && latestMessage.role === 'assistant') {
            startStreamingMessage(latestMessage.id, latestMessage.content)
          }
        }

        navigate(`/chat/${res.data.id}`)
      }
    } catch (e) {
      console.log(e)
      toast.error('Failed to send message')
      setTempMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatContent = (content: string) => {
    // Handle markdown-style formatting
    const processText = (text: string) => {
      // Split by line breaks first
      const lines = text.split('\n')

      return lines.map((line, lineIndex) => {
        // Process bold text (**text**)
        const parts = line.split(/(\*\*.*?\*\*)/)

        const processedLine = parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // Remove the ** and make bold
            const boldText = part.slice(2, -2)
            return (
              <strong key={`${lineIndex}-${partIndex}`} className="font-semibold">
                {boldText}
              </strong>
            )
          }
          return part
        })

        return (
          <React.Fragment key={lineIndex}>
            {processedLine}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        )
      })
    }

    return processText(content)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault()
      if (messageText.trim()) {
        handleSendMessage()
      }
    }
  }

  // Combine real messages with temporary messages
  const allMessages = [...(thread?.message || []), ...tempMessages]

  // Track message count for scrolling logic
  const messageCount = allMessages.length
  const lastMessageId = allMessages[allMessages.length - 1]?.id

  useEffect(() => {
    scrollToBottom()
  }, [messageCount, lastMessageId])

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'oklch(0.205 0 0)',
      }}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          {thread?.title && (
            <h1 className="text-xl font-semibold text-white truncate">{thread.title}</h1>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {newThreadFlag && tempMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div
                className="p-8 rounded-2xl mb-6 mx-auto w-fit transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'rgba(180, 64, 10, 0.08)',
                }}
              >
                <Sparkles className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Start a new conversation</h2>
              <p className="text-slate-300 text-lg">
                Ask me anything and I'll help you explore ideas, solve problems, or just have a
                great conversation.
              </p>
            </div>
          </div>
        ) : (
          <>
            {allMessages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-center'}`}
              >
                <div className="w-[70%] max-w-4xl">
                  <div
                    className={`px-6 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] ${
                      message.role === 'user'
                        ? 'rounded-br-md ml-auto max-w-[75%]'
                        : 'rounded-bl-md'
                    }`}
                    style={{
                      background: message.role === 'user' ? 'rgba(40, 40, 40, 0.8)' : 'transparent',
                      boxShadow: 'none',
                    }}
                  >
                    <div className="text-base leading-7 whitespace-pre-wrap text-white">
                      {message.id.includes('temp-loading') ? (
                        <div className="flex items-center gap-2">
                          <span>{message.content}</span>
                          <span className="inline-flex gap-1">
                            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                              .
                            </span>
                            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
                              .
                            </span>
                            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
                              .
                            </span>
                          </span>
                        </div>
                      ) : streamingMessages[message.id] ? (
                        <>
                          {formatContent(streamingMessages[message.id].displayedContent)}
                          {streamingMessages[message.id].isStreaming && (
                            <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />
                          )}
                        </>
                      ) : (
                        formatContent(message.content)
                      )}
                    </div>
                  </div>

                  {/* Copy Button - positioned below the message */}
                  {!message.id.includes('temp-loading') && (
                    <div
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mt-2`}
                    >
                      <button
                        onClick={() => {
                          const content = streamingMessages[message.id]
                            ? streamingMessages[message.id].fullContent
                            : message.content
                          handleCopyMessage(content, message.id)
                        }}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200 opacity-70 hover:opacity-100"
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Custom Input Area */}
      <div className="px-6 pb-6 flex justify-center">
        <div className="w-[70%] max-w-4xl">
          <div
            className="relative rounded-2xl shadow-2xl transition-all duration-200 focus-within:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="w-full px-6 py-4 pr-16 bg-transparent text-white placeholder-slate-400 resize-none focus:outline-none rounded-2xl min-h-[60px] max-h-40 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              rows={1}
              style={{
                fontFamily: 'inherit',
                fontSize: '16px',
                lineHeight: '1.5',
              }}
              onInput={e => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 160)}px`
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isLoading}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-3 rounded-xl transition-all duration-200 ${
                messageText.trim() && !isLoading
                  ? 'hover:scale-110 active:scale-95'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{
                background:
                  messageText.trim() && !isLoading ? 'rgba(180, 64, 10, 0.08)' : '#64748B',
              }}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-center text-slate-400 text-xs mt-3">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
