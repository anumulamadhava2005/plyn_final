import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Add Razorpay test credentials
const RAZORPAY_KEY_ID = "rzp_test_CABuOHaSHHGey2";
const RAZORPAY_SECRET_KEY = "ikGeYHuQG5Qxkpjo1wNKc5Wx";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { paymentId, provider, sessionId, orderId, razorpayPaymentId, razorpaySignature } = await req.json();
    
    // Create Supabase client
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
      throw new Error("Not authenticated");
    }

    // Check payment status based on provider
    let paymentStatus = "pending";
    let paymentDetails = {};
    
    if (provider === "razorpay" && (orderId || paymentId)) {
      // Verify Razorpay payment
      const razorpayKeyId = RAZORPAY_KEY_ID;
      const razorpaySecretKey = RAZORPAY_SECRET_KEY;
      
      // Check the payment status
      const orderIdToCheck = orderId || paymentId;
      const verifyUrl = `https://api.razorpay.com/v1/orders/${orderIdToCheck}/payments`;
      
      const response = await fetch(verifyUrl, {
        headers: {
          "Authorization": `Basic ${btoa(`${razorpayKeyId}:${razorpaySecretKey}`)}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to verify Razorpay payment");
      }
      
      const data = await response.json();
      
      // Check payment status
      if (data.items && data.items.length > 0) {
        const payment = data.items[0];
        
        if (payment.status === "authorized" || payment.status === "captured") {
          paymentStatus = "completed";
        } else if (payment.status === "created" || payment.status === "attempted") {
          paymentStatus = "pending";
        } else {
          paymentStatus = "failed";
        }
        
        paymentDetails = {
          razorpayPaymentId: payment.id,
          amountPaid: payment.amount / 100, // Convert from paise to INR
          currency: payment.currency,
          method: payment.method
        };
      }
    } 
    else if (["phonepe", "paytm", "netbanking", "upi", "qr_code"].includes(provider)) {
      // For demo purposes, we'll simulate payment verification
      // In production, you would verify with the actual payment gateway API
      
      // Simulate successful payment (would be actual verification in production)
      paymentStatus = "completed";
      paymentDetails = {
        transactionId: `sim_tr_${Date.now()}`,
        verificationTime: new Date().toISOString()
      };
    } 
    else if (provider === "plyn_coins") {
      // PLYN Coins transactions are completed immediately
      paymentStatus = "completed";
    }
    
    // Update payment record in database
    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        payment_status: paymentStatus,
        payment_details: paymentDetails,
        updated_at: new Date().toISOString()
      })
      .eq("payment_id", paymentId);
    
    if (updateError) {
      throw new Error("Failed to update payment record");
    }
    
    // Get the payment record for the response
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("payment_id", paymentId)
      .single();
    
    if (paymentError) {
      throw new Error("Failed to retrieve payment record");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        verified: paymentStatus === "completed",
        payment: payment
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        verified: false,
        error: error.message || "Payment verification failed" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
