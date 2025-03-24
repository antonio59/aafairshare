import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  // Create supabase client - make sure to await the createClient function
  const supabase = await createClient();

  // Check if user is already authenticated
  const { data: { session } } = await supabase.auth.getSession()

  // If already signed in, redirect to dashboard, otherwise to sign-in page
  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/signin')
  }
}