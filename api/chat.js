// api/chat.js
export async function handleChat(request, env, corsHeaders = {}) {
  try {
    // Check if request method is POST
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

    const { message, conversation_history = [] } = await request.json();
    
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

    // Simple AI response logic - in production, integrate with real AI API
    const responses = [
      `မင်္ဂလာပါ! သင့်ရဲ့စကားက "${message}"။ ဒီအကြောင်း ကူညီပေးနိုင်ဖို့ ဝမ်းသာပါတယ်။`,
      `သင့်ရဲ့မေးခွန်း "${message}" ကို နားလည်ပါတယ်။ ပိုမိုသိရှိလိုပါက ထပ်မံမေးမြန်းနိုင်ပါတယ်။`,
      `ကျေးဇူးတင်ပါတယ်! သင့်ရဲ့စကား "${message}" ကို လေ့လာပြီး အကောင်းဆုံးအဖြေပေးနိုင်ရန် ကြိုးစားပါမည်။`,
      `အကြံဉာဏ်ကောင်းပါပဲ! "${message}" ဆိုတဲ့အကြောင်း စဉ်းစားကြည့်ရအောင်...`
    ];

    // Check for specific keywords to provide more relevant responses
    let customResponse = '';
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi') || message.includes('မင်္ဂလာပါ')) {
      customResponse = 'မင်္ဂလာပါ! Burme Mark AI မှ ကြိုဆိုပါတယ်။ ဘယ်လိုကူညီရမလဲ?';
    } else if (message.toLowerCase().includes('weather') || message.includes('ရာသီဥတု')) {
      customResponse = 'ရာသီဥတုအခြေအနေအတွက် ကျေးဇူးတင်ပါတယ်။ လက်ရှိမှာ ရန်ကုန်မြို့ရဲ့ ရာသီဥတုက 32°C နဲ့ တိမ်အနည်းငယ်ရှိနေပါတယ်။';
    } else if (message.toLowerCase().includes('time') || message.includes('အချိန်')) {
      const now = new Date();
      customResponse = `လက်ရှိအချိန်က ${now.toLocaleTimeString()} ဖြစ်ပါတယ်။`;
    } else if (message.toLowerCase().includes('name') || message.includes('နာမည်')) {
      customResponse = 'ကျွန်တော့်နာမည်က Burme Mark AI ဖြစ်ပါတယ်။ သင့်ကို ကူညီရတာ ဝမ်းသာပါတယ်!';
    }

    const randomResponse = customResponse || responses[Math.floor(Math.random() * responses.length)];
    
    return new Response(JSON.stringify({
      response: randomResponse,
      app: env.APP_NAME || "Burme Mark AI",
      timestamp: new Date().toISOString(),
      message_length: message.length,
      conversation_history: [...conversation_history, { role: 'user', content: message }]
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
      message: error.message,
      stack: env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
        }
