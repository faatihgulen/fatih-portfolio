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
        return jsonResponse(500, {
          answer: "I could not reach the AI service right now. Please try again in a moment."
        }, origin);
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
      return jsonResponse(500, {
        answer: "I could not reach the AI service right now. Please try again in a moment."
      }, origin);
    }
  }
};
