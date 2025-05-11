
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
  console.log("Settlement email function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Supabase URL or service key is not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get SMTP configuration from environment variables
    const smtpFrom = Deno.env.get('SMTP_FROM');
    if (!smtpFrom) {
      console.error("SMTP_FROM variable not set");
      throw new Error("SMTP_FROM environment variable is not set");
    }

    // Initialize email sender with API key from environment
    const resendApiKey = Deno.env.get('SMTP_PASS');
    if (!resendApiKey) {
      console.error("SMTP_PASS (Resend API key) not set");
      throw new Error("SMTP_PASS (Resend API key) is not set");
    }
    
    console.log("Initializing Resend with API key");
    const resend = new Resend(resendApiKey);

    // Get form data
    console.log("Parsing form data from request");
    const formData = await req.formData();
    
    const year = formData.get('year');
    const month = formData.get('month');
    const user1Id = formData.get('user1');
    const user2Id = formData.get('user2');
    const settlementAmount = formData.get('settlementAmount');
    const settlementDirection = formData.get('settlementDirection');
    const pdfAttachment = formData.get('reportPdf');
    const csvAttachment = formData.get('reportCsv');

    // Log received data for debugging
    console.log("Form data received:", {
      year,
      month,
      user1Id,
      user2Id,
      settlementAmount,
      settlementDirection,
      pdfAttachment: pdfAttachment ? "Present" : "Missing",
      csvAttachment: csvAttachment ? "Present" : "Missing",
    });

    // Validate inputs
    if (!year || !month || !user1Id || !user2Id || !settlementAmount || !settlementDirection) {
      console.error("Missing required fields:", {
        year: !year,
        month: !month,
        user1Id: !user1Id,
        user2Id: !user2Id,
        settlementAmount: !settlementAmount,
        settlementDirection: !settlementDirection,
      });
      throw new Error("Missing required fields for settlement email");
    }

    // Get user emails from Supabase
    console.log("Fetching user data from Supabase");
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .in('id', [user1Id, user2Id]);

    if (userError) {
      console.error("Error fetching user data:", userError);
      throw new Error(`Error fetching user data: ${userError.message}`);
    }
    
    if (!users || users.length < 2) {
      console.error("Users not found in database:", { users });
      throw new Error(`Error fetching user data: ${users ? 'Not enough users found' : 'Users not found'}`);
    }

    // Get user info
    const user1 = users.find(u => u.id === user1Id);
    const user2 = users.find(u => u.id === user2Id);
    
    if (!user1 || !user2) {
      console.error("Unable to find both users", { user1, user2 });
      throw new Error("Could not find both users");
    }
    
    if (!user1.email || !user2.email) {
      console.error("Missing email addresses", { user1Email: user1.email, user2Email: user2.email });
      throw new Error("Could not find valid email addresses for both users");
    }

    console.log("User data found:", { user1: user1.name, user2: user2.name });

    // Format month name
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long' });
    
    // Convert PDF to base64 for attachment
    let pdfBase64 = '';
    if (pdfAttachment instanceof File) {
      console.log("Processing PDF attachment");
      const pdfArrayBuffer = await pdfAttachment.arrayBuffer();
      pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));
    } else {
      console.warn("PDF attachment not provided or not a File");
    }
    
    // Convert CSV to base64 for attachment
    let csvBase64 = '';
    if (csvAttachment instanceof File) {
      console.log("Processing CSV attachment");
      const csvArrayBuffer = await csvAttachment.arrayBuffer();
      csvBase64 = btoa(String.fromCharCode(...new Uint8Array(csvArrayBuffer)));
    } else {
      console.warn("CSV attachment not provided or not a File");
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
      console.log("Adding PDF attachment to email");
      attachments.push({
        filename: `settlement_report_${year}_${month}.pdf`,
        content: pdfBase64
      });
    }
    
    // Add CSV attachment if available
    if (csvBase64) {
      console.log("Adding CSV attachment to email");
      attachments.push({
        filename: `expenses_${year}_${month}.csv`,
        content: csvBase64
      });
    }

    // Log important information for debugging
    console.log("Sending email with Resend");
    console.log(`From: ${smtpFrom}`);
    console.log(`To: ${user1.email}, ${user2.email}`);
    console.log(`Attachments count: ${attachments.length}`);

    // Send the email with Resend
    const emailResponse = await resend.emails.send({
      from: smtpFrom,
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
