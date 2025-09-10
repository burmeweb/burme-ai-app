// api/code.js
export async function handleCode(request, env, corsHeaders = {}) {
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

    const { prompt, language = "auto", complexity = "medium" } = await request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({
        error: "Bad request",
        message: "Prompt is required"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Detect language from prompt if auto
    let detectedLanguage = language;
    if (language === "auto") {
      if (prompt.toLowerCase().includes('python') || prompt.includes('py')) {
        detectedLanguage = "python";
      } else if (prompt.toLowerCase().includes('javascript') || prompt.includes('js')) {
        detectedLanguage = "javascript";
      } else if (prompt.toLowerCase().includes('html')) {
        detectedLanguage = "html";
      } else if (prompt.toLowerCase().includes('css')) {
        detectedLanguage = "css";
      } else if (prompt.toLowerCase().includes('java')) {
        detectedLanguage = "java";
      } else {
        detectedLanguage = "javascript"; // default
      }
    }

    // Code examples for different languages
    const codeExamples = {
      javascript: {
        simple: `// ${prompt}\nfunction simpleSolution() {\n  console.log("Hello, World!");\n  return "Task completed";\n}`,
        medium: `// ${prompt}\nfunction processData(input) {\n  // Validate input\n  if (!input || typeof input !== 'string') {\n    throw new Error('Invalid input');\n  }\n  \n  // Process the data\n  const result = input\n    .trim()\n    .toLowerCase()\n    .split(' ')\n    .map(word => word.charAt(0).toUpperCase() + word.slice(1))\n    .join(' ');\n  \n  return result;\n}\n\n// Example usage\n// console.log(processData("hello world")); // Output: "Hello World"`,
        complex: `// ${prompt}\nclass DataProcessor {\n  constructor(options = {}) {\n    this.options = {\n      maxRetries: 3,\n      timeout: 5000,\n      ...options\n    };\n    this.retryCount = 0;\n  }\n\n  async fetchData(url) {\n    try {\n      const response = await fetch(url, {\n        method: 'GET',\n        headers: {\n          'Content-Type': 'application/json',\n        },\n        timeout: this.options.timeout\n      });\n\n      if (!response.ok) {\n        throw new Error(\`HTTP error! status: \${response.status}\`);\n      }\n\n      const data = await response.json();\n      return this.transformData(data);\n    } catch (error) {\n      if (this.retryCount < this.options.maxRetries) {\n        this.retryCount++;\n        console.log(\`Retry attempt \${this.retryCount}\`);\n        return this.fetchData(url);\n      }\n      throw error;\n    }\n  }\n\n  transformData(data) {\n    // Complex data transformation logic\n    return Object.entries(data)\n      .filter(([key, value]) => value !== null && value !== undefined)\n      .reduce((acc, [key, value]) => ({\n        ...acc,\n        [key]: typeof value === 'string' ? value.trim() : value\n      }), {});\n  }\n}`
      },
      python: {
        simple: `# ${prompt}\ndef simple_solution():\n    print("Hello, World!")\n    return "Task completed"`,
        medium: `# ${prompt}\ndef process_data(input_str):\n    \"\"\"Process input string and return formatted result\"\"\"\n    if not input_str or not isinstance(input_str, str):\n        raise ValueError("Invalid input")\n    \n    # Process the data\n    result = (\n        input_str.strip()\n        .lower()\n        .title()\n    )\n    \n    return result\n\n# Example usage\n# print(process_data("hello world"))  # Output: "Hello World"`,
        complex: `# ${prompt}\nimport asyncio\nimport aiohttp\nfrom typing import Dict, Any, Optional\n\nclass DataProcessor:\n    def __init__(self, options: Optional[Dict] = None):\n        self.options = {\n            'max_retries': 3,\n            'timeout': 5.0,\n            **(options or {})\n        }\n        self.retry_count = 0\n\n    async def fetch_data(self, url: str) -> Dict[str, Any]:\n        \"\"\"Fetch and process data from URL with retry mechanism\"\"\"\n        try:\n            timeout = aiohttp.ClientTimeout(total=self.options['timeout'])\n            async with aiohttp.ClientSession(timeout=timeout) as session:\n                async with session.get(url) as response:\n                    if response.status != 200:\n                        raise Exception(f"HTTP error! status: {response.status}")\n                    \n                    data = await response.json()\n                    return self.transform_data(data)\n                    \n        except Exception as e:\n            if self.retry_count < self.options['max_retries']:\n                self.retry_count += 1\n                print(f"Retry attempt {self.retry_count}")\n                return await self.fetch_data(url)\n            raise e\n\n    def transform_data(self, data: Dict[str, Any]) -> Dict[str, Any]:\n        \"\"\"Transform data by filtering and cleaning values\"\"\"\n        return {\n            key: value.strip() if isinstance(value, str) else value\n            for key, value in data.items()\n            if value is not None\n        }`
      },
      html: {
        simple: `<!-- ${prompt} -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Simple Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <p>Welcome to our website</p>\n</body>\n</html>`,
        medium: `<!-- ${prompt} -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Responsive Page</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 0;\n            padding: 20px;\n            background-color: #f4f4f4;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            padding: 20px;\n            border-radius: 8px;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n        }\n        @media (max-width: 600px) {\n            .container {\n                padding: 15px;\n                margin: 10px;\n            }\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>Welcome to Our Platform</h1>\n        <p>This is a responsive HTML page template.</p>\n    </div>\n</body>\n</html>`,
        complex: `<!-- ${prompt} -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Advanced Web App</title>\n    <style>\n        :root {\n            --primary-color: #2563eb;\n            --secondary-color: #64748b;\n            --accent-color: #f59e0b;\n        }\n        \n        * {\n            margin: 0;\n            padding: 0;\n            box-sizing: border-box;\n        }\n        \n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            color: #333;\n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            min-height: 100vh;\n        }\n        \n        .app-container {\n            max-width: 1200px;\n            margin: 0 auto;\n            padding: 20px;\n        }\n        \n        .card {\n            background: rgba(255, 255, 255, 0.95);\n            backdrop-filter: blur(10px);\n            border-radius: 16px;\n            padding: 30px;\n            margin: 20px 0;\n            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);\n            border: 1px solid rgba(255, 255, 255, 0.2);\n        }\n        \n        @media (max-width: 768px) {\n            .app-container {\n                padding: 10px;\n            }\n            \n            .card {\n                padding: 20px;\n                margin: 10px 0;\n            }\n        }\n    </style>\n</head>\n<body>\n    <div class="app-container">\n        <div class="card">\n            <h1>Advanced Web Application</h1>\n            <p>This is a complex HTML template with modern CSS features.</p>\n        </div>\n    </div>\n\n    <script>\n        // Modern JavaScript functionality would go here\n        console.log('Application loaded successfully');\n        \n        // Example: Theme switcher, API calls, etc.\n    </script>\n</body>\n</html>`
      }
    };

    // Get appropriate code based on language and complexity
    const codeTemplate = codeExamples[detectedLanguage]?.[complexity] || 
                        codeExamples[detectedLanguage]?.medium || 
                        codeExamples.javascript.medium;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return new Response(JSON.stringify({
      code: codeTemplate,
      language: detectedLanguage,
      complexity: complexity,
      prompt: prompt,
      app: env.APP_NAME || "Burme Mark AI",
      timestamp: new Date().toISOString(),
      documentation: "Remember to test and modify the code according to your specific requirements",
      tips: [
        "In production, integrate with real code generation APIs like OpenAI Codex, GitHub Copilot, or similar services",
        "Always review and test generated code before using in production",
        "Consider adding syntax highlighting and code formatting for better readability"
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to process code request",
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
