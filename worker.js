export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const body = request.method === "POST" ? await request.json() : {};

      // AI Chat (OpenAI)
      if (url.pathname === "/chat") {
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: body.messages,
          }),
        });
        const data = await aiResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Image Generation (Stability AI)
      if (url.pathname === "/image") {
        const aiResponse = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-512-v2-1/text-to-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.STABILITY_KEY}`,
          },
          body: JSON.stringify({
            text_prompts: [{ text: body.prompt }],
            cfg_scale: 7,
            height: 512,
            width: 512,
            samples: 1,
          }),
        });
        const data = await aiResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response("Burme AI Worker running. Use /chat or /image", {
        headers: { "Content-Type": "text/plain", ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Server Error" }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
