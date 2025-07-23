import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/api/services/auth'
import { UserResponse } from '@/types/auth'
import { useApi } from '@/hooks/useApi'
import { Textarea } from '@/components/ui/textarea'
import { featureService } from '@/api/services/feature'
import { useAppStore } from '@/store/appStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MessageCircle, LogOut, ArrowRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

const SetupTone: React.FC = () => {
  const [toneText, setToneText] = useState('')

  const { logout } = useAuth()
  const navigate = useNavigate()
  const { logout: zustandLogout } = useAppStore()

  const { setUser } = useAppStore()

  const { execute: executeLogout, loading: logoutLoading } = useApi<{ success: boolean }, []>(
    authService.logout
  )
  const { execute: executeSetTone, loading: saveLoading } = useApi<
    { message: string; user: UserResponse },
    [string]
  >(featureService.setupTone)

  // Calculate word count
  const wordCount = toneText.trim() === '' ? 0 : toneText.trim().split(/\s+/).length
  const minWords = 50
  const isButtonEnabled = wordCount >= minWords && !saveLoading

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

  const saveToneText = async () => {
    if (!toneText || wordCount < minWords) {
      return
    }
    try {
      const res = await executeSetTone(toneText)
      setUser(res.user)
      navigate('/chat')
    } catch (e) {}
  }

  return (
    <div className="echowrite-login-page h-screen flex overflow-hidden relative">
      {/* Header with Logout - Absolute positioned */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          onClick={handleLogout}
          disabled={logoutLoading}
          variant="outline"
          size="sm"
          className="border-gray-700 bg-black/50 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
        >
          {logoutLoading ? (
            <Spinner className="mr-2 w-4 h-4" />
          ) : (
            <LogOut className="mr-2 w-4 h-4" />
          )}
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="text-center mb-6">
            {/* Logo with Message Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#B4400A] via-[#C66A00] to-[#C69000] rounded-2xl flex items-center justify-center shadow-2xl">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">Set Your Writing Tone</h1>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              Help EchoWrite understand your unique voice and writing style for personalized content
              generation.
            </p>
          </div>

          {/* Tone Setup Card */}
          <Card className="echowrite-login-card shadow-2xl backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-xl font-bold text-white text-center">
                Describe Your Writing Style
              </CardTitle>
              <CardDescription className="text-gray-400 text-center text-sm">
                Share examples of your preferred tone, style, and voice. This helps our AI match
                your unique writing personality.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Word Count Indicator */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  Word count: <span className="text-white font-medium">{wordCount}</span>
                </span>
                <span
                  className={`text-sm ${wordCount >= minWords ? 'text-green-400' : 'text-orange-400'}`}
                >
                  {wordCount >= minWords
                    ? '✓ Ready to save'
                    : `${minWords - wordCount} more words needed`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-[#B4400A] via-[#C66A00] to-[#C69000] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((wordCount / minWords) * 100, 100)}%` }}
                ></div>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <Textarea
                  value={toneText}
                  onChange={e => setToneText(e.target.value)}
                  placeholder="Describe your writing style here... For example: 'I prefer a conversational and friendly tone with a touch of humor. I like to use simple language that's easy to understand, and I often include personal anecdotes. My writing tends to be encouraging and optimistic, and I enjoy using metaphors to explain complex ideas. I write like I'm talking to a close friend - warm, genuine, and authentic.'"
                  className="echowrite-input min-h-[150px] max-h-[150px] text-gray-100 placeholder-gray-500 resize-none transition-all duration-200 overflow-y-auto"
                  disabled={saveLoading}
                />
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                onClick={saveToneText}
                disabled={!isButtonEnabled}
                className="w-full h-11 bg-gradient-to-r from-[#A43A09] via-[#B65A00] to-[#B68000] hover:from-[#943309] hover:via-[#A55000] hover:to-[#A57000] text-white font-medium shadow-lg shadow-orange-900/25 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saveLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Setting up your tone...
                  </>
                ) : (
                  <>
                    Continue to EchoWrite
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Footer Note */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Don't worry, you can always update your tone preferences later in settings.
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full blur-lg animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-40 right-10 w-28 h-28 bg-white rounded-full blur-lg animate-pulse"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>
    </div>
  )
}

export default SetupTone
