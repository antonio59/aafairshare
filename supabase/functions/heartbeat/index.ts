
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  // Simple heartbeat function to test connectivity
  return new Response(
    JSON.stringify('pong'),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
