export async function handleChatRequest(c) {
  try {
    const { message, type = 'text' } = await c.req.json()
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400)
    }

    let response;
    
    // Determine the type of request and route accordingly
    if (type === 'image') {
      response = await generateImage(message);
    } else if (type === 'code') {
      response = await generateCode(message);
    } else {
      response = await generateResponse(message);
    }
    
    return c.json({ response, type })
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'Internal server error' }, 500)
  }
}

async function generateResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  // Expanded responses for more natural conversation
  const responses = {
    'greeting': 'မင်္ဂလာပါ! Burme Mark Chat Bot မှ ကြိုဆိုပါတယ်။ ဘာလုပ်ပေးရမလဲ?',
    'name': 'ကျွန်တော့်နာမည်က Burme Mark Chat Bot ပါ။ ကျေးဇူးပြု၍ မိတ်ဆက်ရတာ ဝမ်းသာပါတယ်။',
    'help': 'ကျွန်တော်က မြန်မာလို စကားပြောပေးတဲ့ chat bot ပါ။\n\nကျွန်တော်နဲ့:\n- စကားပြောနိုင်ပါတယ်\n- ပုံတွေထုတ်ပေးနိုင်ပါတယ် (image လို့ ရှေ့မှာထည့်ပြောပါ)\n- ကုဒ်တွေ ရေးပေးနိုင်ပါတယ် (code လို့ ရှေ့မှာထည့်ပြောပါ)\n- ဘာသာပြန်ပေးနိုင်ပါတယ်',
    'thanks': 'ရှင်တို့ကို ကူညီပေးရတာ ကျွန်တော် ဝမ်းသာပါတယ်။ နောက်ထပ် ဘာကူညီရမလဲ?',
    'creator': 'ကျွန်တော့်ကို Myanmar Developer တွေက ဖန်တီးထားတာပါ။ ကျေးဇူးတင်ပါတယ်။',
    'image-help': 'ပုံထုတ်ချင်ရင် အောက်ပါပုံစံမျိုး မေးနိုင်ပါတယ်:\n- "image ကြောင်ပုံ" \n- "image နေဝန်းထွက်နေတဲ့ ရှုခင်း" \n- "image မြန်မာ့ရိုးရာ အနုပညာ"',
    'code-help': 'ကုဒ်ရေးချင်ရင် အောက်ပါပုံစံမျိုး မေးနိုင်ပါတယ်:\n- "code Python Fibonacci function" \n- "code website landing page" \n- "code JavaScript array sorting"',
    'default': 'နားမလည်လို့ ကျေးဇူးပြု၍ ထပ်မေးပေးပါ။ ကျွန်တော်က စကားပြောတာ၊ ပုံထုတ်ပေးတာ၊ ကုဒ်ရေးပေးတာ စတာတွေ လုပ်ပေးနိုင်ပါတယ်။'
  };

  // Greeting detection
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || 
      lowerMsg.includes('နေကောင်းလား') || lowerMsg.includes('မင်္ဂလာပါ') ||
      lowerMsg.includes('ဟိုင်း') || lowerMsg.includes('ဟယ်လို')) {
    return responses['greeting'];
  } 
  // Name detection
  else if (lowerMsg.includes('name') || lowerMsg.includes('နာမည်') || 
           lowerMsg.includes('သင့်နာမည်') || lowerMsg.includes('မင်းနာမည်')) {
    return responses['name'];
  } 
  // Help detection
  else if (lowerMsg.includes('help') || lowerMsg.includes('ကူညီ') || 
           lowerMsg.includes('လုပ်ဆောင်ချက်') || lowerMsg.includes('ဘာတွေလုပ်နိုင်')) {
    return responses['help'];
  } 
  // Thanks detection
  else if (lowerMsg.includes('thanks') || lowerMsg.includes('thank') || 
           lowerMsg.includes('ကျေးဇူးတင်ပါ') || lowerMsg.includes('ကျေး')) {
    return responses['thanks'];
  } 
  // Creator detection
  else if (lowerMsg.includes('create') || lowerMsg.includes('ဖန်တီးတာ') || 
           lowerMsg.includes('ဘယ်သူလဲ') || lowerMsg.includes('ဘယ်သူ့')) {
    return responses['creator'];
  } 
  // Image request detection
  else if (lowerMsg.includes('image') || lowerMsg.includes('ပုံ') || 
           lowerMsg.includes('picture') || lowerMsg.includes('ရုပ်ပုံ')) {
    return responses['image-help'];
  } 
  // Code request detection
  else if (lowerMsg.includes('code') || lowerMsg.includes('ကုဒ်') || 
           lowerMsg.includes('programming') || lowerMsg.includes('program') ||
           lowerMsg.includes('coding') || lowerMsg.includes('software')) {
    return responses['code-help'];
  }
  
  return responses['default'];
}

async function generateImage(prompt) {
  // In a real implementation, you would integrate with an image generation API
  // For demonstration, we'll return a mock response
  
  const imagePrompts = {
    'ကြောင်ပုံ': 'တစ်ကိုယ်လုံးဖြူနေတဲ့ ပျော့ပျောင်းသော ကြောင်လေးရဲ့ AI-generated ပုံ',
    'နေဝန်းထွက်နေတဲ့ ရှုခင်း': 'တောတောင်အခင်းအကျင်းကြားက နေဝန်းထွက်ချိန်ရဲ့ အလှပြင်း ရှုခင်းပုံ',
    'မြန်မာ့ရိုးရာ အနုပညာ': 'မြန်မာ့ယဉ်ကျေးမှုနဲ့ ထုံးတမ်းစဉ်လာတွေကို ဖော်ကျူးထားတဲ့ ရှေးဟောင်းပန်းချီဆန်ဆန် ပုံ',
    'default': `"${prompt}" အတွက် AI-generated ပုံ`
  };
  
  let imageDescription = imagePrompts.default;
  
  for (const [key, value] of Object.entries(imagePrompts)) {
    if (prompt.includes(key)) {
      imageDescription = value;
      break;
    }
  }
  
  return {
    text: `သင့်အတွက် "${prompt}" ပုံကို ဖန်တီးပေးပါပြီ။`,
    image: imageDescription,
    prompt: prompt,
    tips: 'ပိုကောင်းတဲ့ ရလဒ်ရဖို့ အင်္ဂလိပ်လိုရေးပေးရင် ပိုကောင်းပါတယ်။'
  };
}

async function generateCode(request) {
  // In a real implementation, you would integrate with a code generation API
  // For demonstration, we'll return example code snippets
  
  const codeSnippets = {
    'python fibonacci': {
      language: 'python',
      code: `def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

# Example usage
print(fibonacci(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`
    },
    'website landing page': {
      language: 'html',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Landing Page</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; }
        .hero { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 100px 20px; 
            text-align: center; 
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        h1 { font-size: 3rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; margin-bottom: 30px; }
        .btn {
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .btn:hover { background: #ff5252; transform: translateY(-2px); }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>Welcome to Our Amazing Product</h1>
            <p>Transform your workflow with our innovative solution</p>
            <a href="#signup" class="btn">Get Started Today</a>
        </div>
    </section>
</body>
</html>`
    },
    'javascript array sorting': {
      language: 'javascript',
      code: `// Basic array sorting
const numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5];
console.log(numbers.sort()); // [1, 1, 2, 3, 4, 5, 5, 6, 9]

// Custom sorting - numerical order
console.log(numbers.sort((a, b) => a - b)); // Ascending
console.log(numbers.sort((a, b) => b - a)); // Descending

// Sorting objects by property
const users = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
    { name: 'Jim', age: 35 }
];

// Sort by age (ascending)
console.log(users.sort((a, b) => a.age - b.age));

// Sort by name (alphabetical)
console.log(users.sort((a, b) => a.name.localeCompare(b.name)));`
    },
    'default': {
      language: 'text',
      code: `# ကုဒ်ဥပမာ

ကျေးဇူးပြု၍ ပိုတိကျတဲ့ ကုဒ်တောင်းဆိုမှုတစ်ခုပေးပါ။

ဥပမာ:
- "Python Fibonacci function"
- "HTML website landing page"
- "JavaScript array sorting"
- "Python data analysis"
- "React component"
- "CSS grid layout"`
    }
  };
  
  const lowerRequest = request.toLowerCase();
  let response = codeSnippets.default;
  
  if (lowerRequest.includes('fibonacci')) {
    response = codeSnippets['python fibonacci'];
  } else if (lowerRequest.includes('website') || lowerRequest.includes('landing page')) {
    response = codeSnippets['website landing page'];
  } else if (lowerRequest.includes('array') || lowerRequest.includes('sort')) {
    response = codeSnippets['javascript array sorting'];
  }
  
  return {
    text: `သင့်အတွက် ${response.language.toUpperCase()} ကုဒ်ဥပမာ:`,
    code: response.code,
    language: response.language,
    tips: 'ကုဒ်ကို ကူးယူအသုံးပြုနိုင်ပါတယ်။ လိုအပ်ရင် ရှင်းပြပေးဖို့ ပြောပါ။'
  };
}
