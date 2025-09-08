# Burme Mark App

# Project Structure 
```
burme-mark-app/
├── index.html                  # Main landing page or loader
├── favicon.png                 # Favicon
├── assets/
│   ├── logo.png                # App logo
│   ├── background.svg          # Chat background
│   └── animations/             # Optional: animation assets
├── css/
│   ├── main.css                # Global styles & animations
│   ├── navbar.css              # Navbar styles
│   └── pages/                  # Page-specific CSS
│       ├── mainchat.css
│       ├── text_generate.css
│       ├── image_generate.css
│       ├── coder.css
│       ├── preview.css
│       └── docs.css
├── js/
│   ├── main.js                 # Global JS
│   ├── navbar.js               # Navbar functionality
│   └── pages/                  # Page-specific JS
│       ├── mainchat.js
│       ├── text_generate.js
│       ├── image_generate.js
│       ├── coder.js
│       ├── preview.js
│       └── docs.js
├── pages/
│   ├── mainchat.html
│   ├── text_generate.html
│   ├── image_generate.html
│   ├── coder.html
│   ├── preview.html
│   └── docs.html
├── worker/
│   └── burmemark-worker.js     # Cloudflare Worker entry point
├── README.md                   # Project description & usage
├── .gitignore                  # Node modules, build files, etc.
└── package.json                # Optional if Node.js scripts used
```
# 
