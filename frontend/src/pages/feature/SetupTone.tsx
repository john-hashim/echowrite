import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authService, UserResponse } from '@/api/services/auth'
import { useApi } from '@/hooks/useApi'
import { Textarea } from '@/components/ui/textarea'
import { featureService } from '@/api/services/feature'
import { useAppStore } from '@/store/appStore'

const SetupTone: React.FC = () => {
  const [toneText, setToneText] = useState('')

  const { logout } = useAuth()
  const navigate = useNavigate()
  const { logout: zustandLogout } = useAppStore()

  const { setUser } = useAppStore()

  const { execute: executeLogout } = useApi<{ success: boolean }, []>(authService.logout)
  const { execute: executeSetTone } = useApi<{ message: string; user: UserResponse }, [string]>(
    featureService.setupTone
  )

  // Calculate word count
  const wordCount = toneText.trim() === '' ? 0 : toneText.trim().split(/\s+/).length
  const minWords = 50
  const isButtonEnabled = wordCount >= minWords

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
    <>
      <div className="flex justify-center p-20">
        <div className="w-1/2 mb-2">
          <div className="mb-2 text-sm text-gray-600">
            Word count: {wordCount}/{minWords}{' '}
            {wordCount < minWords && `(${minWords - wordCount} more words needed)`}
          </div>
          <Textarea
            className="mb-2"
            onChange={e => setToneText(e.target.value)}
            placeholder="Enter your tone preferences here (minimum 50 words required)..."
          />
          <div className="flex justify-end">
            <Button disabled={!isButtonEnabled} onClick={saveToneText}>
              Save Tone Text
            </Button>
          </div>
        </div>
      </div>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  )
}

export default SetupTone
