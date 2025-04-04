
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
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

    // Mock face analysis response
    // In a real implementation, this would call a service like AWS Rekognition or Google Vision
    const mockAnalysisResult = {
      faceShape: "oval",
      skinTone: "medium",
      hairType: "wavy",
      recommendedHairstyles: [
        {
          name: "Layered Bob",
          description: "A versatile cut that works well with oval faces and wavy hair.",
          confidence: 0.92
        },
        {
          name: "Side-swept Bangs",
          description: "Soft side-swept bangs to complement your face shape.",
          confidence: 0.87
        },
        {
          name: "Shoulder-Length Layers",
          description: "Medium length cut with layers to enhance your natural waves.",
          confidence: 0.85
        }
      ],
      recommendedColors: [
        {
          name: "Caramel Highlights",
          description: "Warm caramel tones to complement your skin tone.",
          confidence: 0.88
        },
        {
          name: "Chestnut Brown",
          description: "Rich brown with subtle warm undertones.",
          confidence: 0.84
        }
      ]
    };
    
    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: mockAnalysisResult
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Face analysis error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Face analysis failed" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
