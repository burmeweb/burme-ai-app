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

// Simple rate limiting
const userRateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!userRateLimit.has(ip)) {
    userRateLimit.set(ip, []);
  }
  
  const requests = userRateLimit.get(ip).filter(time => time > windowStart);
  userRateLimit.set(ip, requests);
  
  if (requests.length >= 5) { // 5 requests per minute
    return false;
  }
  
  requests.push(now);
  return true;
}

// Chat handler function - With fallback when OpenAI is rate limited
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

    // Check rate limit
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded",
        message: "Please try again in a few minutes"
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Try OpenAI API first
    try {
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

      if (openaiResponse.status === 429) {
        throw new Error('OpenAI rate limit exceeded');
      }

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const aiResponse = openaiData.choices[0].message.content;
      
      return new Response(JSON.stringify({
        response: aiResponse,
        app: env.APP_NAME || "Burme Mark AI",
        timestamp: new Date().toISOString(),
        source: 'openai'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (openaiError) {
      // Fallback to simple responses if OpenAI fails
      console.log('OpenAI failed, using fallback:', openaiError.message);
      
      const responses = [
        `မင်္ဂလာပါ! သင့်ရဲ့စကား: "${message}" ကို နားလည်ပါတယ်။ ပိုမိုကူညီနိုင်ရန် ကျေးဇူးပြု၍ ထပ်မံမေးမြန်းပေးပါ။`,
        `ကျေးဇူးတင်ပါတယ်! သင့်ရဲ့စကား: "${message}" အတွက် ကူညီပေးနိုင်ရန် ကြိုးစားပါမည်။`,
        `အကြံဉာဏ်ကောင်းပါပဲ! "${message}" ဆိုတဲ့အကြောင်း စဉ်းစားကြည့်ရအောင်...`,
        `မင်္ဂလာပါ! Burme Mark AI မှ ကြိုဆိုပါတယ်။ "${message}" အတွက် ကူညီပေးနိုင်ပါတယ်။`,
        `သင့်ရဲ့စကား: "${message}" ကို သိရတာ ဝမ်းသာပါတယ်။ ဘယ်လိုကူညီရမလဲ?`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return new Response(JSON.stringify({
        response: randomResponse,
        app: env.APP_NAME || "Burme Mark AI",
        timestamp: new Date().toISOString(),
        source: 'fallback'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
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

// Image handler function - With fallback
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
        throw new Error(`Stability AI API error: ${stabilityResponse.status}`);
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

// Code handler function - With fallback
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

    // Try OpenAI API first
    try {
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

      if (openaiResponse.status === 429) {
        throw new Error('OpenAI rate limit exceeded');
      }

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
        timestamp: new Date().toISOString(),
        source: 'openai'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (openaiError) {
      // Fallback to simple code templates
      console.log('OpenAI failed, using fallback:', openaiError.message);
      
      const codeTemplates = {
        javascript: `// ${prompt}\nfunction solution() {\n  // Your code here\n  console.log("Hello, World!");\n  return "Task completed";\n}\n\n// Usage:\n// solution();`,
        python: `# ${prompt}\ndef solution():\n    # Your code here\n    print("Hello, World!")\n    return "Task completed"\n\n# Usage:\n# solution()`,
        html: `<!-- ${prompt} -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Solution</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <!-- Your HTML content here -->\n</body>\n</html>`,
        css: `/* ${prompt} */\n.container {\n    /* Your CSS styles here */\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 20px;\n}\n\n.element {\n    color: #333;\n    font-size: 16px;\n}`
      };

      const template = codeTemplates[language] || codeTemplates.javascript;
      
      return new Response(JSON.stringify({
        code: template,
        language: language,
        prompt: prompt,
        app: env.APP_NAME || "Burme Mark AI",
        timestamp: new Date().toISOString(),
        source: 'fallback',
        note: 'Using template code due to API limitations'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
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
