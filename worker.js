// worker.js
export default {
  async fetch(request, env, ctx) {
    try {
      const appName = env.APP_NAME || "Burme Mark AI";
      
      const url = new URL(request.url);
      const path = url.pathname;
      
      // CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      };
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }
      
      // Route requests to appropriate handlers
      if (path === '/api/chat') {
        return handleChat(request, env, corsHeaders);
      } else if (path === '/api/image') {
        return handleImage(request, env, corsHeaders);
      } else if (path === '/api/code') {
        return handleCode(request, env, corsHeaders);
      } else if (path === '/health') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          app: appName,
          timestamp: new Date().toISOString()
        }), { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } else {
        return new Response(JSON.stringify({ 
          error: "Endpoint not found",
          available_endpoints: [
            "/api/chat", 
            "/api/image", 
            "/api/code",
            "/health"
          ]
        }), { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "Internal server error",
        message: error.message
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
}

// Chat handler function - Using OpenAI API
async function handleChat(request, env, corsHeaders = {}) {
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

    const { message } = await request.json();
    
    if (!message) {
      return new Response(JSON.stringify({
        error: "Bad request",
        message: "Message is required"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that responds in Burmese language. Be friendly and helpful.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;
    
    return new Response(JSON.stringify({
      response: aiResponse,
      app: env.APP_NAME || "Burme Mark AI",
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({
      error: "Failed to process chat request",
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

// Image handler function - Using Stability AI API
async function handleImage(request, env, corsHeaders = {}) {
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

    // Call Stability AI API
    const stabilityResponse = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STABILITY_KEY}`,
        'Accept': 'image/*'
      },
      body: JSON.stringify({
        prompt: prompt,
        output_format: 'png',
      })
    });

    if (!stabilityResponse.ok) {
      const errorText = await stabilityResponse.text();
      throw new Error(`Stability AI API error: ${stabilityResponse.status} - ${errorText}`);
    }

    // Convert image to base64 for JSON response
    const imageBuffer = await stabilityResponse.arrayBuffer();
    const base64Image = arrayBufferToBase64(imageBuffer);
    
    return new Response(JSON.stringify({
      image_url: `data:image/png;base64,${base64Image}`,
      prompt: prompt,
      image_id: Math.random().toString(36).substring(2, 15),
      app: env.APP_NAME || "Burme Mark AI",
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
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

// Code handler function - Using OpenAI API for code generation
async function handleCode(request, env, corsHeaders = {}) {
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

    const { prompt, language = "javascript" } = await request.json();
    
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

    // Call OpenAI API for code generation
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} programmer. Generate clean, efficient code based on the user's request.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedCode = openaiData.choices[0].message.content;
    
    return new Response(JSON.stringify({
      code: generatedCode,
      language: language,
      prompt: prompt,
      app: env.APP_NAME || "Burme Mark AI",
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Code generation error:', error);
    return new Response(JSON.stringify({
      error: "Failed to process code request",
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

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
            }
