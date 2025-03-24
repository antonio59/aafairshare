import { redirect } from 'next/navigation';

import { TopNavbar } from '@/components/layout/TopNavbar';
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth status server-side - make sure to await the createClient function
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // If user is not authenticated, redirect to sign-in
  if (!session) {
    redirect('/signin');
  }

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <TopNavbar />
      <main id="main-content" className="main-content">
        {children}
      </main>
    </div>
  );
}