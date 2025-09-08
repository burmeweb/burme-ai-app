export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Router
    if (url.pathname === "/api/chat") {
      return handleChat(request, env);
    } else if (url.pathname === "/api/text-generate") {
      return handleText(request, env);
    } else if (url.pathname === "/api/image-generate") {
      return handleImage(request, env);
    } else if (url.pathname === "/api/coder") {
      return handleCoder(request, env);
    } else if (url.pathname === "/api/docs") {
      return handleDocs(request, env);
    }

    return new Response(JSON.stringify({ message: "BurmeMark Worker running" }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};

/* -------- Chat (gpt model) ---------- */
async function handleChat(request, env) {
  const { messages } = await request.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
    }),
  });

  return response;
}

/* -------- Text Generate ---------- */
async function handleText(request, env) {
  const { prompt } = await request.json();

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      prompt,
      max_tokens: 200,
    }),
  });

  return response;
}

/* -------- Image Generate ---------- */
async function handleImage(request, env) {
  const { prompt } = await request.json();

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "512x512",
    }),
  });

  return response;
}

/* -------- Coder ---------- */
async function handleCoder(request, env) {
  const { codePrompt } = await request.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: codePrompt }],
    }),
  });

  return response;
}

/* -------- Docs / Summarizer ---------- */
async function handleDocs(request, env) {
  const { text } = await request.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful document assistant." },
        { role: "user", content: `Summarize or explain this: ${text}` },
      ],
    }),
  });

  return response;
}
