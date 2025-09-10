export default {
  async fetch(request, env, ctx) {
    try {
      // Environment variable ကို env မှာ ခေါ်သုံးရမယ်
      const appName = env.APP_NAME || "Burme Mark AI";

      // Basic response ပြန်ပေး
      return new Response(
        JSON.stringify({
          message: `Hello from ${appName}`,
          status: "success"
        }),
        {
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: err.message,
          status: "failed"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};
