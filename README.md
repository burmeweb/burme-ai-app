Burme Mark Chat Bot - GitHub Repository တည်ဆောက်ခြင်း

Burme Mark chat bot အတွက် GitHub repository တစ်ခုတည်ဆောက်ရန် လိုအပ်သော အခြေခံဖိုင်များကို အောက်တွင် ဖော်ပြထားပါသည်။

Repository ဖွဲ့စည်းပုံ

```
burme-mark-chatbot/
├── src/
│   ├── index.js              # Main Cloudflare Worker code
│   ├── handlers.js           # Request handlers
│   └── utils.js              # Utility functions
├── public/
│   ├── index.html            # Chat interface
│   ├── style.css             # Styling
│   └── script.js             # Client-side JavaScript
├── package.json              # Dependencies
├── wrangler.toml             # Cloudflare Worker configuration
├── README.md                 # Project documentation
└── .gitignore                # Git ignore rules
```

အဓိက ဖိုင်များ၏ အကြောင်းအရာ

1. package.json

```json
{
  "name": "burme-mark-chatbot",
  "version": "1.0.0",
  "description": "A Myanmar language chat bot built on Cloudflare Workers",
  "main": "src/index.js",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "hono": "^3.11.7"
  },
  "devDependencies": {
    "wrangler": "^3.0.0"
  }
}
```

2. wrangler.toml

```toml
name = "burme-mark-chatbot"
compatibility_date = "2024-05-01"

[[routes]]
pattern = "burmemark-worker.mysvm.workers.dev"
custom_domain = true
```

3. src/index.js (Cloudflare Worker)

```javascript
import { Hono } from 'hono'
import { handleChatRequest } from './handlers.js'

const app = new Hono()

// CORS middleware
app.use('*', async (c, next) => {
  c.res.headers.append('Access-Control-Allow-Origin', '*')
  c.res.headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.res.headers.append('Access-Control-Allow-Headers', 'Content-Type')
  await next()
})

// Routes
app.get('/', (c) => c.text('Burme Mark Chat Bot API'))
app.post('/api/chat', handleChatRequest)
app.get('/api/health', (c) => c.json({ status: 'ok' }))

export default app
```

4. src/handlers.js

```javascript
export async function handleChatRequest(c) {
  try {
    const { message } = await c.req.json()
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400)
    }

    // Simple response logic - you can expand this with AI integration
    const response = await generateResponse(message)
    
    return c.json({ response })
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
}

async function generateResponse(message) {
  // This is a simple example - integrate with your preferred AI service
  const responses = {
    'hello': 'မင်္ဂလာပါ! Burme Mark Chat Bot မှ ကြိုဆိုပါတယ်။',
    'name': 'ကျွန်တော့်နာမည်က Burme Mark Chat Bot ပါ။',
    'help': 'ကျွန်တော်က မြန်မာလို စကားပြောပေးတဲ့ chat bot ပါ။ ဘာတွေ ကူညီပေးရမလဲ?',
    'default': 'နားမလည်လို့ ကျေးဇူးပြု၍ ထပ်မေးပေးပါ။'
  }

  const lowerMsg = message.toLowerCase()
  
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('နေကောင်းလား')) {
    return responses['hello']
  } else if (lowerMsg.includes('name') || lowerMsg.includes('နာမည်')) {
    return responses['name']
  } else if (lowerMsg.includes('help') || lowerMsg.includes('ကူညီ')) {
    return responses['help']
  }
  
  return responses['default']
}
```

5. public/index.html (Chat Interface)

```html
<!DOCTYPE html>
<html lang="my">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burme Mark Chat Bot</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Burme Mark Chat Bot</h1>
        </header>
        
        <div class="chat-container">
            <div id="chat-messages" class="chat-messages"></div>
            
            <div class="input-area">
                <input type="text" id="message-input" placeholder="စာရိုက်ထည့်ပါ..." autocomplete="off">
                <button id="send-button">发送</button>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

6. public/style.css

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Padauk', 'Myanmar Text', sans-serif;
    background-color: #f5f5f5;
    color: #333;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    margin-bottom: 20px;
}

header h1 {
    color: #2c5282;
}

.chat-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.chat-messages {
    height: 400px;
    overflow-y: auto;
    padding: 15px;
}

.message {
    margin-bottom: 15px;
    padding: 10px 15px;
    border-radius: 18px;
    max-width: 80%;
    word-wrap: break-word;
}

.user-message {
    background-color: #dcf8c6;
    margin-left: auto;
    text-align: right;
}

.bot-message {
    background-color: #e5e5ea;
}

.input-area {
    display: flex;
    padding: 15px;
    border-top: 1px solid #ddd;
    background-color: #f9f9f9;
}

#message-input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
    font-family: inherit;
}

#send-button {
    margin-left: 10px;
    padding: 10px 20px;
    background-color: #2c5282;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-family: inherit;
}

#send-button:hover {
    background-color: #2a4365;
}
```

7. public/script.js

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        addMessage(message, true);
        messageInput.value = '';
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (response.ok) {
                const data = await response.json();
                addMessage(data.response);
            } else {
                addMessage('တောင်းပန်ပါတယ်၊ အချိန်အနည်းငယ်စောင့်ပြီးထပ်ကြိုးစားပေးပါ။');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('ဆက်သွယ်ရေးအမှား ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပေးပါ။');
        }
    }
    
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Initial greeting
    setTimeout(() => {
        addMessage('မင်္ဂလာပါ! Burme Mark Chat Bot မှ ကြိုဆိုပါတယ်။');
    }, 500);
});
```

8. README.md

```markdown
# Burme Mark Chat Bot

မြန်မာဘာသာစကားဖြင့် အလုပ်လုပ်သော Cloudflare Workers အခြေပြု chat bot.

## တည်ဆောက်နည်း

1. Repository ကို clone လုပ်ပါ:
```bash
git clone https://github.com/your-username/burme-mark-chatbot.git
cd burme-mark-chatbot
```

1. Dependency များထည့်သွင်းပါ:

```bash
npm install
```

1. Cloudflare Wrangler ကို configure လုပ်ပါ:

```bash
npx wrangler login
```

1. Local server ကို စတင်ပါ:

```bash
npm run dev
```

1. Deploy လုပ်ရန်:

```bash
npm run deploy
```

အသုံးပြုနည်း

· Web interface မှတစ်ဆင့်: https://burmemark-worker.mysvm.workers.dev/
· API endpoint: POST /api/chat

License

MIT License

```

## GitHub Repository တည်ဆောက်နည်း

1. GitHub သို့ ဝင်ရောက်ပြီး new repository တစ်ခုကို "burme-mark-chatbot" အမည်ဖြင့် ဖန်တီးပါ။
2. ဖော်ပြထားသော ဖိုင်များကို သင့်စက်တွင် ဖန်တီးပါ။
3. Git commands များဖြင့် repository သို့ ထည့်သွင်းပါ:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/burme-mark-chatbot.git
git push -u origin main
```

ဤကဲ့သို့ဆောင်ရွက်ပြီးပါက Cloudflare Workers ပေါ်တွင် အလုပ်လုပ်မည့် Myanmar chat bot ၏ GitHub repository ကို ရရှိပါမည်။
