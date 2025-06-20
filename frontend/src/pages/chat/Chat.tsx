import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useUser, useUserName, useUserEmail, useUserTone } from '@/store'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Settings } from 'lucide-react'

const ChatComponent: React.FC = () => {
  const navigate = useNavigate()
  const user = useUser()
  const userName = useUserName()
  const userEmail = useUserEmail()
  const userTone = useUserTone()

  const { logout } = useAuth()

  const handleProfileSettings = () => {
    navigate('/profile')
  }

  const handleLogout = () => {
    logout()
  }

  // Show loading while user data is being fetched
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Spinner className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with user info and logout */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">EchoWrite Chat</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted/50">
                  <User className="h-4 w-4" />
                  <div className="text-sm">
                    <div className="font-medium">{userName || 'User'}</div>
                    <div className="text-muted-foreground text-xs">{userEmail}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleProfileSettings}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Chat History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your previous conversations will appear here.
                  </p>
                  {/* Chat history items would go here */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">New Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages area */}
                <div className="flex-1 border rounded-md p-4 mb-4 bg-muted/20">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Welcome to EchoWrite!</h3>
                      <p className="text-muted-foreground">
                        Start a conversation to begin writing with AI assistance.
                      </p>
                      {userTone && (
                        <p className="text-sm text-blue-600 mt-2">
                          <strong>Your tone:</strong> {userTone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message here..."
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button>Send</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChatComponent
