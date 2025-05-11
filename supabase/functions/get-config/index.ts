
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

  // Check for API key in either the apikey header or Authorization header
  const apiKey = req.headers.get('apikey') || req.headers.get('Authorization')?.split(' ')[1];
  console.log("Request received, API key present:", !!apiKey);
  
  if (!apiKey) {
    console.error("Missing API key in request");
    return new Response(
      JSON.stringify({ success: false, error: 'Missing API key in request headers' }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }

  // Validate the API key format (basic check)
  if (!apiKey.startsWith('eyJ')) {
    console.error("Invalid API key format");
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid API key format' }),
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

    // Debug output
    console.log("Environment check:", {
      urlPresent: !!supabaseUrl,
      keyPresent: !!supabaseAnonKey
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing environment variables");
      throw new Error('Missing required environment variables. Please check that SUPABASE_URL and SUPABASE_ANON_KEY are set in the Supabase dashboard.');
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
        error: error.message,
        details: "There was an error retrieving the configuration. Please ensure all required environment variables are properly set."
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
