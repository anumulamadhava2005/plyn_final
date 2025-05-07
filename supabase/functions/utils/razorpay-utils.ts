/* eslint-disable @typescript-eslint/no-explicit-any */
// Razorpay test credentials
export const RAZORPAY_TEST_KEY_ID = "rzp_test_CABuOHaSHHGey2";
export const RAZORPAY_TEST_SECRET_KEY = "ikGeYHuQG5Qxkpjo1wNKc5Wx";

// Razorpay live credentials
export const RAZORPAY_LIVE_KEY_ID = "rzp_live_FhaqhzP8Ha1YZT";
export const RAZORPAY_LIVE_SECRET_KEY = "OOOvOkHSC1tl4KNi0NuKvu5A";
export const RAZORPAY_ADMIN_ACCOUNT_ID = "acc_QFnsEHaBxbj58g";

// Environment-aware key fetcher
export const getRazorpayKeys = (isProduction = true) => {
  return {
    keyId: isProduction ? RAZORPAY_LIVE_KEY_ID : RAZORPAY_TEST_KEY_ID,
    secretKey: isProduction ? RAZORPAY_LIVE_SECRET_KEY : RAZORPAY_TEST_SECRET_KEY
  };
};

// Reliable btoa fallback for Deno Edge Functions
function safeBase64Encode(str: string): string {
  if (typeof btoa !== "undefined") {
    return btoa(str);
  }
  return Buffer.from(str).toString("base64");
}

export async function createRazorpayLinkedAccount(details: any) {
  const { keyId, secretKey } = getRazorpayKeys(true); // Set to false for testing

  const payload = {
    email: details.business_email,
    phone: details.business_phone,
    type: "route", // Mandatory for linked account creation
    reference_id: details.reference_id || `ref_${Date.now()}`, // Optional but good practice
    legal_business_name: details.business_name,
    business_type: "partnership",
    contact_name: details.contact_name || details.business_name,
    profile: {
      category: "healthcare",
      subcategory: "clinic",
      addresses: {
        registered: {
          street1: "507, Koramangala 1st block",
          street2: "MG Road",
          city: "Bengaluru",
          state: "KARNATAKA",
          postal_code: "560034",
          country: "IN"
        }
      }
    },
    legal_info: {
      pan: details.pan || "AAACL1234C",
      gst: details.gst || "18AABCU9603R1ZM"
    }
  };

  const url = "https://api.razorpay.com/v2/accounts";
  console.log("📦 Creating Razorpay linked account with payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${safeBase64Encode(`${keyId}:${secretKey}`)}`
    },
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();
  if (!response.ok) {
    console.error("❌ Razorpay API error:", response.status, responseText);
    throw new Error(`Failed to create Razorpay linked account: ${responseText}`);
  }

  console.log("✅ Razorpay linked account created:", responseText);
  return JSON.parse(responseText);
}
