export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      return handleChat(request, env);
    }

    return new Response(JSON.stringify({ 
      message: "BurmeMark Worker (GitHub Models API)", 
      status: "ok" 
    }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};

/* -------- Chat with GitHub Models ---------- */
async function handleChat(request, env) {
  try {
    const { messages } = await request.json();

    const response = await fetch("https://models.github.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.MODLES_TOKEN}`,  // GitHub PAT
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
        max_tokens: 1024,
        temperature: 1,
        top_p: 1
      }),
    });

    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
