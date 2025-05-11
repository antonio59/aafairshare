
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
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  console.log("Request received for configuration");
  
  try {
    // Use environment variables set in Supabase dashboard
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Debug output (be careful not to log the actual keys)
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
