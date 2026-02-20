/**
 * Cloudflare Worker proxy for Gemini.
 * Endpoint example: https://<worker>.<account>.workers.dev/api/ask
 * Secrets:
 * - GEMINI_API_KEY
 * Optional vars:
 * - GEMINI_MODEL (default: gemini-1.5-flash)
 */

const ALLOWED_ORIGINS = new Set([
  "https://fatihgulen.com",
  "https://www.fatihgulen.com",
  "http://localhost:8000"
]);

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const ipBuckets = new Map();
const PROFILE_FACTS = {
  education:
    "Education: M.A. in New Media Design at University of Europe for Applied Sciences (Berlin, Germany), and B.A. in Interior Design at Mimar Sinan Fine Arts University (Istanbul, Turkey).",
  experience:
    "I have over 3 years experience: working as Freelance Experience Designer since 02/2022 (Remote, Germany), and Huawei Digital Experience Designer in Berlin (09/2022 to 09/2023).",
  uiExperience:
    "UI/UX experience includes UX flows, wireframes, interaction systems for game-like experiences, clean and readable UI layouts, and in-engine UI prototyping in Unreal Engine. Iterations were driven by playtesting and feedback from 1,200+ user interactions.",
  tools:
    "Tools include Substance, After Effects, Photoshop, Maya, Blender, Unity, Unreal Engine, VRED, TouchDesigner, ComfyUI, Alias, 3ds Max, AutoCAD, n8n, Claude, Miro, Jira, Notion, GitHub, and Figma.",
  languages:
    "Languages: German (B1), English (C1), Turkish (Native)."
};
const FALLBACK_PATTERNS = [
  {
    keywords: ["ai", "workflow", "thesis", "huawei", "unity", "vr", "ar"],
    answer:
      "AI, VR, and AR related portfolio work is available. You can ask about Unity-based immersive projects, AI workflows, or thesis-oriented work."
  },
  {
    keywords: ["ui", "ux", "hmi", "dashboard", "interface", "product"],
    answer:
      "UI/UX and HMI experience is available in the portfolio. You can ask for dashboard design, product UI cases, or interface system examples."
  },
  {
    keywords: ["game", "hud", "game ui", "interaction"],
    answer:
      "Game UI related work is available. You can ask for HUD patterns, interaction design details, and interface examples for gameplay contexts."
  },
  {
    keywords: ["visual design", "branding", "brand", "creative direction", "presentation"],
    answer:
      "Visual design and creative-direction-oriented work is included. You can ask about branding outputs, visual systems, or presentation-oriented design."
  }
];

function corsHeaders(origin) {
  const isAllowed = origin && ALLOWED_ORIGINS.has(origin);
  if (!isAllowed) return {};
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
  return bucket.count > RATE_LIMIT_MAX;
}

function readGeminiText(payload) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  if (!candidates.length) return "";
  const parts = Array.isArray(candidates[0]?.content?.parts) ? candidates[0].content.parts : [];
  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text.trim() : ""))
    .filter(Boolean)
    .join("\n");
  return text.trim();
}

function normalizeQuery(value) {
  const trMap = { "ı": "i", "ş": "s", "ğ": "g", "ü": "u", "ö": "o", "ç": "c", "İ": "i", "Ş": "s", "Ğ": "g", "Ü": "u", "Ö": "o", "Ç": "c" };
  return String(value || "")
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (ch) => trMap[ch] || ch)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFallbackAnswer(query) {
  const q = normalizeQuery(query);

  if (
    q.includes("which university") ||
    q.includes("what university") ||
    q.includes("education") ||
    q.includes("degree") ||
    q.includes("hangi universite") ||
    q.includes("hangi okul")
  ) {
    return PROFILE_FACTS.education;
  }

  if (
    q.includes("ui experience") ||
    q.includes("ux experience") ||
    q.includes("game ui experience") ||
    q.includes("interface experience")
  ) {
    return PROFILE_FACTS.uiExperience;
  }

  if (
    q.includes("experience") ||
    q.includes("work history") ||
    q.includes("career") ||
    q.includes("huawei") ||
    q.includes("freelance")
  ) {
    return PROFILE_FACTS.experience;
  }

  if (
    q.includes("years of experience") ||
    q.includes("how many years") ||
    q.includes("experience years")
  ) {
    return "Based on the timeline, experience starts in 02/2022, which is about 4 years as of 2026.";
  }

  if (
    q.includes("tools") ||
    q.includes("software") ||
    q.includes("stack") ||
    q.includes("hangi arac") ||
    q.includes("hangi program")
  ) {
    return PROFILE_FACTS.tools;
  }

  if (
    q.includes("language") ||
    q.includes("languages") ||
    q.includes("dil") ||
    q.includes("english") ||
    q.includes("german") ||
    q.includes("turkish")
  ) {
    return PROFILE_FACTS.languages;
  }

  if (q === "hi" || q === "hello" || q === "hey") {
    return "Hi. I can help you explore portfolio projects across UI/UX, AI, VR/AR, 3D, and architecture.";
  }
  let best = null;
  for (const entry of FALLBACK_PATTERNS) {
    const score = entry.keywords.reduce((acc, keyword) => (q.includes(keyword) ? acc + 1 : acc), 0);
    if (!best || score > best.score) best = { score, answer: entry.answer };
  }
  if (best && best.score > 0) return best.answer;
  return "I can help with portfolio topics like UI/UX, AI workflows, VR/AR, game UI, visual design, and project tools. Ask with a specific topic for better results.";
}

async function callGemini(model, apiKey, promptText) {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 260
      }
    })
  });
}

function isAskPath(pathname) {
  return pathname === "/" || pathname === "/api/ask";
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

    if (!isAskPath(url.pathname)) {
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
      return jsonResponse(500, { error: "Server is missing Gemini API configuration." }, origin);
    }

    let query = "";
    try {
      const body = await request.json();
      query = String(body?.query || "").trim();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON body" }, origin);
    }

    if (!query) {
      return jsonResponse(400, { error: "Query is required" }, origin);
    }

    const model = String(env.GEMINI_MODEL || "gemini-1.5-flash").trim();
    const promptText = [
      "You are a portfolio assistant for fatihgulen.com.",
      "Keep answers short and professional.",
      "Only use information implied by the portfolio query context.",
      "Do not invent personal details."
    ].join(" ") + `\n\nUser query: ${query}`;

    try {
      const geminiRes = await callGemini(model, apiKey, promptText);
      const raw = await geminiRes.text();
      if (!geminiRes.ok) {
        const reason = geminiRes.status === 429 ? "quota_limited" : "upstream_unavailable";
        return jsonResponse(200, { answer: buildFallbackAnswer(query), fallback: true, reason }, origin);
      }
      const geminiJson = raw ? JSON.parse(raw) : {};
      const answer = readGeminiText(geminiJson);
      if (!answer) {
        return jsonResponse(500, {
          answer: "I could not generate a reliable answer right now. Please try a different question."
        }, origin);
      }
      return jsonResponse(200, { answer }, origin);
    } catch {
      return jsonResponse(200, {
        answer: buildFallbackAnswer(query),
        fallback: true,
        reason: "upstream_unavailable"
      }, origin);
    }
  }
};
