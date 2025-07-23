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
import echowriteLogo from '@/assets/echowrite-logo.png'

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
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
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
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="text-center mb-6">
            {/* Logo with Message Icon */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src={echowriteLogo}
                alt="Echowrite Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Set Your Writing Tone
            </h1>
            <p className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed px-2">
              Help EchoWrite understand your unique voice and writing style for personalized content
              generation.
            </p>
          </div>

          {/* Tone Setup Card */}
          <Card className="echowrite-login-card shadow-2xl backdrop-blur-sm border-0">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-lg sm:text-xl font-bold text-white text-center">
                Describe Your Writing Style
              </CardTitle>
              <CardDescription className="text-gray-400 text-center text-sm px-2">
                Share examples of your preferred tone, style, and voice. This helps our AI match
                your unique writing personality.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Word Count Indicator */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
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
                  className="echowrite-input min-h-[120px] sm:min-h-[150px] max-h-[200px] text-gray-100 placeholder-gray-500 resize-none transition-all duration-200 focus:ring-0 focus:border-gray-600 overflow-y-auto text-sm sm:text-base"
                  disabled={saveLoading}
                />
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                onClick={saveToneText}
                disabled={!isButtonEnabled}
                className="w-full h-10 sm:h-11 text-white font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0 text-sm sm:text-base"
                style={{
                  background: isButtonEnabled
                    ? 'rgba(180, 64, 10, 0.12)'
                    : 'rgba(180, 64, 10, 0.06)',
                }}
              >
                {saveLoading ? (
                  <>
                    <Spinner className="mr-2 dark:text-white text-white" />
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
            <p className="text-xs sm:text-sm text-gray-400 px-4">
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
