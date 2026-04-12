/**
 * Cloudflare Worker proxy for OpenAI Responses API.
 * Endpoint example: https://<worker>.<account>.workers.dev/api/ask
 * Secrets:
 * - OPENAI_API_KEY
 * Optional vars:
 * - OPENAI_MODEL (default: gpt-5.4)
 * - ALLOWED_ORIGIN_SUFFIXES (comma-separated, default: .fatihgulen-53.workers.dev)
 */

import profileMarkdown from "./profile.txt";
import projectMarkdown from "./project.txt";

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
const PROJECT_DOCUMENT = String(projectMarkdown || "").trim();
function pickOne(options) {
  if (!Array.isArray(options) || !options.length) return "";
  return options[Math.floor(Math.random() * options.length)];
}
function parseProjectEntryFields(body) {
  const fields = {};
  let currentKey = "";
  String(body || "").split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const match = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (match) {
      currentKey = String(match[1] || "").toLowerCase();
      fields[currentKey] = String(match[2] || "").trim();
      return;
    }
    if (!currentKey) return;
    const trimmed = line.trim();
    if (!trimmed) return;
    fields[currentKey] = fields[currentKey]
      ? `${fields[currentKey]} ${trimmed}`
      : trimmed;
  });
  return fields;
}

function parseProjectEntries(documentText) {
  const entries = [];
  const regex = /^##\s+(p\d+)\s+\|\s+(.+)\r?\n([\s\S]*?)(?=^##\s+p\d+\s+\||\Z)/gim;
  let match;
  while ((match = regex.exec(String(documentText || "")))) {
    const id = String(match[1] || "").toLowerCase().trim();
    const title = String(match[2] || "").trim();
    const body = String(match[3] || "").trim();
    const alias = title.split(" - ")[0].trim();
    entries.push({
      id,
      title,
      alias,
      body,
      fields: parseProjectEntryFields(body)
    });
  }
  return entries;
}

const PROJECT_ENTRIES = parseProjectEntries(PROJECT_DOCUMENT);

function scoreProjectEntry(query, entry) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery || !entry) return 0;
  const explicitIdRegex = new RegExp(`\\b${entry.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  if (explicitIdRegex.test(normalizedQuery)) return 1000;

  const titleVariants = [entry.title, entry.alias].filter(Boolean).map(normalizeQuery);
  let best = 0;
  titleVariants.forEach((variant) => {
    if (!variant) return;
    if (normalizedQuery.includes(variant)) {
      best = Math.max(best, 200);
      return;
    }
    const tokens = variant.split(" ").filter((token) => token.length > 2);
    const overlap = tokens.reduce((acc, token) => acc + (normalizedQuery.includes(token) ? 1 : 0), 0);
    best = Math.max(best, overlap * 18);
  });
  return best;
}

function findRelevantProjectEntry(query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery || !PROJECT_ENTRIES.length) return null;
  const explicitProjectIntent = /\b(project|case study|goal|problem|approach|result|impact|detail|details|summary|explain|breakdown)\b/i.test(normalizedQuery);
  let best = null;
  PROJECT_ENTRIES.forEach((entry) => {
    const score = scoreProjectEntry(normalizedQuery, entry);
    if (!best || score > best.score) best = { entry, score };
  });
  if (!best || best.score <= 0) return null;
  if (best.score >= 200) return best.entry;
  if (explicitProjectIntent && best.score >= 54) return best.entry;
  return null;
}

function formatProjectEntry(entry) {
  if (!entry) return "";
  return [
    `Project ID: ${entry.id}`,
    `Project Title: ${entry.title}`,
    entry.body
  ].filter(Boolean).join("\n");
}

function buildProjectDetailFallback(entry) {
  if (!entry) return "";
  const fields = entry.fields || {};
  const pieces = [];
  if (fields.current_portfolio_summary) pieces.push(fields.current_portfolio_summary);
  if (fields.goal) pieces.push(`Goal: ${fields.goal}`);
  if (fields.problem) pieces.push(`Problem: ${fields.problem}`);
  if (fields.approach) pieces.push(`Approach: ${fields.approach}`);
  if (fields.result) pieces.push(`Result: ${fields.result}`);
  if (fields.impact) pieces.push(`Impact: ${fields.impact}`);
  if (fields.notes) pieces.push(`Notes: ${fields.notes}`);
  if (!pieces.length) {
    return `Project details are available for ${entry.title}, but the detailed fields have not been filled in yet.`;
  }
  return `${entry.title}: ${pieces.join(" ")}`;
}
const PROFILE_FACTS = {
  identity:
    "Fatih G\u00fclen is a Digital Realtime Experience Designer based in Germany, in the Frankfurt area.",
  experienceYears:
    "Experience level: 4+ years of professional experience in game-adjacent, real-time, and interactive production environments.",
  contact:
    "Contact details: Email faatihgulen@gmail.com, phone +49 17637160838, LinkedIn https://www.linkedin.com/in/faatihgulen.",
  education:
    "Education: Bachelor's degree in Interior Architecture from Mimar Sinan Fine Arts University in Turkey, and a Master's degree in New Media Design from the University of Europe for Applied Sciences in Berlin, Germany.",
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
    "Work experience highlights: worked as a Realtime Experience Designer at Huawei R&D, created 2D and 3D assets for VR experiences, built UI elements and game scenes, and used Blender, Figma, and Jira in team workflows. Freelance work includes VR interior design, motion design, visual content, and client work across different design fields.",
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
    "Languages: English at a fluent level, Turkish native, and German at intermediate B1 level and improving.",
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

function normalizeAnswerTone(answer) {
  let text = String(answer || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (!text) return text;

  const directRewrites = [
    [/\bYou can contact Fatih Gulen at\b/gi, "Fatih Gulen can be contacted at"],
    [/\bYou can contact Fatih at\b/gi, "Fatih can be contacted at"],
    [/\bYou can reach Fatih at\b/gi, "Fatih can be reached at"],
    [/\bYou can also connect with him on LinkedIn at\b/gi, "He is also available on LinkedIn at"],
    [/\bYou can browse by category or ask in natural language to find work related to\b/gi, "The portfolio can be explored by category, with work related to"],
    [/\bIf you want to see AI plus design integration, the AI section is the most relevant category\.?/gi, "The AI section is the strongest match for AI plus design integration."],
    [/^Hi\.\s*I can help you explore this portfolio\.\s*/i, ""],
    [/^Hi\.\s*I can help you explore portfolio projects across /i, "The portfolio covers "],
    [/^I can help with portfolio topics like /i, "The portfolio covers topics such as "],
    [/\bYou can ask about\b/gi, "Relevant areas here include"],
    [/\bYou can ask for\b/gi, "Relevant areas here include"]
  ];

  directRewrites.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });

  const assistantStyleSentence = [
    /^(?:if you(?:'d| would)? like|if you want|if needed|let me know|feel free to ask|just ask)\b/i,
    /^(?:i can also|i can help|i can walk through|i can break down|i can show|i can share)\b/i,
    /^(?:istersen|dilersen|yardimci olabilirim|yardımcı olabilirim)\b/i
  ];

  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("-")) return trimmed;

      const sentences = trimmed.match(/[^.!?]+[.!?]?/g) || [trimmed];
      const kept = sentences
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .filter((sentence) => !assistantStyleSentence.some((pattern) => pattern.test(sentence)));

      return kept.join(" ").trim();
    })
    .filter(Boolean);

  return paragraphs
    .join("\n\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

function isToolsQuery(query) {
  const q = normalizeQuery(query);
  return (
    q.includes("what tools") ||
    q.includes("tools") ||
    q.includes("software") ||
    q.includes("tool stack") ||
    q.includes("stack") ||
    q.includes("technologies") ||
    q.includes("design tools")
  );
}

function buildFallbackAnswer(query) {
  const q = normalizeQuery(query);
  const projectEntry = findRelevantProjectEntry(query);

  if (projectEntry) {
    return buildProjectDetailFallback(projectEntry);
  }

  if (
    q.includes("contact") ||
    q.includes("contact details") ||
    q.includes("email") ||
    q.includes("mail") ||
    q.includes("linkedin") ||
    q.includes("phone") ||
    q.includes("reach")
  ) {
    return pickOne([
      "You can reach Fatih at faatihgulen@gmail.com or +49 17637160838. You can also connect with him on LinkedIn at https://www.linkedin.com/in/faatihgulen.",
      "Fatih's contact details are faatihgulen@gmail.com, +49 17637160838, and https://www.linkedin.com/in/faatihgulen on LinkedIn.",
      "The best ways to contact Fatih are email at faatihgulen@gmail.com, phone at +49 17637160838, or LinkedIn at https://www.linkedin.com/in/faatihgulen."
    ]);
  }

  if (
    q.includes("who is fatih") ||
    q.includes("about fatih") ||
    q.includes("tell me about fatih") ||
    q.includes("fatih profile") ||
    q === "fatih"
  ) {
    return pickOne([
      "Fatih Gulen is a Digital Realtime Experience Designer based in the Frankfurt area of Germany, with a hybrid background spanning UI/UX design, real-time interaction, 3D visualization, motion design, and AI-assisted creative production.",
      "Fatih Gulen works at the intersection of design, technology, and interactive systems. His profile brings together UI/UX, real-time experiences, 3D visualization, motion, and AI-assisted workflows.",
      "Fatih Gulen is a multidisciplinary designer focused on clear, functional, and visually strong digital experiences, especially across interactive systems, immersive environments, and real-time design."
    ]);
  }

  if (
    q.includes("location") ||
    q.includes("where is fatih based") ||
    q.includes("based in") ||
    q.includes("frankfurt")
  ) {
    return "Fatih is based in the Frankfurt area of Germany.";
  }

  if (
    q.includes("which university") ||
    q.includes("what university") ||
    q.includes("education") ||
    q.includes("degree") ||
    q.includes("hangi universite") ||
    q.includes("hangi okul")
  ) {
    return "Fatih holds a Bachelor's degree in Interior Architecture from Mimar Sinan Fine Arts University in Turkey, and a Master's degree in New Media Design from the University of Europe for Applied Sciences in Berlin.";
  }

  if (
    q.includes("strength") ||
    q.includes("strengths") ||
    q.includes("soft skills") ||
    q.includes("teamwork") ||
    q.includes("collaboration")
  ) {
    return "Fatih excels at strong team coordination and collaboration, translating complex ideas into clear visuals, learning new tools quickly, and combining design, technology, and storytelling. He's known for being punctual and reliable, with a confident approach to emerging technologies like AI integrated with real-time workflows.";
  }

  if (
    q.includes("looking for") ||
    q.includes("open to work") ||
    q.includes("career focus") ||
    q.includes("what roles") ||
    q.includes("job") ||
    q.includes("seeking roles")
  ) {
    return "Fatih is actively seeking roles in UI/UX design, product design, real-time or interactive design, and AI-driven creative work. He has strong interest in automotive UI and HMI, data-driven interfaces, AI-design integration, and digital product experiences.";
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
    return "Fatih's portfolio includes broad range of project such as; Huawei VR - Squash (a Unity-based VR training with spatial UI and gesture tracking), Huawei VR - Unity Environments (spatial interaction design and immersive scenes), Gaze Garden (an AR TikTok effect project), and the AI Thesis research project combining AI and interactive experiences with Unity and OpenAI.";
  }

  if (
    q.includes("ui experience") ||
    q.includes("ux experience") ||
    q.includes("game ui experience") ||
    q.includes("interface experience") ||
    q.includes("interactive design") ||
    q.includes("real time")
  ) {
    return "Fatih has deep expertise in UI/UX and interactive design, creating clear, functional, and visually strong digital experiences. His real-time work spans interactive systems, data-driven interfaces, and immersive environments, with a focus on both usability and high-quality visual execution meeting AAA-style production standards.";
  }

  if (
    q.includes("experience") ||
    q.includes("work history") ||
    q.includes("career") ||
    q.includes("huawei") ||
    q.includes("freelance") ||
    q.includes("game designer")
  ) {
    return pickOne([
      "Fatih worked as a Realtime Experience Designer at Huawei R&D, creating 2D and 3D assets for VR experiences, building UI elements and game scenes, and working with Blender, Figma, and Jira in collaborative workflows.",
      "His professional background includes Huawei R&D, where he worked as a Realtime Experience Designer on VR-focused production, along with freelance work across VR interior design, motion design, visual content, and interactive presentations.",
      "Fatih's experience combines real-time design work at Huawei R&D with freelance multidisciplinary projects. That includes immersive environments, visual storytelling, client-facing production, and interactive presentation work."
    ]);
  }

  if (
    q.includes("years of experience") ||
    q.includes("how many years") ||
    q.includes("experience years")
  ) {
    return pickOne([
      "Fatih has 4+ years of professional experience, especially across game-adjacent, real-time, and interactive production environments, including Huawei R&D and freelance multidisciplinary work.",
      "The verified profile points to 4+ years of professional experience across real-time design, immersive production, and interactive digital work.",
      "Fatih brings 4+ years of professional experience, with a background that combines Huawei R&D work and independent projects across real-time, VR, motion, and interactive design."
    ]);
  }

  if (
    q.includes("tools") ||
    q.includes("software") ||
    q.includes("stack") ||
    q.includes("hangi arac") ||
    q.includes("hangi program")
  ) {
    return pickOne([
      "Fatih's tools are easiest to read by category:\n- UI / Design: Figma, Adobe Creative Suite\n- 3D: Blender, Maya, 3ds Max, Substance\n- Real-time: Unreal Engine with Blueprints and UMG, Unity (basic)\n- AI: ComfyUI, Midjourney, Flux, Ideogram, Sora, VEO, Wan AI",
      "A clean breakdown would be:\n- UI / UX: Figma, Adobe tools\n- 3D: Blender, Maya, 3ds Max, Substance\n- Interactive: Unreal Engine, Blueprints, UMG, Unity (basic)\n- AI workflows: ComfyUI, ControlNet, OpenPose, LoRA, Midjourney, Flux, Ideogram",
      "The core stack is:\n- Design: Figma, Photoshop, Illustrator, After Effects, Premiere\n- 3D: Blender, Maya, 3ds Max, Substance\n- Real-time: Unreal Engine and Unity\n- AI: ComfyUI-based pipelines plus Midjourney, Flux, Ideogram, and image-to-video tools"
    ]);
  }

  if (
    q.includes("language") ||
    q.includes("languages") ||
    q.includes("dil") ||
    q.includes("english") ||
    q.includes("german") ||
    q.includes("turkish")
  ) {
    return "Fatih is fluent in English, speaks Turkish as a native speaker, and has intermediate German at B1 level, which he continues to improve.";
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
      temperature: 0.9,
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
    const relevantProjectEntry = findRelevantProjectEntry(query);
    const toolsQuestion = isToolsQuery(query);

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
    "",
    "=== PRIMARY SOURCE: PROFILE DOCUMENT ===",
    "Below is Fatih's comprehensive profile document. This is your CANONICAL and PRIMARY source.",
    "Use the profile document as the foundation for all answers about Fatih.",
    "If there is any difference between the profile document and supplementary facts, the profile document always wins.",
    "Prefer the profile document for titles, years of experience, education, work history, strengths, career goals, and wording.",
    "Study the voice, context, style, and details carefully.",
    "",
    "PROFILE DOCUMENT:",
    PROFILE_DOCUMENT,
    ...(relevantProjectEntry ? [
      "",
      "=== PROJECT-SPECIFIC SOURCE ===",
      "The following project entry is the canonical source for this specific project.",
      "For project goals, problems, approach, results, impact, or case-study style details, prefer this project entry over all supplementary facts.",
      "",
      "PROJECT ENTRY:",
      formatProjectEntry(relevantProjectEntry)
    ] : []),
    "",
    "=== SUPPLEMENTARY FACTS (for quick reference) ===",
    "These key facts reinforce and supplement the profile document above.",
    "They are secondary helpers only and must never override the profile document.",
    `- Identity & Location: ${PROFILE_FACTS.identity}`,
    `- Experience: ${PROFILE_FACTS.experienceYears}`,
    `- Contact: ${PROFILE_FACTS.contact}`,
    `- Education: ${PROFILE_FACTS.education}`,
    `- Professional Background: ${PROFILE_FACTS.profile}`,
    `- Focus & Approach: ${PROFILE_FACTS.focusAreas}`,
    `- Quality & Standards: ${PROFILE_FACTS.qualityLevel}`,
    `- Work Scope: ${PROFILE_FACTS.showcaseWork}`,
    `- Storytelling Strength: ${PROFILE_FACTS.storytelling}`,
    `- Work History: ${PROFILE_FACTS.experience}`,
    `- Design Tools: ${PROFILE_FACTS.tools}`,
    `- Real-Time Tools: ${PROFILE_FACTS.realTime}`,
    `- Interactive Skills: ${PROFILE_FACTS.prototyping}`,
    `- VR/AR Projects: ${PROFILE_FACTS.vrProjects}`,
    `- AI Expertise: ${PROFILE_FACTS.aiTools}`,
    `- Languages: ${PROFILE_FACTS.languages}`,
    `- Strengths & Soft Skills: ${PROFILE_FACTS.strengths}`,
    `- Industry Positioning: ${PROFILE_FACTS.industryAlignment}`,
    `- Career Goals: ${PROFILE_FACTS.careerFocus}`,
    "",
    "=== RESPONSE QUALITY RULES ===",
    "- Draw from the profile document's comprehensive narrative as your main reference.",
    "- Be concise but specific. Avoid generic marketing phrasing and template-like responses.",
    "- Vary your narrative perspective: sometimes lead with technical skills, sometimes with creative strengths, sometimes with project examples, sometimes with career intent.",
    "- Use multiple angles to present the same information differently each time.",
    "- Weave facts together naturally instead of listing them. Connect ideas across the profile seamlessly.",
    "- Avoid repeating exact phrases across multiple responses. Rephrase and recombine source material creatively.",
    "- Maintain the profile document's tone and conversational style in your answers.",
    "- Write as if speaking to another person about Fatih, not as a chat assistant speaking directly to the user.",
    "- Prefer third-person phrasing with 'Fatih' or 'he' instead of 'I' or direct offers to the user.",
    "- Never end with assistant-style invitations such as 'let me know', 'if you want', 'I can help', 'I can also', or 'you can ask'.",
    "- End on a factual statement, not on a prompt for the next question.",
    "",
    "=== ANSWERING GUIDELINES ===",
    "- If the user asks about tools, don't always list them; sometimes explain what they're *used for*, sometimes discuss philosophy, sometimes connect them to specific projects.",
    ...(toolsQuestion ? [
      "- This is a tools question. Make the answer clean and organized.",
      "- Prefer a short grouped format with labels such as UI / Design, 3D, Real-time, and AI.",
      "- Write the tools answer as bullet points, one group per bullet.",
      "- Keep it compact and scannable instead of one long paragraph.",
      "- Mention only the most relevant tools in each group."
    ] : []),
    "- If asked about strengths, sometimes frame as 'what he brings to teams', sometimes as 'how he approaches design', sometimes as 'technical execution ability'.",
    "- If asked about projects, vary between describing scope, describing methodology, describing visual quality, describing user impact.",
    "- When discussing Huawei experience, sometimes emphasize the game-adjacent aspect, sometimes the VR focus, sometimes the team collaboration.",
    "- When discussing AI tools, sometimes focus on technical workflow, sometimes on creative potential, sometimes on integration with real-time systems.",
    "- Only answer using information from the profile document and facts above. If the user asks outside these sources, offer related portfolio topics instead.",
    "- Do not invent personal details, project names, dates, or tools not listed in sources.",
    "- If the profile document contains the answer, provide it directly and confidently—never say information is 'unavailable' or 'not specified'.",
    "- When the answer exists in the profile document, do not hedge and do not ask the user to verify it elsewhere.",
    "- For project-specific questions, if a matching project entry is included above, use that entry as the canonical source for the project.",
    "- If the user asks for goal, problem, approach, result, impact, or case-study insight, structure the answer around those dimensions when the project entry provides them.",
    "",
    `User query: ${query}`
  ].join("\n");

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
          answer: normalizeAnswerTone(buildFallbackAnswer(query)),
          fallback: true,
          reason,
          upstream_status: openaiRes.status
        }, origin, allowedOriginSuffixes);
      }

      const openaiJson = raw ? JSON.parse(raw) : {};
      const answer = normalizeAnswerTone(readOpenAIText(openaiJson));
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
        answer: normalizeAnswerTone(buildFallbackAnswer(query)),
        fallback: true,
        reason: "upstream_unavailable"
      }, origin, allowedOriginSuffixes);
    }
  }
};
