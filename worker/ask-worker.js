/**
 * Cloudflare Worker proxy for OpenAI Responses API.
 * Endpoint example: https://<worker>.<account>.workers.dev/api/ask
 * Secrets:
 * - OPENAI_API_KEY
 * Optional vars:
 * - OPENAI_MODEL (default: gpt-5.4)
 * - ALLOWED_ORIGIN_SUFFIXES (comma-separated, default: .fatihgulen-53.workers.dev)
 */

import profileMarkdown from "./profile.md";

const ALLOWED_ORIGINS = new Set([
  "https://fatihgulen.com",
  "https://www.fatihgulen.com",
  "https://www.linkedin.com/in/faatihgulen",
  "http://localhost:8000",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
]);

const DEFAULT_ALLOWED_ORIGIN_SUFFIXES = [
  ".fatihgulen-53.workers.dev"
];

function getAllowedOriginSuffixes(env) {
  const raw = String(env?.ALLOWED_ORIGIN_SUFFIXES || "").trim();
  if (!raw) return DEFAULT_ALLOWED_ORIGIN_SUFFIXES;
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedOrigin(origin, allowedOriginSuffixes = DEFAULT_ALLOWED_ORIGIN_SUFFIXES) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;

  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== "https:") return false;
    const normalizedHostname = hostname.toLowerCase();
    return allowedOriginSuffixes.some((suffix) => normalizedHostname.endsWith(suffix));
  } catch {
    return false;
  }
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;
const ipBuckets = new Map();
const PROFILE_DOCUMENT = String(profileMarkdown || "").trim();
const PROFILE_FACTS = {
  identity:
    "Fatih G\u00fclen is a Digital Experience Designer based in Germany, in the Frankfurt area.",
  experienceYears:
    "Experience level: 3+ years of professional experience in game-adjacent and real-time production environments.",
  contact:
    "Contact details: Email faatihgulen@gmail.com, phone +49 17637160838, LinkedIn https://www.linkedin.com/in/faatihgulen.",
  education:
    "Education: Bachelor's degree in Interior Architecture in Turkey, and a Master's degree in New Media Design in Berlin, Germany.",
  profile:
    "Professional profile: a hybrid background across UI/UX design, real-time and interactive design, 3D visualization, motion design, and AI-assisted creative production.",
  focusAreas:
    "Focus areas: clear, functional, and visually strong digital experiences, especially for interactive systems, data-driven interfaces, and immersive VR/AR environments.",
  qualityLevel:
    "Creative quality: developed high-quality real-time and interactive visual experiences aligned with industry-level visual standards, including AAA-style and production-ready pipelines.",
  showcaseWork:
    "Showcase and presentation work: created projects suitable for digital showcases, exhibition environments, interactive installations, and presentation-ready visual experiences.",
  storytelling:
    "Work qualities: strong visual storytelling, user engagement, and a confident use of emerging technologies, especially AI combined with real-time workflows.",
  experience:
    "Work experience highlights: worked as a Game Designer at Huawei R&D, created 2D and 3D assets for VR experiences, built UI elements and game scenes, and used Blender, Figma, and Jira in team workflows. Freelance work includes VR interior design, motion design, visual content, and client work across different design fields.",
  tools:
    "Design and creative tools: Figma, Adobe Creative Suite including Photoshop, Illustrator, After Effects, and Premiere, plus Blender, Maya, 3ds Max, and Substance.",
  realTime:
    "Real-time and interactive tools: Unreal Engine with Blueprints and UMG, and Unity at a basic level.",
  prototyping:
    "Interactive expertise: interactive experience prototyping, real-time and offline rendering pipelines, and presentation-ready interactive visuals.",
  vrProjects:
    "VR and AR project examples in the portfolio: Huawei VR - Racket Training, a Unity-based VR training simulation with spatial UI, gesture tracking, and immersive training environments; Huawei VR - Unity Environments, focused on spatial interaction design and immersive scene building for a Huawei training platform; Gaze Garden - AR Tiktok Project, an AR effect project created for TikTok; and the AI Thesis - Research Project, a hybrid AI and interactive experience built with OpenAI API, Unity, Hanyuan3D, and C#.",
  aiTools:
    "AI tools and workflows: Midjourney, Flux, Ideogram, ComfyUI including ControlNet, OpenPose, and LoRA workflows, plus image-to-video tools such as Sora, VEO, and Wan AI.",
  languages:
    "Languages: English at an Fluent level, Turkish native, and German at intermediate B1 level and improving.",
  strengths:
    "Strengths: strong team coordination and collaboration, translating complex ideas into clear visuals, learning new tools quickly, combining design, technology, and storytelling, and being punctual and reliable.",
  industryAlignment:
    "Industry alignment: the work quality fits exhibition-ready and curated digital experiences, and aligns with visual standards often associated with the Adobe Substance ecosystem and real-time design communities.",
  careerFocus:
    "Career focus: actively seeking roles in UI/UX design, product design, real-time or interactive design, and AI-driven creative work, with strong interest in automotive UI and HMI, data-driven interfaces, AI plus design integration, and digital product experiences."
};
const FALLBACK_PATTERNS = [
  {
    keywords: ["ai", "workflow", "comfyui", "midjourney", "flux", "ideogram", "sora", "veo", "wan ai"],
    answer:
      "AI-assisted creative production is part of Fatih's profile. You can ask about ComfyUI workflows, generative image pipelines, image-to-video tools, or AI plus design integration."
  },
  {
    keywords: ["ui", "ux", "hmi", "dashboard", "interface", "product", "automotive"],
    answer:
      "UI/UX, product design, and HMI are core focus areas. You can ask about dashboard interfaces, automotive UI, data-driven experiences, or interface systems."
  },
  {
    keywords: ["game", "hud", "game ui", "interaction", "unreal", "blueprint", "umg"],
    answer:
      "Fatih has real-time and interactive design experience, including game-scene work, UI elements, and Unreal-focused workflows. You can ask about VR scenes, interaction design, or interface implementation."
  },
  {
    keywords: ["visual design", "branding", "brand", "creative direction", "presentation", "motion design", "3d"],
    answer:
      "Visual design, motion, and 3D visualization are all part of the profile. You can ask about visual storytelling, motion content, or 3D-driven presentation work."
  }
];

function corsHeaders(origin, allowedOriginSuffixes = DEFAULT_ALLOWED_ORIGIN_SUFFIXES) {
  const isAllowed = isAllowedOrigin(origin, allowedOriginSuffixes);
  if (!isAllowed) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

function jsonResponse(status, payload, origin, allowedOriginSuffixes = DEFAULT_ALLOWED_ORIGIN_SUFFIXES) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(origin, allowedOriginSuffixes)
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
    q.includes("contact") ||
    q.includes("contact details") ||
    q.includes("email") ||
    q.includes("mail") ||
    q.includes("linkedin") ||
    q.includes("phone") ||
    q.includes("reach")
  ) {
    return `${PROFILE_FACTS.identity} ${PROFILE_FACTS.contact}`;
  }

  if (
    q.includes("who is fatih") ||
    q.includes("about fatih") ||
    q.includes("tell me about fatih") ||
    q.includes("fatih profile") ||
    q === "fatih"
  ) {
    return `${PROFILE_FACTS.identity} ${PROFILE_FACTS.profile} ${PROFILE_FACTS.focusAreas} ${PROFILE_FACTS.careerFocus}`;
  }

  if (
    q.includes("location") ||
    q.includes("where is fatih based") ||
    q.includes("based in") ||
    q.includes("frankfurt")
  ) {
    return PROFILE_FACTS.identity;
  }

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
    q.includes("strength") ||
    q.includes("strengths") ||
    q.includes("soft skills") ||
    q.includes("teamwork") ||
    q.includes("collaboration")
  ) {
    return PROFILE_FACTS.strengths;
  }

  if (
    q.includes("looking for") ||
    q.includes("open to work") ||
    q.includes("career focus") ||
    q.includes("what roles") ||
    q.includes("job") ||
    q.includes("seeking roles")
  ) {
    return PROFILE_FACTS.careerFocus;
  }

  if (
    q.includes("show vr projects") ||
    q.includes("vr projects") ||
    q.includes("vr project") ||
    q.includes("ar projects") ||
    q.includes("ar project") ||
    q.includes("virtual reality") ||
    q.includes("augmented reality") ||
    q.includes("immersive environment") ||
    q.includes("immersive environments")
  ) {
    return PROFILE_FACTS.vrProjects;
  }

  if (
    q.includes("ui experience") ||
    q.includes("ux experience") ||
    q.includes("game ui experience") ||
    q.includes("interface experience") ||
    q.includes("interactive design") ||
    q.includes("real time")
  ) {
    return `${PROFILE_FACTS.profile} ${PROFILE_FACTS.focusAreas}`;
  }

  if (
    q.includes("experience") ||
    q.includes("work history") ||
    q.includes("career") ||
    q.includes("huawei") ||
    q.includes("freelance") ||
    q.includes("game designer")
  ) {
    return PROFILE_FACTS.experience;
  }

  if (
    q.includes("years of experience") ||
    q.includes("how many years") ||
    q.includes("experience years")
  ) {
    return "Fatih has 3+ years of professional experience, especially across game-adjacent, real-time, and interactive production environments, including Huawei R&D and freelance multidisciplinary work.";
  }

  if (
    q.includes("tools") ||
    q.includes("software") ||
    q.includes("stack") ||
    q.includes("hangi arac") ||
    q.includes("hangi program")
  ) {
    return `${PROFILE_FACTS.tools} ${PROFILE_FACTS.realTime} ${PROFILE_FACTS.aiTools}`;
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
      max_output_tokens: 360
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
    const allowedOriginSuffixes = getAllowedOriginSuffixes(env);

    if (origin && !isAllowedOrigin(origin, allowedOriginSuffixes)) {
      return jsonResponse(403, { error: "Origin not allowed" }, origin, allowedOriginSuffixes);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowedOriginSuffixes) });
    }

    if (!isAskPath(url.pathname)) {
      return jsonResponse(404, { error: "Not found" }, origin, allowedOriginSuffixes);
    }

    if (request.method !== "POST") {
      return jsonResponse(405, { error: "Method not allowed" }, origin, allowedOriginSuffixes);
    }

    if (isRateLimited(ip)) {
      return jsonResponse(429, { error: "Too many requests" }, origin, allowedOriginSuffixes);
    }

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonResponse(500, { error: "Server is missing OpenAI API configuration." }, origin, allowedOriginSuffixes);
    }

    let query = "";
    try {
      const body = await request.json();
      query = String(body?.query || "").trim();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON body" }, origin, allowedOriginSuffixes);
    }

    if (!query) {
      return jsonResponse(400, { error: "Query is required" }, origin, allowedOriginSuffixes);
    }

    const model = String(env.OPENAI_MODEL || "gpt-5.4").trim();

    if (query === "__status_ping__") {
      try {
        const healthRes = await fetch(`https://api.openai.com/v1/models/${encodeURIComponent(model)}`, {
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
              : healthRes.status === 404
                ? "model_unavailable"
              : "upstream_unavailable";
          return jsonResponse(200, {
            answer: "",
            fallback: true,
            reason,
            upstream_status: healthRes.status
          }, origin, allowedOriginSuffixes);
        }
        return jsonResponse(200, { answer: "ok", fallback: false, reason: "" }, origin, allowedOriginSuffixes);
      } catch {
        return jsonResponse(200, {
          answer: "",
          fallback: true,
          reason: "upstream_unavailable"
        }, origin, allowedOriginSuffixes);
      }
    }
  const promptText = [
    "You are the portfolio assistant for fatihgulen.com.",
    "Default to English.",
    "Only answer in another language if the user explicitly asks for that language.",
    "Be concise but specific. Avoid generic marketing phrasing.",
    "The source facts below are grounding material. Use them to write a fresh answer in your own words.",
    "Use the bundled profile document as a primary source for questions about Fatih's background, experience, tools, strengths, contact details, and career focus.",
    "Use only the source facts below. If the user asks outside these facts, say it briefly and offer related portfolio topics.",
    "Do not invent personal details, project names, dates, or tools.",
    "If the user asks about projects in a category, mention the specific project names that appear in the source facts.",
    "Do not say a project category is missing if the source facts include project examples for it.",
    "When the user asks who Fatih is or asks for contact details, answer clearly and directly using the verified profile information.",
    "If the profile document contains the answer, do not say the information is unavailable, unspecified, or unknown.",
    "",
    "Source facts:",
    `- ${PROFILE_FACTS.identity}`,
    `- ${PROFILE_FACTS.experienceYears}`,
    `- ${PROFILE_FACTS.contact}`,
    `- ${PROFILE_FACTS.education}`,
    `- ${PROFILE_FACTS.profile}`,
    `- ${PROFILE_FACTS.focusAreas}`,
    `- ${PROFILE_FACTS.qualityLevel}`,
    `- ${PROFILE_FACTS.showcaseWork}`,
    `- ${PROFILE_FACTS.storytelling}`,
    `- ${PROFILE_FACTS.experience}`,
    `- ${PROFILE_FACTS.tools}`,
    `- ${PROFILE_FACTS.realTime}`,
    `- ${PROFILE_FACTS.prototyping}`,
    `- ${PROFILE_FACTS.vrProjects}`,
    `- ${PROFILE_FACTS.aiTools}`,
    `- ${PROFILE_FACTS.languages}`,
    `- ${PROFILE_FACTS.strengths}`,
    `- ${PROFILE_FACTS.industryAlignment}`,
    `- ${PROFILE_FACTS.careerFocus}`,
    "",
    "Profile document:",
    PROFILE_DOCUMENT
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
        }, origin, allowedOriginSuffixes);
      }

      const openaiJson = raw ? JSON.parse(raw) : {};
      const answer = readOpenAIText(openaiJson);
      if (!answer) {
        return jsonResponse(500, {
          answer: "I could not generate a reliable answer right now. Please try a different question."
        }, origin, allowedOriginSuffixes);
      }

      return jsonResponse(200, { answer }, origin, allowedOriginSuffixes);
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
      }, origin, allowedOriginSuffixes);
    }
  }
};
