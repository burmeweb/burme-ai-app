// api/code.js
export async function handleCode(request, env, corsHeaders = {}) {
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

    const { prompt, language = "javascript" } = await request.json();
    
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
              content: `You are an expert ${language} programmer. Generate clean, efficient code based on the user's request. Return only the code without explanations.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
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
      const generatedCode = openaiData.choices[0].message.content;
      
      return new Response(JSON.stringify({
        code: generatedCode,
        language: language,
        prompt: prompt,
        app: env.APP_NAME || "Burme Mark AI",
        timestamp: new Date().toISOString(),
        source: 'openai'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (openaiError) {
      // Fallback to simple code templates
      console.log('OpenAI failed, using fallback:', openaiError.message);
      
      const codeTemplates = {
        javascript: `// ${prompt}\nfunction solution() {\n  // Your code here\n  console.log("Hello, World!");\n  return "Task completed";\n}\n\n// Usage:\n// solution();`,
        python: `# ${prompt}\ndef solution():\n    # Your code here\n    print("Hello, World!")\n    return "Task completed"\n\n# Usage:\n# solution()`,
        html: `<!-- ${prompt} -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Solution</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <!-- Your HTML content here -->\n</body>\n</html>`,
        css: `/* ${prompt} */\n.container {\n    /* Your CSS styles here */\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 20px;\n}\n\n.element {\n    color: #333;\n    font-size: 16px;\n}`
      };

      const template = codeTemplates[language] || codeTemplates.javascript;
      
      return new Response(JSON.stringify({
        code: template,
        language: language,
        prompt: prompt,
        app: env.APP_NAME || "Burme Mark AI",
        timestamp: new Date().toISOString(),
        source: 'fallback',
        note: 'Using template code due to API limitations'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    console.error('Code generation error:', error);
    return new Response(JSON.stringify({
      error: "Failed to process code request",
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
