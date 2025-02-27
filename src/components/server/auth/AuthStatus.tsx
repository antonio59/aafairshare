import { getServerSession } from '@/lib/supabase-server';

export async function AuthStatus() {
  const session = await getServerSession();
  
  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Server-Side Auth Status</h2>
      <div className="space-y-2">
        <p>
          Session: <span className={session ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {session ? "Active" : "Not active"}
          </span>
        </p>
        
        {session && (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <p className="font-medium">User Email: {session.user.email}</p>
            <p className="text-sm text-gray-500">ID: {session.user.id}</p>
            <p className="text-sm text-gray-500">
              Last Sign In: {new Date(session.user.last_sign_in_at || '').toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
