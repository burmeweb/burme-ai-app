// Burme AI - Cloudflare Worker for Myanmar-focused AI Assistant
// worker.js

export default {
  async fetch(request, env) {
    // App Name (from env or fallback)
    const APP_NAME = env.APP_NAME || "Burme Mark AI";

    // Set environment variables
    const OPENAI_API_KEY = env.OPENAI_API_KEY;
    const STABILITY_KEY = env.STABILITY_KEY;
    
    // API endpoints
    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

    // CORS headers
    const CORS_HEADERS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'X-Powered-By': APP_NAME
    };

    // Handle OPTIONS requests for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    // JSON response helper
    function jsonResponse(data, status = 200) {
      return new Response(JSON.stringify({
        app: APP_NAME,
        ...data
      }), {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });
    }

    // Generate chat ID
    function generateChatId() {
      return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Get language name from code
    function getLanguageName(languageCode) {
      const languages = {
        'en': 'English',
        'my': 'Burmese',
        'my-MM': 'Burmese (Myanmar)',
        'zh': 'Chinese',
        'th': 'Thai'
      };
      return languages[languageCode] || 'Burmese';
    }

    // Get fallback response when AI services are unavailable
    function getFallbackResponse(language = 'my') {
      const fallbacks = {
        'en': `(${APP_NAME}) I'm experiencing technical difficulties. Please try again in a moment.`,
        'my': `(${APP_NAME}) ကျေးဇူးပြု၍ ခဏစောင့်ပါ။ ယခုအချိန်တွင် နည်းပညာဆိုင်ရာ အခက်အခဲများ ရှိနေပါသည်။`,
        'my-MM': `(${APP_NAME}) ကျေးဇူးပြု၍ ခဏစောင့်ပါ။ ယခုအချိန်တွင် နည်းပညာဆိုင်ရာ အခက်အခဲများ ရှိနေပါသည်။`,
        'zh': `(${APP_NAME}) 我遇到了一些技术问题。请稍后再试。`,
        'th': `(${APP_NAME}) ฉันกำลังประสบปัญหาทางเทคนิค กรุณาลองอีกครั้งในอีกสักครู่`
      };
      return fallbacks[language] || fallbacks['my'];
    }

    // Main request handler
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === '/' || path === '/chat') {
        return await handleChatRequest(request, OPENAI_API_KEY);
      } else if (path === '/audio') {
        return await handleAudioRequest(request, OPENAI_API_KEY);
      } else if (path === '/image') {
        return await handleImageRequest(request, OPENAI_API_KEY);
      } else if (path === '/generate-image') {
        return await handleImageGeneration(request, STABILITY_KEY);
      } else if (path === '/health') {
        return handleHealthCheck(OPENAI_API_KEY, STABILITY_KEY);
      } else {
        return jsonResponse({ error: 'Endpoint not found' }, 404);
      }
    } catch (error) {
      console.error('Error handling request:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }

    // Health check endpoint
    function handleHealthCheck(openaiKey, stabilityKey) {
      return jsonResponse({
        status: 'ok',
        service: APP_NAME,
        timestamp: new Date().toISOString(),
        services: {
          openai: !!openaiKey,
          stability: !!stabilityKey
        }
      });
    }

    // === handleChatRequest, handleAudioRequest, handleImageRequest, handleImageGeneration ===
    // အဲဒီ function တွေကို မင်းရေးထားသလို ထားပေးလို့ရ already
    // ဘာကို return လုပ်သွားမဆို JSON response ထဲမှာ `app: APP_NAME` ပါသွားမယ်
  }
};
