// worker.js
// GitHub Pages endpoints
const GITHUB_PAGES_BASE = "https://github.com/burmeweb/burme-ai-app";

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
      if (path === '../api/chat') {
        return handleChat(request, env, corsHeaders);
      } else if (path === '../api/image') {
        return handleImage(request, env, corsHeaders);
      } else if (path === '../api/code') {
        return handleCode(request, env, corsHeaders);
      } else if (path === '../health') {
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

// Fetch handler functions from GitHub Pages
async function fetchHandler(handlerName) {
  try {
    const response = await fetch(`${GITHUB_PAGES_BASE}/api/${handlerName}.js`);
    if (response.ok) {
      const handlerCode = await response.text();
      return new Function('return ' + handlerCode)();
    }
  } catch (error) {
    console.error(`Failed to fetch ${handlerName} handler:`, error);
  }
  return null;
}

// Handler functions with fallback
async function handleChat(request, env, corsHeaders = {}) {
  try {
    const chatHandler = await fetchHandler('chat');
    if (chatHandler) {
      return chatHandler(request, env, corsHeaders);
    }
    
    // Fallback implementation
    const { message } = await request.json();
    
    return new Response(JSON.stringify({
      response: `မင်္ဂလာပါ! သင့်ရဲ့စကား: "${message}"`,
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

async function handleImage(request, env, corsHeaders = {}) {
  try {
    const imageHandler = await fetchHandler('image');
    if (imageHandler) {
      return imageHandler(request, env, corsHeaders);
    }
    
    // Fallback implementation
    const { prompt } = await request.json();
    const imageId = Math.random().toString(36).substring(2, 15);
    
    return new Response(JSON.stringify({
      image_url: `https://placehold.co/512x512/0088cc/white?text=${encodeURIComponent(prompt)}`,
      prompt: prompt,
      image_id: imageId,
      app: env.APP_NAME || "Burme Mark AI",
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
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

async function handleCode(request, env, corsHeaders = {}) {
  try {
    const codeHandler = await fetchHandler('code');
    if (codeHandler) {
      return codeHandler(request, env, corsHeaders);
    }
    
    // Fallback implementation
    const { prompt } = await request.json();
    
    const codeExamples = {
      javascript: `// ${prompt}\nfunction solution() {\n  return "Hello, World!";\n}`,
      python: `# ${prompt}\ndef solution():\n    return "Hello, World!"`
    };
    
    const randomLanguage = Math.random() > 0.5 ? 'javascript' : 'python';
    
    return new Response(JSON.stringify({
      code: codeExamples[randomLanguage],
      language: randomLanguage,
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
