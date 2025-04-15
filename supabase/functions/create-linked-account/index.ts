// supabase/functions/create-linked-account/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, handleCors } from "../utils/payment-utils.ts"; // Reuse your existing utils
import { createRazorpayLinkedAccount } from "../utils/razorpay-utils.ts"; // We'll define this
serve(async (req)=>{
      // Handle CORS preflight
      const corsResponse = handleCors(req);
      if (corsResponse) return corsResponse;

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const body = await req.json();
    console.log("Received request body:", body);
    const { business_name, business_email, business_phone, business_address } = body;
    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      // Verify user authentication
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("No authorization header provided");
      }
      
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        throw new Error("Not authenticated");
      }
  
      console.log(`Authenticated user: ${user.id}`);
  
    const response = await createRazorpayLinkedAccount({
      business_name,
      business_email,
      business_phone,
      business_address
    });
    console.log("Razorpay created account:", response);
    return new Response(JSON.stringify({
      success: true,
      account_id: response.id
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Failed to create Razorpay linked account:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
