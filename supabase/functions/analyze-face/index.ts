
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { imageBase64, gender } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log(`Analyzing face for ${gender} user...`);
    
    // Prepare the system message for the AI
    const systemMessage = `You are a professional hair stylist with expertise in analyzing face shapes and features. 
    Your job is to examine the provided face image and determine:
    1. The face shape (oval, round, square, heart, etc.)
    2. Key facial features that influence hairstyle choices
    3. The 3 most suitable hairstyles for this person based on their face shape and features
    
    For each recommended hairstyle, provide:
    - Name of the hairstyle
    - Why it would suit this face shape
    - Brief styling tips
    
    Keep your analysis professional and focused on ${gender} hairstyles.`;

    // Call OpenAI API with the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: `Please analyze this face for ${gender} hairstyle recommendations.` },
              { 
                type: 'image_url', 
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    console.log('Analysis complete');
    
    // Extract the analysis
    const analysisText = data.choices[0].message.content;
    
    // Generate image prompts for each recommended style
    const stylePrompts = await generateStyleImagePrompts(analysisText, gender, openAIApiKey);

    return new Response(
      JSON.stringify({ 
        analysis: analysisText,
        stylePrompts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function generateStyleImagePrompts(analysisText: string, gender: string, apiKey: string) {
  try {
    // Extract hairstyle names and create image prompts
    const promptGenerationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an assistant that extracts the names of recommended hairstyles from a hair analysis and creates detailed image descriptions for each style.'
          },
          { 
            role: 'user', 
            content: `Extract the names of the 3 recommended hairstyles from this analysis and create a detailed image description for each one that would work well for searching stock photos. The descriptions should be specifically for ${gender} hairstyles. Here's the analysis: ${analysisText}`
          }
        ],
        max_tokens: 500,
      }),
    });

    const promptData = await promptGenerationResponse.json();
    
    if (promptData.error) {
      console.error('OpenAI API error:', promptData.error);
      throw new Error(`OpenAI API error: ${promptData.error.message}`);
    }
    
    const promptsText = promptData.choices[0].message.content;
    
    // Parse the text into a structured format
    // This is a simple parser. The structure might need adjustment based on actual response patterns
    const stylePrompts = promptsText.split(/\d+\.\s+/g).filter(Boolean).map(text => {
      const lines = text.trim().split('\n');
      const name = lines[0].replace(':', '').trim();
      const description = lines.slice(1).join(' ').trim();
      return { name, description };
    });
    
    return stylePrompts;
  } catch (error) {
    console.error('Error generating style prompts:', error);
    return [];
  }
}
