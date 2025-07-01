import React from 'react'

interface ChatInterfaceProps {
  threadId?: string
  isNewChat: boolean
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ threadId, isNewChat }) => {
  return (
    <div className="h-full bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Chat Interface</h2>
        <p className="text-muted-foreground">
          {isNewChat ? 'New Chat Mode' : `Thread ID: ${threadId}`}
        </p>
      </div>
    </div>
  )
}

export default ChatInterface
