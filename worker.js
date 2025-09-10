// worker.js
import { handleChat } from 'https://raw.githubusercontent.com/burmeweb/burme-ai-app/main/api/chat.js';
import { handleImage } from 'https://raw.githubusercontent.com/burmeweb/burme-ai-app/main/api/image.js';
import { handleCode } from 'https://raw.githubusercontent.com/burmeweb/burme-ai-app/main/api/code.js';

export default {
  async fetch(request, env, ctx) {
    try {
      const appName = env.APP_NAME || "Burme Mark AI";
      
      const url = new URL(request.url);
      const path = url.pathname;
      const origin = request.headers.get('Origin') || '';
      
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
        message: error.message,
        stack: env.NODE_ENV === 'development' ? error.stack : undefined
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

// Fallback handlers if GitHub import fails
async function handleChat(request, env, corsHeaders = {}) {
  try {
    const { message } = await request.json();
    
    // Simple AI response logic
    const responses = [
      `Hello! You said: "${message}". How can I help you with this?`,
      `I understand you're asking about: "${message}". Could you provide more details?`,
      `Thank you for your message: "${message}". I'll do my best to assist you.`,
      `I've received your query about "${message}". Let me think about that...`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return new Response(JSON.stringify({
      response: randomResponse,
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
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleImage(request, env, corsHeaders = {}) {
  try {
    const { prompt } = await request.json();
    
    // Simple image generation response
    // In a real implementation, you would integrate with an image generation API
    const imageId = Math.random().toString(36).substring(2, 15);
    
    return new Response(JSON.stringify({
      image_url: `https://placehold.co/600x400/0088cc/white?text=${encodeURIComponent(prompt)}`,
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
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleCode(request, env, corsHeaders = {}) {
  try {
    const { prompt } = await request.json();
    
    // Simple code generation response
    // In a real implementation, you would integrate with a code generation API
    const codeExamples = {
      javascript: `// ${prompt}\nfunction solution() {\n  // Your code here\n  return "Hello, World!";\n}`,
      python: `# ${prompt}\ndef solution():\n    # Your code here\n    return "Hello, World!"`,
      html: `<!-- ${prompt} -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Solution</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>`
    };
    
    const languages = Object.keys(codeExamples);
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    
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
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
      }
