
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
  const { keyId, secretKey } = getRazorpayKeys();
  const razorpayOrderUrl = "https://api.razorpay.com/v1/orders";
  
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
    throw new Error(`Razorpay order creation failed: ${errorData.error?.description || "Unknown error"}`);
  }
  
  return await orderResponse.json();
}

// Helper function to verify a Razorpay payment
export async function verifyRazorpayPayment(orderId: string) {
  const { keyId, secretKey } = getRazorpayKeys();
  const verifyUrl = `https://api.razorpay.com/v1/orders/${orderId}/payments`;
  
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
  
  return { paymentStatus, paymentDetails };
}

// Helper function to process PLYN coins payment
export async function processPLYNCoinsPayment(
  supabaseClient: any, 
  userId: string, 
  amount: number
) {
  // Check user's coin balance
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("coins")
    .eq("id", userId)
    .single();
  
  if (profileError) {
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
    throw new Error("Failed to update coin balance");
  }
  
  return {
    status: "completed",
    coinsUsed: coinsRequired,
    paymentId: `coins_${Date.now()}`
  };
}
