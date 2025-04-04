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
    const { paymentMethod, amount, currency = "INR", booking = {} } = await req.json();
    
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

    // Handle different payment methods
    let paymentResponse;
    
    if (paymentMethod === "credit_card" || paymentMethod === "razorpay") {
      // Initialize Razorpay for credit card payments
      const razorpayKeyId = RAZORPAY_KEY_ID;
      
      // Generate a random receipt ID
      const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create order in Razorpay
      const razorpayOrderUrl = "https://api.razorpay.com/v1/orders";
      const razorpaySecretKey = RAZORPAY_SECRET_KEY;
      
      const orderResponse = await fetch(razorpayOrderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa(`${razorpayKeyId}:${razorpaySecretKey}`)}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Razorpay uses paise (100 paise = 1 INR)
          currency: currency,
          receipt: receiptId,
          notes: {
            booking_id: booking.id || "",
            user_id: user.id,
            salon_name: booking.salonName || "Salon Booking"
          }
        }),
      });
      
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(`Razorpay order creation failed: ${errorData.error.description || "Unknown error"}`);
      }
      
      const orderData = await orderResponse.json();
      
      // Set up checkout parameters
      const checkoutParams = new URLSearchParams({
        key: razorpayKeyId,
        order_id: orderData.id,
        amount: String(Math.round(amount * 100)),
        currency: currency,
        name: booking.salonName || "Salon Booking",
        description: "Payment for salon services",
        customer_id: user.id,
        prefill_email: booking.email || user.email || "",
        prefill_contact: booking.phone || "",
        callback_url: `${req.headers.get("origin")}/booking-confirmation?order_id=${orderData.id}&booking_id=${booking.id || ""}`,
        cancel_url: `${req.headers.get("origin")}/payment?canceled=true`
      });
      
      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.html?${checkoutParams.toString()}`;
      
      paymentResponse = { 
        paymentId: orderData.id,
        url: checkoutUrl,
        provider: "razorpay",
        status: "pending",
        orderId: orderData.id
      };
    } 
    else if (["phonepe", "paytm", "netbanking", "upi", "qr_code"].includes(paymentMethod)) {
      // For demo purposes, we'll simulate payments for these methods
      // In production, you would integrate with actual payment gateways
      
      // Simulate payment processing
      paymentResponse = {
        paymentId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        url: `${req.headers.get("origin")}/payment/simulator?method=${paymentMethod}&amount=${amount}`,
        provider: paymentMethod,
        status: "pending"
      };
    } 
    else if (paymentMethod === "plyn_coins") {
      // Process PLYN Coins payment
      const coinsRequired = amount * 2; // 2 coins per dollar
      
      // Check user's coin balance
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();
      
      if (profileError) {
        throw new Error("Could not retrieve user profile");
      }
      
      if (!profile || profile.coins < coinsRequired) {
        throw new Error("Insufficient PLYN coins");
      }
      
      // Deduct coins from user's balance
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ coins: profile.coins - coinsRequired })
        .eq("id", user.id);
      
      if (updateError) {
        throw new Error("Failed to update coin balance");
      }
      
      // Create payment record
      paymentResponse = {
        paymentId: `coins_${Date.now()}`,
        status: "completed",
        provider: "plyn_coins",
        amount: amount,
        coinsUsed: coinsRequired
      };
    } 
    else {
      throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
    
    // Record payment in database
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        payment_method: paymentMethod,
        amount: amount,
        payment_status: paymentResponse.status,
        provider: paymentResponse.provider,
        payment_id: paymentResponse.paymentId,
        coins_used: paymentResponse.coinsUsed || 0,
        order_id: paymentResponse.orderId || null
      })
      .select("id")
      .single();
    
    if (paymentError) {
      throw new Error("Failed to record payment");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        payment: {
          ...paymentResponse,
          dbId: paymentRecord.id
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Payment processing failed" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
