// Burme AI - Cloudflare Worker for Myanmar-focused AI Assistant
// worker.js

export default {
  async fetch(request, env) {
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
    };

    // Handle OPTIONS requests for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    // JSON response helper
    function jsonResponse(data, status = 200) {
      return new Response(JSON.stringify(data), {
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
        'en': "I'm experiencing technical difficulties. Please try again in a moment.",
        'my': "ကျေးဇူးပြု၍ ခဏစောင့်ပါ။ ယခုအချိန်တွင် နည်းပညာဆိုင်ရာ အခက်အခဲများ ရှိနေပါသည်။",
        'my-MM': "ကျေးဇူးပြု၍ ခဏစောင့်ပါ။ ယခုအချိန်တွင် နည်းပညာဆိုင်ရာ အခက်အခဲများ ရှိနေပါသည်။",
        'zh': "我遇到了一些技术问题。请稍后再试。",
        'th': "ฉันกำลังประสบปัญหาทางเทคนิค กรุณาลองagainในอีกสักครู่"
      };
      return fallbacks[language] || fallbacks['my'];
    }

    // Main request handler
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Route requests based on path
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
        service: 'Burme AI',
        timestamp: new Date().toISOString(),
        services: {
          openai: !!openaiKey,
          stability: !!stabilityKey
        }
      });
    }

    // Handle chat messages with OpenAI
    async function handleChatRequest(request, openaiApiKey) {
      try {
        const requestData = await request.json();
        const { message, chatId, language = 'my' } = requestData;

        if (!message) {
          return jsonResponse({ error: 'Message is required' }, 400);
        }

        if (!openaiApiKey) {
          return jsonResponse({ 
            success: false, 
            error: 'OpenAI service not configured',
            fallbackResponse: getFallbackResponse(language)
          }, 503);
        }

        // Call OpenAI API
        const openaiResponse = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are Burme AI, a helpful AI assistant focused on Myanmar. 
                Respond in ${getLanguageName(language)} language. 
                Be culturally appropriate for Myanmar users. 
                Provide helpful information about Myanmar culture, history, and current events.`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.text();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API responded with status: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        const responseText = openaiData.choices[0].message.content;

        return jsonResponse({
          success: true,
          response: responseText,
          chatId: chatId || generateChatId(),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error in chat request:', error);
        return jsonResponse({ 
          success: false, 
          error: 'Failed to process message',
          fallbackResponse: getFallbackResponse(requestData?.language || 'my')
        }, 500);
      }
    }

    // Handle audio transcription with OpenAI Whisper
    async function handleAudioRequest(request, openaiApiKey) {
      try {
        const formData = await request.formData();
        const audioFile = formData.get('audio');
        const chatId = formData.get('chatId');
        const language = formData.get('language') || 'my';

        if (!audioFile) {
          return jsonResponse({ error: 'Audio file is required' }, 400);
        }

        if (!openaiApiKey) {
          return jsonResponse({ 
            success: false, 
            error: 'OpenAI service not configured',
            fallbackResponse: getFallbackResponse(language)
          }, 503);
        }

        // Convert audio file to blob
        const audioBlob = await audioFile.arrayBuffer();

        // Transcribe audio using OpenAI Whisper API
        const whisperFormData = new FormData();
        whisperFormData.append('file', new Blob([audioBlob], { type: audioFile.type }), 'audio.wav');
        whisperFormData.append('model', 'whisper-1');
        whisperFormData.append('language', language === 'my' ? 'my' : language);

        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: whisperFormData
        });

        if (!whisperResponse.ok) {
          const errorData = await whisperResponse.text();
          console.error('OpenAI Whisper API error:', errorData);
          throw new Error(`Whisper API responded with status: ${whisperResponse.status}`);
        }

        const whisperData = await whisperResponse.json();
        const transcript = whisperData.text;

        // Process the transcript with OpenAI Chat API
        const chatResponse = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are Burme AI, a helpful AI assistant focused on Myanmar. 
                Respond in ${getLanguageName(language)} language. 
                The user sent an audio message with the following transcript: ${transcript}`
              },
              {
                role: 'user',
                content: transcript
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (!chatResponse.ok) {
          throw new Error(`OpenAI API responded with status: ${chatResponse.status}`);
        }

        const chatData = await chatResponse.json();
        const responseText = chatData.choices[0].message.content;

        return jsonResponse({
          success: true,
          text: transcript,
          response: responseText,
          chatId: chatId || generateChatId(),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error in audio request:', error);
        return jsonResponse({ 
          success: false, 
          error: 'Failed to process audio',
          fallbackResponse: getFallbackResponse(language || 'my')
        }, 500);
      }
    }

    // Handle image analysis with OpenAI Vision
    async function handleImageRequest(request, openaiApiKey) {
      try {
        const formData = await request.formData();
        const imageFile = formData.get('image');
        const chatId = formData.get('chatId');
        const language = formData.get('language') || 'my';

        if (!imageFile) {
          return jsonResponse({ error: 'Image file is required' }, 400);
        }

        if (!openaiApiKey) {
          return jsonResponse({ 
            success: false, 
            error: 'OpenAI service not configured',
            fallbackResponse: getFallbackResponse(language)
          }, 503);
        }

        // Convert image to base64 for OpenAI Vision API
        const imageBuffer = await imageFile.arrayBuffer();
        const imageBase64 = btoa(
          new Uint8Array(imageBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        // Analyze image using OpenAI Vision API
        const visionResponse = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'system',
                content: `You are Burme AI, a helpful AI assistant focused on Myanmar. 
                Describe this image in detail and respond in ${getLanguageName(language)} language. 
                Pay special attention to elements relevant to Myanmar culture.`
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'ကျေးဇူးပြု၍ ဒီပုံကို ရှင်းပြပေးပါ။'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${imageFile.type};base64,${imageBase64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000
          })
        });

        if (!visionResponse.ok) {
          const errorData = await visionResponse.text();
          console.error('OpenAI Vision API error:', errorData);
          throw new Error(`Vision API responded with status: ${visionResponse.status}`);
        }

        const visionData = await visionResponse.json();
        const responseText = visionData.choices[0].message.content;

        return jsonResponse({
          success: true,
          response: responseText,
          chatId: chatId || generateChatId(),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error in image request:', error);
        return jsonResponse({ 
          success: false, 
          error: 'Failed to process image',
          fallbackResponse: getFallbackResponse(language || 'my')
        }, 500);
      }
    }

    // Handle text-to-image generation with Stability AI
    async function handleImageGeneration(request, stabilityKey) {
      try {
        const requestData = await request.json();
        const { prompt, chatId } = requestData;

        if (!prompt) {
          return jsonResponse({ error: 'Prompt is required' }, 400);
        }

        if (!stabilityKey) {
          return jsonResponse({ error: 'Image generation service not configured' }, 503);
        }

        // Generate image using Stability AI
        const stabilityResponse = await fetch(STABILITY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${stabilityKey}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            text_prompts: [{ text: prompt }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1
          })
        });

        if (!stabilityResponse.ok) {
          const errorData = await stabilityResponse.text();
          console.error('Stability AI API error:', errorData);
          throw new Error(`Stability AI API responded with status: ${stabilityResponse.status}`);
        }

        const stabilityData = await stabilityResponse.json();
        
        // The image is returned as base64 in the response
        const imageData = stabilityData.artifacts[0].base64;

        return jsonResponse({
          success: true,
          image: imageData,
          chatId: chatId || generateChatId(),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error in image generation:', error);
        return jsonResponse({ 
          success: false, 
          error: 'Failed to generate image'
        }, 500);
      }
    }
  }
};
