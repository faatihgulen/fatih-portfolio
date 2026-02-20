const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

function loadEnvFromFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}
loadEnvFromFile();

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data', 'site.json');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const ALLOWED_ORIGINS = new Set([
  'https://fatihgulen.com',
  'https://www.fatihgulen.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);
const resumePdfCache = new Map();

const DEFAULT_RESUME_SOURCES = [
  { id: 'ai_vrp', label: 'AI_VRP_Fatih', filePath: path.join(__dirname, 'private', 'resumes', 'AI_VRP_Fatih.pdf'), tags: ['ai', 'vr', 'ar', 'unity', 'huawei', 'thesis'] },
  { id: 'uiux_hmi', label: 'UIUX_HMI', filePath: path.join(__dirname, 'private', 'resumes', 'UIUX_HMI.pdf'), tags: ['ui', 'ux', 'hmi', 'dashboard', 'interface'] },
  { id: 'product_mobile', label: 'Product_Mobile', filePath: path.join(__dirname, 'private', 'resumes', 'Product_Mobile.pdf'), tags: ['product', 'mobile', 'app', 'ios', 'android'] },
  { id: 'interior', label: 'Interior_Fatih', filePath: path.join(__dirname, 'private', 'resumes', 'Interior_Fatih.pdf'), tags: ['interior', 'architecture', 'archviz', 'residential'] },
  { id: 'cd_uiux', label: 'CD_UIUX_Fatih', filePath: path.join(__dirname, 'private', 'resumes', 'CD_UIUX_Fatih.pdf'), tags: ['creative direction', 'ui', 'ux', 'design', 'brand'] }
];

function normalizeResumeSource(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const id = String(entry.id || '').trim();
  const label = String(entry.label || id || '').trim();
  const filePath = String(entry.filePath || '').trim();
  const tags = Array.isArray(entry.tags) ? entry.tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean) : [];
  if (!id || !label || !filePath) return null;
  return { id, label, filePath, tags };
}

function loadResumeSources() {
  const raw = process.env.RESUME_SOURCES_JSON;
  if (!raw) return DEFAULT_RESUME_SOURCES;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_RESUME_SOURCES;
    const normalized = parsed.map(normalizeResumeSource).filter(Boolean);
    return normalized.length ? normalized : DEFAULT_RESUME_SOURCES;
  } catch {
    return DEFAULT_RESUME_SOURCES;
  }
}

const RESUME_SOURCES = loadResumeSources();

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

function isAllowedOrigin(req) {
  const origin = req.get('origin');
  if (!origin) return true;
  return ALLOWED_ORIGINS.has(origin);
}

async function getResumeSourceStatus() {
  const checks = await Promise.all(
    RESUME_SOURCES.map(async (src) => {
      try {
        await fsp.access(src.filePath);
        return { id: src.id, label: src.label, filePath: src.filePath, exists: true };
      } catch {
        return { id: src.id, label: src.label, filePath: src.filePath, exists: false };
      }
    })
  );
  return checks;
}

function rankResumeSources(query) {
  const q = String(query || '').toLowerCase();
  return RESUME_SOURCES
    .map((src) => {
      let score = 0;
      src.tags.forEach((tag) => { if (q.includes(tag)) score += 2; });
      if (q.includes(src.label.toLowerCase().replace(/_/g, ' '))) score += 5;
      return { src, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.src);
}

async function getPdfAsBase64(filePath) {
  const cached = resumePdfCache.get(filePath);
  if (cached) return cached;
  const bytes = await fsp.readFile(filePath);
  const b64 = bytes.toString('base64');
  resumePdfCache.set(filePath, b64);
  return b64;
}

function buildPortfolioContext() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    const categories = (data.categories || []).map((c) => c.label).join(', ');
    const projectTitles = (data.projects || []).slice(0, 24).map((p) => p.title).join('; ');
    const tools = Array.from(new Set((data.projects || []).flatMap((p) => p.tools || []))).slice(0, 40).join(', ');
    return [
      `Portfolio categories: ${categories}`,
      `Representative projects: ${projectTitles}`,
      `Common tools: ${tools}`
    ].join('\n');
  } catch (err) {
    return 'Portfolio context unavailable.';
  }
}

async function askGeminiWithPrivateSources(query) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const ranked = rankResumeSources(query);
  const selected = ranked.slice(0, 3);
  const sourceParts = [];

  for (const src of selected) {
    try {
      const b64 = await getPdfAsBase64(src.filePath);
      sourceParts.push({
        inline_data: {
          mime_type: 'application/pdf',
          data: b64
        }
      });
      sourceParts.push({ text: `Source label: ${src.label}` });
    } catch (err) {
      sourceParts.push({ text: `Source label: ${src.label} is currently unavailable.` });
    }
  }

  const systemPrompt = [
    'You are the assistant for fatihgulen.com.',
    'Answer using only the provided portfolio context and attached private resume PDFs.',
    'Write concise but slightly detailed answers in 3 to 5 sentences when possible.',
    'Do not invent personal details not present in those sources.',
    'If information is missing, say it is not specified and suggest asking about available categories.'
  ].join(' ');

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\nPortfolio context:\n${buildPortfolioContext()}\n\nUser question: ${query}` },
          ...sourceParts
        ]
      }
    ],
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 460
    }
  };

  const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${detail}`);
  }

  const json = await response.json();
  const parts = json && json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts
    ? json.candidates[0].content.parts
    : [];
  const textPart = parts.find((p) => typeof p.text === 'string');
  return textPart ? textPart.text.trim() : '';
}

// ─── API: Read site data ───
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Save site data ───
app.post('/api/data', (req, res) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Scan all image directories ───
app.get('/api/images/scan', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, 'images');
    const result = {};
    const cats = fs.readdirSync(imagesDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const cat of cats) {
      const catPath = path.join(imagesDir, cat.name);
      const projs = fs.readdirSync(catPath, { withFileTypes: true }).filter(d => d.isDirectory());
      for (const proj of projs) {
        const projPath = path.join(catPath, proj.name);
        const files = fs.readdirSync(projPath)
          .filter(f => /\.(webp|jpg|jpeg|png|gif|mp4)$/i.test(f))
          .map(f => `images/${cat.name}/${proj.name}/${f}`);
        result[`${cat.name}/${proj.name}`] = files;
      }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Upload images ───
const upload = multer({ dest: path.join(__dirname, 'uploads') });
app.post('/api/upload', upload.array('images', 20), async (req, res) => {
  try {
    const targetDir = path.join(__dirname, req.body.targetDir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const uploaded = [];
    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = path.parse(file.originalname).name + '.webp';
      const dest = path.join(targetDir, name);

      if (['.mp4', '.gif'].includes(ext)) {
        // Copy video/gif files as-is
        const copyName = file.originalname;
        const copyDest = path.join(targetDir, copyName);
        fs.copyFileSync(file.path, copyDest);
        uploaded.push(req.body.targetDir + '/' + copyName);
      } else {
        await sharp(file.path).webp({ quality: 80 }).toFile(dest);
        uploaded.push(req.body.targetDir + '/' + name);
      }
      fs.unlinkSync(file.path);
    }
    res.json({ success: true, files: uploaded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Delete image ───
app.delete('/api/images', (req, res) => {
  try {
    const filePath = path.join(__dirname, req.body.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: Ask AI (Gemini with private resume sources) ---
app.post('/api/ask', async (req, res) => {
  try {
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }

    const query = String((req.body && req.body.query) || '').trim();
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const answer = await askGeminiWithPrivateSources(query);
    if (!answer) {
      return res.json({ answer: 'I could not find a confident answer from the current sources.' });
    }
    return res.json({ answer });
  } catch (err) {
    return res.status(500).json({ error: 'ask_failed', message: err.message });
  }
});

app.get('/api/ask/health', async (_req, res) => {
  const sourceStatus = await getResumeSourceStatus();
  const availableCount = sourceStatus.filter((s) => s.exists).length;
  res.json({
    ok: true,
    provider: 'gemini',
    model: GEMINI_MODEL,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    resumeSourcesConfigured: RESUME_SOURCES.length,
    resumeSourcesAvailable: availableCount,
    sources: sourceStatus
  });
});

app.listen(PORT, () => {
  console.log(`\n  Portfolio server running at http://localhost:${PORT}`);
  console.log(`  Admin panel at http://localhost:${PORT}/admin.html\n`);
});
