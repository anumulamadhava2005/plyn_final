export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const handleCors = (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }
  
  return null;
};

// Razorpay test credentials
export const RAZORPAY_TEST_KEY_ID = "rzp_test_CABuOHaSHHGey2";
export const RAZORPAY_TEST_SECRET_KEY = "ikGeYHuQG5Qxkpjo1wNKc5Wx";

// Razorpay live credentials
export const RAZORPAY_LIVE_KEY_ID = "rzp_live_pcOKGFEhj2J7EA";
export const RAZORPAY_LIVE_SECRET_KEY = "o1K4gTXbhjXKndBAGaROkKzm";

// Function to get the appropriate Razorpay keys based on environment
export const getRazorpayKeys = (isProduction = false) => {
  return {
    keyId: isProduction ? RAZORPAY_LIVE_KEY_ID : RAZORPAY_TEST_KEY_ID,
    secretKey: isProduction ? RAZORPAY_LIVE_SECRET_KEY : RAZORPAY_TEST_SECRET_KEY
  };
};

// Helper function to create a Razorpay order
export async function createRazorpayOrder(amount: number, currency: string, receipt: string, notes: Record<string, string>) {
  const { keyId, secretKey } = getRazorpayKeys(false); // Use test credentials for now
  const razorpayOrderUrl = "https://api.razorpay.com/v1/orders";
  
  console.log(`Creating Razorpay order for amount: ${amount} ${currency}`);
  
  try {
    const orderResponse = await fetch(razorpayOrderUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${keyId}:${secretKey}`)}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay uses paise (100 paise = 1 INR)
        currency: currency,
        receipt: receipt,
        notes: notes
      }),
    });
    
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("Razorpay order creation failed:", errorData);
      throw new Error(`Razorpay order creation failed: ${errorData.error?.description || "Unknown error"}`);
    }
    
    const orderData = await orderResponse.json();
    console.log("Razorpay order created successfully:", orderData.id);
    
    // Add key_id to the response for frontend use
    orderData.key_id = keyId;
    
    return orderData;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
}

// Helper function to verify a Razorpay payment
export async function verifyRazorpayPayment(orderId: string, razorpayPaymentId?: string, razorpaySignature?: string) {
  const { keyId, secretKey } = getRazorpayKeys(false); // Use test credentials for now
  
  try {
    // If we have a payment ID and signature, we can verify directly
    if (razorpayPaymentId && razorpaySignature) {
      // TODO: Implement signature verification if needed
      return { 
        paymentStatus: "completed", 
        paymentDetails: {
          razorpayPaymentId,
          verificationTime: new Date().toISOString()
        } 
      };
    }
    
    // Otherwise, check order status
    const verifyUrl = `https://api.razorpay.com/v1/orders/${orderId}/payments`;
    console.log(`Verifying Razorpay payment for order: ${orderId}`);
    
    const response = await fetch(verifyUrl, {
      headers: {
        "Authorization": `Basic ${btoa(`${keyId}:${secretKey}`)}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to verify Razorpay payment");
    }
    
    const data = await response.json();
    let paymentStatus = "pending";
    let paymentDetails = {};
    
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
    
    console.log(`Payment status for order ${orderId}: ${paymentStatus}`);
    return { paymentStatus, paymentDetails };
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    throw error;
  }
}

// Helper function to process PLYN coins payment
export async function processPLYNCoinsPayment(
  supabaseClient: any, 
  userId: string, 
  amount: number
) {
  console.log(`Processing PLYN coins payment for user: ${userId}, amount: ${amount}`);
  
  try {
    // Check user's coin balance
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();
    
    if (profileError) {
      console.error("Error retrieving user profile:", profileError);
      throw new Error("Could not retrieve user profile");
    }
    
    const coinsRequired = amount * 2; // 2 coins per dollar
    
    if (!profile || profile.coins < coinsRequired) {
      throw new Error(`Insufficient PLYN coins. You need ${coinsRequired} coins, but you have ${profile?.coins || 0}.`);
    }
    
    // Deduct coins from user's balance
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ coins: profile.coins - coinsRequired })
      .eq("id", userId);
    
    if (updateError) {
      console.error("Error updating coin balance:", updateError);
      throw new Error("Failed to update coin balance");
    }
    
    console.log(`Successfully deducted ${coinsRequired} coins from user ${userId}`);
    
    return {
      status: "completed",
      coinsUsed: coinsRequired,
      paymentId: `coins_${Date.now()}`
    };
  } catch (error) {
    console.error("Error processing PLYN coins payment:", error);
    throw error;
  }
}
