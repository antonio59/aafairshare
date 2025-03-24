'use client'

import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useState } from 'react'

import type { Database } from '@/types/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  
  const { toast } = useToast()
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        throw error
      }

      setIsEmailSent(true)
      toast({
        title: 'Reset email sent',
        description: 'Check your email for the password reset link',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
          <p>Password reset email sent!</p>
          <p className="text-sm mt-2">Please check your email for further instructions.</p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/signin">Back to Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            required
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? 'Sending reset link...' : 'Send reset link'}
        </Button>
      </form>
      
      <div className="text-center">
        <Link 
          href="/signin" 
          className="text-sm text-muted-foreground hover:text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
