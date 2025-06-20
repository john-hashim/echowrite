import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useUser,
  useUserName,
  useUserEmail,
  useUserTone,
  useIsEmailVerified,
  useUserActions,
  useUserLoading,
} from '@/store'
import { Spinner } from '@/components/ui/spinner'

const UserProfile: React.FC = () => {
  const user = useUser()
  const userName = useUserName()
  const userEmail = useUserEmail()
  const userTone = useUserTone()
  const isEmailVerified = useIsEmailVerified()
  const { fetchUser } = useUserActions()
  const isLoading = useUserLoading()

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No user data available</p>
        </CardContent>
      </Card>
    )
  }

  const handleRefresh = async () => {
    try {
      await fetchUser()
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <Spinner className="h-4 w-4" /> : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-sm">{userName || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="flex items-center gap-2">
              <p className="text-sm">{userEmail}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isEmailVerified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                }`}
              >
                {isEmailVerified ? '✅ Verified' : '❌ Unverified'}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Provider</label>
            <p className="text-sm">{user.provider || 'Email'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Member Since</label>
            <p className="text-sm">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        {userTone && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Writing Tone</label>
            <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{userTone}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UserProfile
