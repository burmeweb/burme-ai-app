// worker.js
export default {
  async fetch(request, env, ctx) {
    try {
      // env ကို ဒီလို အသုံးပြုပါ
      const appName = env.APP_NAME || "Burme Mark AI";
      
      const url = new URL(request.url);
      const path = url.pathname;
      
      if (path === '/api/chat') {
        // Chat endpoint logic
        return handleChat(request, env);
      } else if (path === '/api/image') {
        // Image endpoint logic  
        return handleImage(request, env);
      } else {
        return new Response(JSON.stringify({ 
          error: "Endpoint not found",
          available_endpoints: ["/api/chat", "/api/image"]
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "Internal server error",
        message: error.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

async function handleChat(request, env) {
  // Chat handling logic
  const { message } = await request.json();
  
  return new Response(JSON.stringify({
    response: `This is a response to: ${message}`,
    app: env.APP_NAME || "Burme Mark AI"
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleImage(request, env) {
  // Image handling logic
  const { prompt } = await request.json();
  
  return new Response(JSON.stringify({
    image_url: `https://example.com/generated-image.png?prompt=${encodeURIComponent(prompt)}`,
    app: env.APP_NAME || "Burme Mark AI"
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
