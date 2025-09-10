// worker.js
// Import handler functions
import { handleChat } from './api/chat.js';
import { handleImage } from './api/image.js';
import { handleCode } from './api/code.js';

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
  
  if (requests.length >= 10) { // 10 requests per minute
    return false;
  }
  
  requests.push(now);
  return true;
}

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
      
      // Check rate limit for API endpoints
      if (path.startsWith('/api/')) {
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

