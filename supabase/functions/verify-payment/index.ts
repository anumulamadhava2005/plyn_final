
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { 
  corsHeaders, 
  handleCors,
  verifyRazorpayPayment
} from "../utils/payment-utils.ts";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log("Payment verification request received");
    
    // Get request body
    const requestBody = await req.json();
    const { paymentId, provider, razorpayPaymentId, razorpaySignature } = requestBody;
    
    console.log(`Verifying payment: ID=${paymentId}, Provider=${provider}`);
    
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
      console.error("Authentication error:", authError);
      throw new Error("Not authenticated");
    }

    console.log(`Authenticated user: ${user.id}`);

    // Check payment status based on provider
    let paymentStatus = "pending";
    let paymentDetails = {};
    
    if (provider === "razorpay" && paymentId) {
      console.log(`Verifying Razorpay payment: ${paymentId}`);
      
      // Verify Razorpay payment
      const verification = await verifyRazorpayPayment(
        paymentId, 
        razorpayPaymentId, 
        razorpaySignature
      );
      
      paymentStatus = verification.paymentStatus;
      paymentDetails = verification.paymentDetails;
      
      console.log(`Razorpay payment status: ${paymentStatus}`);
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
    
    console.log(`Payment status determined as: ${paymentStatus}`);
    
    try {
      // Update payment record in database
      console.log(`Updating payment record: ID=${paymentId}, Status=${paymentStatus}`);
      
      const { error: updateError } = await supabaseClient
        .from("payments")
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("transaction_id", paymentId);
      
      if (updateError) {
        console.error("Error updating payment record:", updateError);
        throw new Error(`Failed to update payment record: ${updateError.message}`);
      }
      
      // Get the payment record for the response
      const { data: payment, error: paymentError } = await supabaseClient
        .from("payments")
        .select("*")
        .eq("transaction_id", paymentId)
        .maybeSingle();
      
      if (paymentError) {
        console.error("Error retrieving payment record:", paymentError);
        throw new Error(`Failed to retrieve payment record: ${paymentError.message}`);
      }
      
      if (!payment) {
        throw new Error(`Payment record not found for transaction ID: ${paymentId}`);
      }
      
      // If payment is completed and there's a booking ID, update the booking status
      if (paymentStatus === "completed" && payment.booking_id) {
        console.log(`Updating booking: ID=${payment.booking_id}`);
        
        const { error: bookingError } = await supabaseClient
          .from("bookings")
          .update({
            payment_id: payment.id,  // Use the payment record's UUID
            status: "confirmed"
          })
          .eq("id", payment.booking_id);
          
        if (bookingError) {
          console.error("Error updating booking:", bookingError);
          // Don't throw error here, just log it - payment was still successful
        } else {
          console.log(`Booking ${payment.booking_id} updated successfully`);
        }
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
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
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
