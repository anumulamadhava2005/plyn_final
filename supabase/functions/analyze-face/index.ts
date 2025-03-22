
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
      console.error('OpenAI API key is not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
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

    // Check if the base64 string is valid
    if (!imageBase64.match(/^[A-Za-z0-9+/=]+$/)) {
      console.error('Invalid base64 image data');
      return new Response(
        JSON.stringify({ error: 'Invalid image data format' }),
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
    let openAIResponse;
    try {
      console.log('Sending request to OpenAI API...');
      
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
        console.error('OpenAI API error status:', response.status);
        console.error('OpenAI API error details:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      openAIResponse = await response.json();
      
      if (!openAIResponse || !openAIResponse.choices || !openAIResponse.choices[0]) {
        console.error('OpenAI API returned an unexpected response format:', openAIResponse);
        throw new Error('OpenAI API returned an invalid response');
      }
      
      console.log('OpenAI API response received successfully');
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Extract the analysis
    const analysisText = openAIResponse.choices[0].message.content;
    console.log('Analysis text extracted from response');
      
    // Generate image prompts for each recommended style
    try {
      console.log('Generating style image prompts...');
      const stylePrompts = await generateStyleImagePrompts(analysisText, gender, openAIApiKey);
      console.log('Style prompts generated successfully:', stylePrompts);

      return new Response(
        JSON.stringify({ 
          analysis: analysisText,
          stylePrompts
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error generating style prompts:', error);
      // Still return the analysis even if style prompts generation fails
      return new Response(
        JSON.stringify({ 
          analysis: analysisText,
          stylePrompts: [],
          warning: 'Style prompts could not be generated, but analysis was successful'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unhandled error in analyze-face function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function generateStyleImagePrompts(analysisText: string, gender: string, apiKey: string) {
  try {
    console.log('Starting style prompt generation...');
    
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
    
    if (!promptData || !promptData.choices || !promptData.choices[0]) {
      console.error('OpenAI API returned an unexpected format for style prompts:', promptData);
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const promptsText = promptData.choices[0].message.content;
    console.log('Raw style prompts text:', promptsText);
    
    // Parse the text into a structured format with fallback
    let stylePrompts = [];
    
    try {
      // Try to parse by numbered items (primary approach)
      stylePrompts = promptsText.split(/\d+\.\s+/g).filter(Boolean).map(text => {
        const lines = text.trim().split('\n');
        const name = lines[0].replace(':', '').trim();
        const description = lines.slice(1).join(' ').trim();
        return { name, description };
      });
      
      // Validate each item has both name and description
      const isValid = stylePrompts.every(item => item.name && item.description);
      
      if (!isValid || stylePrompts.length === 0) {
        throw new Error('Parsing failed to extract valid style prompts');
      }
      
      console.log('Successfully parsed style prompts:', stylePrompts);
    } catch (error) {
      console.error('Error in primary parsing method:', error);
      
      // Fallback parsing method
      try {
        // Look for style names in bold or with colons
        const styleMatches = promptsText.match(/(?:\*\*|#)(.*?)(?:\*\*|:)/g) || [];
        
        if (styleMatches.length > 0) {
          stylePrompts = styleMatches.map((match, index) => {
            const name = match.replace(/\*\*|#|:/g, '').trim();
            
            // Extract description that follows the name
            const nameEscaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${nameEscaped}(?:\\*\\*|:)\\s*(.*?)(?=\\*\\*|#|$)`, 's');
            const descMatch = promptsText.match(regex);
            const description = descMatch ? descMatch[1].trim() : `${gender} hairstyle`;
            
            return { name, description };
          });
          
          console.log('Fallback parsing succeeded:', stylePrompts);
        } else {
          // Ultimate fallback: Just create generic items
          stylePrompts = [
            { name: 'Style 1', description: `Trendy ${gender} hairstyle` },
            { name: 'Style 2', description: `Modern ${gender} haircut` },
            { name: 'Style 3', description: `Classic ${gender} hairstyle` }
          ];
          console.log('Using generic fallback styles:', stylePrompts);
        }
      } catch (fallbackError) {
        console.error('Both parsing methods failed:', fallbackError);
        // Return generic prompts as the ultimate fallback
        stylePrompts = [
          { name: 'Style 1', description: `Trendy ${gender} hairstyle` },
          { name: 'Style 2', description: `Modern ${gender} haircut` },
          { name: 'Style 3', description: `Classic ${gender} hairstyle` }
        ];
      }
    }
    
    // Ensure we have exactly 3 styles
    while (stylePrompts.length < 3) {
      const index = stylePrompts.length + 1;
      stylePrompts.push({ 
        name: `Style ${index}`, 
        description: `Recommended ${gender} hairstyle number ${index}` 
      });
    }
    
    if (stylePrompts.length > 3) {
      stylePrompts = stylePrompts.slice(0, 3);
    }
    
    return stylePrompts;
  } catch (error) {
    console.error('Error generating style prompts:', error);
    // Return generic prompts as the fallback
    return [
      { name: 'Style 1', description: `Trendy ${gender} hairstyle` },
      { name: 'Style 2', description: `Modern ${gender} haircut` },
      { name: 'Style 3', description: `Classic ${gender} hairstyle` }
    ];
  }
}
