// api/chat.js
export async function handleChat(request, env, corsHeaders = {}) {
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
        const errorData = await openaiResponse.json();
        throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
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
