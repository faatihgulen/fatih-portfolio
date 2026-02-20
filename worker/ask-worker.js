/**
 * Cloudflare Worker proxy for Gemini.
 * Route example: https://api.fatihgulen.com/api/ask
 * Secrets:
 * - GEMINI_API_KEY
 * Optional vars:
 * - GEMINI_MODEL (default: gemini-2.0-flash)
 */

const ALLOWED_ORIGINS = new Set([
  "https://fatihgulen.com",
  "https://www.fatihgulen.com"
]);
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const ipBuckets = new Map();

function corsHeaders(origin) {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function jsonResponse(status, payload, origin) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(origin)
    }
  });
}

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) return true;
  return false;
}

function readGeminiText(payload) {
  const candidates = payload && Array.isArray(payload.candidates) ? payload.candidates : [];
  if (!candidates.length) return "";
  const parts = candidates[0] && candidates[0].content && Array.isArray(candidates[0].content.parts)
    ? candidates[0].content.parts
    : [];
  const textPart = parts.find(part => typeof part.text === "string");
  return textPart ? textPart.text.trim() : "";
}

function buildQuotaFallback(query) {
  const q = String(query || "").toLowerCase();
  if (["hi", "hello", "hey"].includes(q)) {
    return "Hi, I'm Fatih. I’m a Real-Time Experience designer focused on UI/UX, real-time 3D, VR/AR and AI-driven workflows. You can ask about my projects, tools I use, experience, or how to contact me.";
  }
  if (q.includes("vr")) {
    return "For VR/AR, you can explore Huawei VR related projects and immersive interaction work in the portfolio.";
  }
  if (q.includes("ai")) {
  return "I actively integrate AI into my workflow, including generative pipelines, LoRA training, and AI-assisted content creation. My focus is not just using AI tools, but building structured workflows that improve design efficiency and creative control.";
  }
  if (q.includes("3d")) {
  return "My 3D work combines real-time rendering, asset optimization and visual storytelling. I work with Blender and Unreal Engine, producing game-ready assets and interactive scenes with attention to performance and detail.";
  }
  if (q.includes("experience") || q.includes("year")) {
  return "I have over 3 years of professional experience in game production and immersive design, including VR/AR development and cross-functional teamwork in international environments.";
  }
  if (q.includes("architecture") || q.includes("architectural")) {
  return "My architectural work focuses on visualization and spatial storytelling. With a background in Interior Design, I create photorealistic renders and real-time walkthrough experiences using Blender and Unreal Engine. Projects include residential visualizations and immersive presentation environments.";
  }
  if (q.includes("interior") || q.includes("interior design") || q.includes("Interior")) {
  return "I hold a Bachelor's degree in Interior Design and have worked on VR-based interior visualization projects. My approach combines spatial composition, material realism and lighting design to create immersive and client-ready presentation scenes.";
  }
  if (q.includes("ui") || q.includes("ux")) {
    return "For UI/UX, start with AERONIX, GroceryMate, Hipicon, and Resorsus projects.";
  }
  if (q.includes("contact")) {
    return "You can reach me through the contact section of this website, via LinkedIn, or directly by email. I’m open to collaborations, design roles and innovative AI-driven projects.";
  }
  return "Live AI may be temporarily limited, but I can still guide you. Try asking about UI/UX projects, VR/AR work, AI workflows, 3D production, tools I use, or how to get in touch.";
}

async function callGeminiWithModel(model, apiKey, promptText) {
  return fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: promptText
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 420
        }
      })
    }
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse(403, { error: "Origin not allowed" }, origin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname !== "/api/ask") {
      return jsonResponse(404, { error: "Not found" }, origin);
    }

    if (request.method !== "POST") {
      return jsonResponse(405, { error: "Method not allowed" }, origin);
    }

    if (isRateLimited(ip)) {
      return jsonResponse(429, { error: "Too many requests" }, origin);
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonResponse(500, { error: "Missing GEMINI_API_KEY" }, origin);
    }

    let query = "";
    try {
      const body = await request.json();
      query = String(body.query || "").trim();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON body" }, origin);
    }

    if (!query) {
      return jsonResponse(400, { error: "Query is required" }, origin);
    }

    const requestedModel = env.GEMINI_MODEL || "gemini-2.0-flash";
    const fallbackModels = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];
    const modelCandidates = [requestedModel].concat(fallbackModels.filter((m) => m !== requestedModel));
    const systemPrompt = [
      "You are a concise assistant for fatihgulen.com portfolio.",
      "Write concise but slightly detailed answers in 3 to 5 sentences when possible.",
      "Only answer based on public portfolio context in the user query.",
      "Do not invent private personal facts.",
      "If unknown, say briefly that the site does not specify and suggest asking about UI/UX, 3D, AI, VR/AR, or Architecture."
    ].join(" ");
    const promptText = systemPrompt + "\n\nUser question: " + query;
    let geminiRes = null;
    let lastErrorBody = "";
    for (const model of modelCandidates) {
      geminiRes = await callGeminiWithModel(model, apiKey, promptText);
      if (geminiRes.ok) break;
      lastErrorBody = await geminiRes.text();
      if (geminiRes.status !== 404) break;
    }

    if (!geminiRes || !geminiRes.ok) {
      const isQuotaLimited =
        (geminiRes && geminiRes.status === 429) ||
        /RESOURCE_EXHAUSTED|quota/i.test(String(lastErrorBody || ""));
      if (isQuotaLimited) {
        return jsonResponse(200, { answer: buildQuotaFallback(query), fallback: true, reason: "quota_limited" }, origin);
      }
      const detail = lastErrorBody || (geminiRes ? await geminiRes.text() : "No response");
      return jsonResponse(502, { error: "Gemini upstream error", detail }, origin);
    }

    const geminiJson = await geminiRes.json();
    const answer = readGeminiText(geminiJson);
    if (!answer) {
      return jsonResponse(200, { answer: "I could not find a confident answer from the model right now." }, origin);
    }

    return jsonResponse(200, { answer }, origin);
  }
};
