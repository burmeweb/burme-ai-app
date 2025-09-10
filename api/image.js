// api/image.js
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function handleImage(request, env, corsHeaders = {}) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        error: "Method not allowed",
        message: "Only POST requests are supported"
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const { prompt } = await request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({
        error: "Bad request",
        message: "Prompt is required"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Try Stability AI API first
    try {
      const stabilityResponse = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.STABILITY_KEY}`,
          'Accept': 'image/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          output_format: 'png',
        })
      });

      if (stabilityResponse.status === 429) {
        throw new Error('Stability AI rate limit exceeded');
      }

      if (!stabilityResponse.ok) {
        const errorText = await stabilityResponse.text();
        throw new Error(`Stability AI API error: ${stabilityResponse.status} - ${errorText}`);
      }

      const imageBuffer = await stabilityResponse.arrayBuffer();
      const base64Image = arrayBufferToBase64(imageBuffer);
      
      return new Response(JSON.stringify({
        image_url: `data:image/png;base64,${base64Image}`,
        prompt: prompt,
        image_id: Math.random().toString(36).substring(2, 15),
        app: env.APP_NAME || "Burme Mark AI",
        timestamp: new Date().toISOString(),
        source: 'stability_ai'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (stabilityError) {
      // Fallback to placeholder image
      console.log('Stability AI failed, using fallback:', stabilityError.message);
      
      return new Response(JSON.stringify({
        image_url: `https://placehold.co/512x512/0088cc/white?text=${encodeURIComponent(prompt.substring(0, 50))}`,
        prompt: prompt,
        image_id: Math.random().toString(36).substring(2, 15),
        app: env.APP_NAME || "Burme Mark AI",
        timestamp: new Date().toISOString(),
        source: 'fallback',
        note: 'Using placeholder image due to API limitations'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({
      error: "Failed to process image request",
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}
