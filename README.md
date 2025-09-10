# Burme Ai

An intelligent AI assistant with text and voice capabilities.

## Features

- Text-based chat with AI
- Voice input support
- Image upload and analysis
- User authentication
- Responsive design

## Project Structure
```
Burme-Ai/
├── index.html              # Loader page (splash/loading)
│
├── user/                   # User authentication pages
│   ├── login.html
│   ├── register.html
│   ├── reset.html
│   ├── css/
│   │   └── user.css
│   └── js/
│       └── user.js
│
├── pages/                  # Main application pages
│   ├── mainchat.html       # Chat UI (text + voice + image upload)
│   ├── docs.html           # Documentation / knowledge base
│   ├── setting.html        # User settings
│   ├── about.html          # About Burme Ai
│
├── assets/                 # Images, icons, fonts, sounds
│   ├── logo.png
│   └── icons/
│
├── css/                    # Global styles
│   ├── main.css
│   ├── chat.css
│   ├── docs.css
│   ├── setting.css
│   └── about.css
│
├── js/                     # Core app logic
│   ├── main.js             # entrypoint logic
│   ├── chat.js             # chat system (voice, text, image upload)
│   ├── docs.js
│   ├── setting.js
│   ├── about.js
│   └── firebase.js         # Firebase init + auth + realtime db
│
├── server/                 # Backend / Worker
│   ├── worker.js           # Cloudflare Worker API endpoint
│   └── api/                # Future expand REST endpoints
│
├── package.json
├── wrangler.toml           # Cloudflare worker config
└── README.md
```

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase project and update configuration in `