
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Stripe } from "https://esm.sh/stripe@13.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { paymentMethod, amount, currency = "usd", booking = {} } = await req.json();
    
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
    
    if (paymentMethod === "credit_card") {
      // Initialize Stripe for credit card payments
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2023-10-16",
      });
      
      // Create Stripe payment session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{
          price_data: {
            currency,
            product_data: {
              name: "Salon Booking",
              description: booking.salonName ? `Booking at ${booking.salonName}` : "Salon Services",
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        }],
        success_url: `${req.headers.get("origin")}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id || ""}`,
        cancel_url: `${req.headers.get("origin")}/payment?canceled=true`,
      });
      
      paymentResponse = { 
        paymentId: session.id,
        url: session.url,
        provider: "stripe",
        status: "pending"
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
        coins_used: paymentResponse.coinsUsed || 0
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
