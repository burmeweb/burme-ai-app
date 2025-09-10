// worker.js
export default {
  async fetch(request, env, ctx) {
    try {
      const appName = env.APP_NAME || "Burme Mark AI";
      const githubRepo = "https://github.com/burmeweb/burme-ai-app";
      
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return handleOptions();
      }
      
      // Handle different endpoints
      if (path === '/chat' && request.method === 'POST') {
        return handleChat(request, env, githubRepo);
      } else if (path === '/image' && request.method === 'POST') {
        return handleImage(request, env, githubRepo);
      } else if (path === '/generate-image' && request.method === 'POST') {
        return handleStabilityAI(request, env, githubRepo);
      } else if (path === '/assistants/create' && request.method === 'POST') {
        return handleCreateAssistant(request, env, githubRepo);
      } else if (path === '/assistants/chat' && request.method === 'POST') {
        return handleAssistantChat(request, env, githubRepo);
      } else if (path === '/info' && request.method === 'GET') {
        return handleInfo(request, env, githubRepo);
      } else {
        // Default response with GitHub link
        return new Response(
          JSON.stringify({
            app: appName,
            github_repository: githubRepo,
            endpoints: {
              chat: '/chat (POST)',
              image: '/image (POST)',
              generate_image: '/generate-image (POST)',
              create_assistant: '/assistants/create (POST)',
              assistant_chat: '/assistants/chat (POST)',
              info: '/info (GET)'
            },
            message: "Burme AI Application Worker with OpenAI Assistants and Stability AI Integration"
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error.message,
          github_repository: "https://github.com/burmeweb/burme-ai-app"
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  }
};

function handleOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

async function handleChat(request, env, githubRepo) {
  try {
    const { message } = await request.json();
    const appName = env.APP_NAME || "Burme Mark AI";

    return new Response(
      JSON.stringify({
        response: `This is a response to: ${message}`,
        app: appName,
        github_repository: githubRepo,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Invalid request format",
        github_repository: githubRepo
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

async function handleImage(request, env, githubRepo) {
  try {
    const { prompt } = await request.json();
    const appName = env.APP_NAME || "Burme Mark AI";

    return new Response(
      JSON.stringify({
        image_url: `https://example.com/generated-image.png?prompt=${encodeURIComponent(prompt)}`,
        app: appName,
        github_repository: githubRepo,
        prompt: prompt,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Invalid request format",
        github_repository: githubRepo
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

async function handleStabilityAI(request, env, githubRepo) {
  try {
    const { prompt, output_format = "webp" } = await request.json();
    const appName = env.APP_NAME || "Burme Mark AI";
    
    const STABILITY_API_KEY = env.STABILITY_API_KEY;
    
    if (!STABILITY_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Stability AI API key not configured",
          github_repository: githubRepo
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({
          error: "Prompt is required",
          github_repository: githubRepo
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', output_format);

    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/ultra',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'image/*',
        },
      }
    );

    if (response.status === 200) {
      const imageData = await response.arrayBuffer();
      const base64Image = arrayBufferToBase64(imageData);
      
      return new Response(
        JSON.stringify({
          success: true,
          image: `data:image/${output_format};base64,${base64Image}`,
          format: output_format,
          prompt: prompt,
          app: appName,
          github_repository: githubRepo,
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    } else {
      const errorData = await response.text();
      throw new Error(`${response.status}: ${errorData}`);
    }

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Image generation failed",
        message: error.message,
        github_repository: githubRepo
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

async function handleCreateAssistant(request, env, githubRepo) {
  try {
    const { instructions, name, tools, model } = await request.json();
    const appName = env.APP_NAME || "Burme Mark AI";
    
    const OPENAI_API_KEY = env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
          github_repository: githubRepo
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Create OpenAI client
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const assistant = await openai.beta.assistants.create({
      instructions: instructions || "You are a helpful assistant.",
      name: name || "AI Assistant",
      tools: tools || [{ type: "code_interpreter" }],
      model: model || "gpt-4o",
    });

    return new Response(
      JSON.stringify({
        success: true,
        assistant: assistant,
        app: appName,
        github_repository: githubRepo,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create assistant",
        message: error.message,
        github_repository: githubRepo
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

async function handleAssistantChat(request, env, githubRepo) {
  try {
    const { message, assistant_id, thread_id } = await request.json();
    const appName = env.APP_NAME || "Burme Mark AI";
    
    const OPENAI_API_KEY = env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
          github_repository: githubRepo
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({
          error: "Message is required",
          github_repository: githubRepo
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    let currentThreadId = thread_id;
    
    // Create new thread if no thread_id provided
    if (!currentThreadId) {
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
    }

    // Add message to thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: message
    });

    // Create run
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: assistant_id || "asst_default" // You might want to set a default assistant ID
    });

    // Wait for run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
    
    while (runStatus.status === "queued" || runStatus.status === "in_progress") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
    }

    if (runStatus.status === "completed") {
      // Get messages
      const messages = await openai.beta.threads.messages.list(currentThreadId);
      
      // Get the latest assistant message
      const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
      const latestMessage = assistantMessages[0];
      
      return new Response(
        JSON.stringify({
          success: true,
          response: latestMessage.content[0].text.value,
          thread_id: currentThreadId,
          run_id: run.id,
          app: appName,
          github_repository: githubRepo,
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    } else {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Assistant chat failed",
        message: error.message,
        github_repository: githubRepo
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

async function handleInfo(request, env, githubRepo) {
  const appName = env.APP_NAME || "Burme Mark AI";
  
  return new Response(
    JSON.stringify({
      app_name: appName,
      github_repository: githubRepo,
      description: "Burme AI Application - Chat, Image Generation, and OpenAI Assistants Service",
      version: "1.1.0",
      endpoints: {
        chat: {
          path: "/chat",
          method: "POST",
          description: "Handle simple chat messages"
        },
        image: {
          path: "/image",
          method: "POST",
          description: "Generate images from prompts (legacy)"
        },
        generate_image: {
          path: "/generate-image",
          method: "POST",
          description: "Generate images using Stability AI"
        },
        create_assistant: {
          path: "/assistants/create",
          method: "POST",
          description: "Create a new OpenAI assistant"
        },
        assistant_chat: {
          path: "/assistants/chat",
          method: "POST",
          description: "Chat with an OpenAI assistant"
        },
        info: {
          path: "/info",
          method: "GET",
          description: "Get application information"
        }
      },
      documentation: `${githubRepo}/blob/main/README.md`,
      features: [
        "Chat functionality",
        "Stability AI image generation",
        "OpenAI Assistants integration",
        "Code interpreter capabilities",
        "Thread management"
      ]
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// OpenAI class implementation for Cloudflare Workers
class OpenAI {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async beta() {
    return {
      assistants: {
        create: async (params) => {
          return this.request('/assistants', {
            method: 'POST',
            body: JSON.stringify(params)
          });
        }
      },
      threads: {
        create: async () => {
          return this.request('/threads', {
            method: 'POST'
          });
        },
        messages: {
          create: async (threadId, params) => {
            return this.request(`/threads/${threadId}/messages`, {
              method: 'POST',
              body: JSON.stringify(params)
            });
          },
          list: async (threadId) => {
            return this.request(`/threads/${threadId}/messages`);
          }
        },
        runs: {
          create: async (threadId, params) => {
            return this.request(`/threads/${threadId}/runs`, {
              method: 'POST',
              body: JSON.stringify(params)
            });
          },
          retrieve: async (threadId, runId) => {
            return this.request(`/threads/${threadId}/runs/${runId}`);
          }
        }
      }
    };
  }
          }
