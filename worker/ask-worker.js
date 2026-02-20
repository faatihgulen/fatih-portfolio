/**
 * Cloudflare Worker proxy for OpenAI Responses API.
 * Endpoint example: https://<worker>.<account>.workers.dev/api/ask
 * Secrets:
 * - OPENAI_API_KEY
 * Optional vars:
 * - OPENAI_MODEL (default: gpt-4.1-mini)
 */

const ALLOWED_ORIGINS = new Set([
  "https://fatihgulen.com",
  "https://www.fatihgulen.com",
  "http://localhost:8000",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
]);

const ALLOWED_ORIGIN_SUFFIXES = [
  ".fatihgulen-53.workers.dev",
  ".pages.dev"
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;

  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== "https:") return false;
    return ALLOWED_ORIGIN_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

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
  const isAllowed = isAllowedOrigin(origin);
  if (!isAllowed) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
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

function readOpenAIText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const chunks = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const block of content) {
      if (block?.type === "output_text" && typeof block?.text === "string") {
        chunks.push(block.text.trim());
      }
    }
  }

  return chunks.filter(Boolean).join("\n").trim();
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

async function callOpenAI(model, apiKey, promptText) {
  return fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: promptText,
      temperature: 0.25,
      max_output_tokens: 260
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

    if (origin && !isAllowedOrigin(origin)) {
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

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonResponse(500, { error: "Server is missing OpenAI API configuration." }, origin);
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

    if (query === "__status_ping__") {
      try {
        const healthRes = await fetch("https://api.openai.com/v1/models?limit=1", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        });
        if (!healthRes.ok) {
          const reason = healthRes.status === 429
            ? "quota_limited"
            : (healthRes.status === 401 || healthRes.status === 403)
              ? "auth_invalid"
              : "upstream_unavailable";
          return jsonResponse(200, {
            answer: "",
            fallback: true,
            reason,
            upstream_status: healthRes.status
          }, origin);
        }
        return jsonResponse(200, { answer: "ok", fallback: false, reason: "" }, origin);
      } catch {
        return jsonResponse(200, {
          answer: "",
          fallback: true,
          reason: "upstream_unavailable"
        }, origin);
      }
    }

    const model = String(env.OPENAI_MODEL || "gpt-4.1-mini").trim();
    const promptText = [
      "You are the portfolio assistant for fatihgulen.com.",
      "Answer in the same language as the user query.",
      "Be concise but specific. Avoid generic marketing phrasing.",
      "Use only verified facts below. If the user asks outside these facts, say it briefly and offer related portfolio topics.",
      "Do not invent personal details, project names, dates, or tools.",
      "",
      "Verified facts:",
      `- ${PROFILE_FACTS.education}`,
      `- ${PROFILE_FACTS.experience}`,
      `- ${PROFILE_FACTS.uiExperience}`,
      `- ${PROFILE_FACTS.tools}`,
      `- ${PROFILE_FACTS.languages}`
    ].join("\n") + `\n\nUser query: ${query}`;

    try {
      const openaiRes = await callOpenAI(model, apiKey, promptText);
      const raw = await openaiRes.text();
      if (!openaiRes.ok) {
        const reason = openaiRes.status === 429
          ? "quota_limited"
          : (openaiRes.status === 401 || openaiRes.status === 403)
            ? "auth_invalid"
            : "upstream_unavailable";
        console.log(JSON.stringify({
          event: "openai_fallback",
          status: openaiRes.status,
          reason
        }));
        return jsonResponse(200, {
          answer: buildFallbackAnswer(query),
          fallback: true,
          reason,
          upstream_status: openaiRes.status
        }, origin);
      }

      const openaiJson = raw ? JSON.parse(raw) : {};
      const answer = readOpenAIText(openaiJson);
      if (!answer) {
        return jsonResponse(500, {
          answer: "I could not generate a reliable answer right now. Please try a different question."
        }, origin);
      }

      return jsonResponse(200, { answer }, origin);
    } catch (err) {
      console.log(JSON.stringify({
        event: "openai_exception",
        reason: "upstream_unavailable",
        message: err && err.message ? String(err.message) : "unknown"
      }));
      return jsonResponse(200, {
        answer: buildFallbackAnswer(query),
        fallback: true,
        reason: "upstream_unavailable"
      }, origin);
    }
  }
};
