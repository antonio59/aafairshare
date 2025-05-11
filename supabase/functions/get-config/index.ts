
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for allowing cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check for API key in the request headers
  const apiKey = req.headers.get('apikey');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing authorization header' }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }

  try {
    // Use environment variables set in Supabase dashboard
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required environment variables');
    }

    console.log('Returning config values');
    
    // Return the configuration
    return new Response(
      JSON.stringify({
        supabaseUrl,
        supabaseAnonKey,
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error in get-config function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
