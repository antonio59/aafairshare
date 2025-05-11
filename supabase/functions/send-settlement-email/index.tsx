
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

// CORS headers for allowing cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Resend with API key
    const resend = new Resend(Deno.env.get('SMTP_PASS'));

    // Get form data
    const formData = await req.formData();
    
    const year = formData.get('year');
    const month = formData.get('month');
    const user1Id = formData.get('user1');
    const user2Id = formData.get('user2');
    const settlementAmount = formData.get('settlementAmount');
    const settlementDirection = formData.get('settlementDirection');
    const pdfAttachment = formData.get('reportPdf');
    const csvAttachment = formData.get('reportCsv');

    // Validate inputs
    if (!year || !month || !user1Id || !user2Id || !settlementAmount || !settlementDirection) {
      throw new Error("Missing required fields for settlement email");
    }

    // Get user emails from Supabase
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .in('id', [user1Id, user2Id]);

    if (userError || !users || users.length < 2) {
      throw new Error(`Error fetching user data: ${userError?.message || 'Users not found'}`);
    }

    // Get user info
    const user1 = users.find(u => u.id === user1Id);
    const user2 = users.find(u => u.id === user2Id);
    
    if (!user1 || !user2 || !user1.email || !user2.email) {
      throw new Error("Could not find valid email addresses for both users");
    }

    // Format month name
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long' });
    
    // Convert PDF to base64 for attachment
    let pdfBase64 = '';
    if (pdfAttachment instanceof File) {
      const pdfArrayBuffer = await pdfAttachment.arrayBuffer();
      pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));
    }
    
    // Convert CSV to base64 for attachment
    let csvBase64 = '';
    if (csvAttachment instanceof File) {
      const csvArrayBuffer = await csvAttachment.arrayBuffer();
      csvBase64 = btoa(String.fromCharCode(...new Uint8Array(csvArrayBuffer)));
    }

    // Direction message
    let settlementMessage = `No settlement needed for ${monthName} ${year}.`;
    if (settlementDirection === 'owes') {
      settlementMessage = `${user1.name} paid ${user2.name} £${settlementAmount} for ${monthName} ${year}.`;
    } else if (settlementDirection === 'owed') {
      settlementMessage = `${user2.name} paid ${user1.name} £${settlementAmount} for ${monthName} ${year}.`;
    }

    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h1 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">AAFairShare: Settlement Complete</h1>
        
        <p>Hi ${user1.name} and ${user2.name},</p>
        
        <p>A settlement has been marked as complete in your shared expense tracking:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-weight: bold; font-size: 18px;">${settlementMessage}</p>
          <p>Period: ${monthName} ${year}</p>
        </div>
        
        <p>The settlement report and expense details are attached to this email for your records:</p>
        <ul>
          <li>PDF Report - Visual representation of the settlement summary</li>
          <li>CSV Export - Detailed expense data for the period</li>
        </ul>
        
        <p>You can log in to the application to view more details and your expense history.</p>
        
        <p>Best regards,<br>The AAFairShare Team</p>
      </div>
    `;

    // Prepare attachments array
    const attachments = [];
    
    // Add PDF attachment if available
    if (pdfBase64) {
      attachments.push({
        filename: `settlement_report_${year}_${month}.pdf`,
        content: pdfBase64
      });
    }
    
    // Add CSV attachment if available
    if (csvBase64) {
      attachments.push({
        filename: `expenses_${year}_${month}.csv`,
        content: csvBase64
      });
    }

    // Send the email with Resend
    const emailResponse = await resend.emails.send({
      from: Deno.env.get('SMTP_FROM') || 'AAFairShare <no-reply@aafairshare.com>',
      to: [user1.email, user2.email],
      subject: `AAFairShare: Settlement Complete for ${monthName} ${year}`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    console.log("Email sent successfully:", emailResponse);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Settlement email sent successfully" 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error("Error in send-settlement-email function:", error);
    
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
