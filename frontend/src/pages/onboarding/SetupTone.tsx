import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { useApi } from '@/hooks/useApi'
import { authService, UpdateToneResponse, UpdateToneRequest } from '@/api/services/auth'
import { useUserStore } from '@/store'

const SetupTone: React.FC = () => {
  const [toneText, setToneText] = useState('')
  const navigate = useNavigate()

  const {
    execute: executeUpdateTone,
    loading,
    error,
  } = useApi<UpdateToneResponse, [UpdateToneRequest]>(authService.updateTone)

  // Count words in the tone text
  const wordCount = toneText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length
  const isValidWordCount = wordCount >= 50

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidWordCount) return

    try {
      const response = await executeUpdateTone({ tone: toneText.trim() })

      // Update user data in Zustand store with proper type mapping
      useUserStore.getState().setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || null,
        avatar: response.user.avatar || null,
        provider: response.user.provider || null,
        emailVerified: response.user.emailVerified || false,
        toneText: response.user.toneText || null,
        createdAt: response.user.createdAt || '',
        updatedAt: response.user.updatedAt || '',
      })

      // Navigate to chat after successful update
      navigate('/chat')
    } catch (err) {
      console.error('Failed to update tone:', err)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Personalize Your Writing Experience</CardTitle>
          <CardDescription className="text-base">
            Help us understand your writing style so our AI can match your tone and voice
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Why do we need your tone?</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              By understanding your writing tone and style, our AI assistant can provide responses
              that match your voice. Whether you prefer formal, casual, friendly, or professional
              communication, we'll adapt our suggestions to sound authentically like you.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="tone" className="text-base font-medium">
                  Describe your writing tone and style
                </Label>
                <span className={`text-sm ${wordCount >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                  {wordCount}/50 words minimum
                </span>
              </div>
              <Textarea
                id="tone"
                value={toneText}
                onChange={e => setToneText(e.target.value)}
                placeholder="e.g., I prefer a professional yet friendly tone. I like to be clear and concise, but also warm and approachable. I often use conversational language and avoid overly technical jargon..."
                className="min-h-[120px] resize-none"
                rows={6}
                disabled={loading}
              />
              {wordCount < 50 && wordCount > 0 && (
                <p className="text-sm text-orange-600">
                  Please write at least {50 - wordCount} more words to help us understand your style
                  better.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Be as detailed as you like. The more you tell us, the better we can match your
                style.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={!isValidWordCount || loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Saving Your Tone...
                </>
              ) : (
                'Save My Tone'
              )}
            </Button>
          </form>

          {/* Examples */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Need inspiration? Here are some examples:</h4>
            <div className="grid gap-3">
              {[
                'Professional and direct - I prefer clear, business-focused communication with minimal small talk. I value efficiency and precision in my writing, often getting straight to the point without unnecessary embellishments. My sentences tend to be structured and formal, suitable for corporate environments and professional correspondence.',
                "Casual and friendly - I like to write as if I'm talking to a friend, using everyday language and a conversational tone. I enjoy adding personal touches and humor when appropriate, making my writing feel warm and approachable. I prefer simple words over complex ones and like to keep things light and engaging.",
                'Formal and academic - I prefer structured, well-researched content with proper citations and formal language. My writing style follows academic conventions with clear thesis statements, logical arguments, and evidence-based conclusions. I value precision, objectivity, and thorough analysis in all my written communications.',
                "Creative and engaging - I enjoy storytelling and using vivid descriptions to capture attention and paint clear pictures for my readers. I like to incorporate metaphors, analogies, and creative language that makes my writing memorable and impactful. I'm not afraid to take risks with my word choices and sentence structures.",
              ].map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setToneText(example)}
                  className="text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 text-sm transition-colors border"
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SetupTone
