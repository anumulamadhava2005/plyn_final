
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

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { imageBase64, gender } = requestData;
    
    if (!imageBase64) {
      console.error('No image provided');
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!gender) {
      console.error('No gender specified');
      return new Response(
        JSON.stringify({ error: 'Gender not specified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Analyzing face for ${gender} user with image length: ${imageBase64.length}`);
    
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
    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('OpenAI API error in response:', data.error);
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
      console.error('Error calling OpenAI API:', error);
      throw new Error(`Error calling OpenAI API: ${error.message}`);
    }
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

    if (!promptGenerationResponse.ok) {
      const errorData = await promptGenerationResponse.json();
      console.error('OpenAI API error during style prompt generation:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const promptData = await promptGenerationResponse.json();
    
    if (promptData.error) {
      console.error('OpenAI API error in prompt generation response:', promptData.error);
      throw new Error(`OpenAI API error: ${promptData.error.message}`);
    }
    
    const promptsText = promptData.choices[0].message.content;
    console.log('Generated style prompts:', promptsText);
    
    // Parse the text into a structured format
    // This is a simple parser. The structure might need adjustment based on actual response patterns
    const stylePrompts = promptsText.split(/\d+\.\s+/g).filter(Boolean).map(text => {
      const lines = text.trim().split('\n');
      const name = lines[0].replace(':', '').trim();
      const description = lines.slice(1).join(' ').trim();
      return { name, description };
    });
    
    console.log('Parsed style prompts:', stylePrompts);
    return stylePrompts;
  } catch (error) {
    console.error('Error generating style prompts:', error);
    return [];
  }
}
