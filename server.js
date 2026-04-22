const express = require('express');
const { execFile } = require('child_process');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

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
const IMAGES_ROOT = path.join(__dirname, 'images');
const LOCAL_SITE_HEALTH_DIR = path.join(__dirname, '.local', 'site-health');
const LOCAL_SITE_HEALTH_HTML = path.join(LOCAL_SITE_HEALTH_DIR, 'site-health.html');
const CATEGORY_ROUTE_PATHS = ['/architecture', '/uiux', '/ui-ux', '/ai', '/3d', '/vr-ar', '/vr'];
const WORKSPACE_SCAN_EXCLUDED_DIRS = new Set(['.git', '.local', '.vscode', '.claude', 'node_modules', 'uploads', 'private']);
const WORKSPACE_SCAN_EXCLUDED_FILES = new Set(['site-health-report.json', '.env']);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const ALLOWED_ORIGINS = new Set([
  'https://fatihgulen.com',
  'https://www.fatihgulen.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);
const LOCAL_ADMIN_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
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

app.disable('x-powered-by');
app.use(express.json({ limit: '50mb' }));

function isLoopbackHostname(hostname) {
  return LOOPBACK_HOSTNAMES.has(String(hostname || '').toLowerCase());
}

function isLoopbackAddress(address) {
  return LOOPBACK_ADDRESSES.has(String(address || '').toLowerCase());
}

function isLocalAdminOrigin(origin) {
  const raw = String(origin || '').trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    if (!/^https?:$/i.test(parsed.protocol)) return false;
    return LOCAL_ADMIN_ORIGINS.has(raw) || isLoopbackHostname(parsed.hostname);
  } catch {
    return false;
  }
}

function isSubpath(parentPath, childPath) {
  const relative = path.relative(parentPath, childPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function resolveSafePath(baseDir, requestedPath) {
  const raw = String(requestedPath || '').trim();
  if (!raw) return null;
  const resolved = path.resolve(baseDir, raw);
  return isSubpath(baseDir, resolved) ? resolved : null;
}

function normalizeImageRequestPath(value) {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^images\//i, '')
    .replace(/\/+$/, '')
    .trim();
}

function sanitizeUploadBasename(value, fallback = 'upload') {
  const baseName = path.parse(String(value || '')).name || fallback;
  const sanitized = baseName.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '');
  return sanitized || fallback;
}

function sanitizeUploadFilename(value, fallbackBase = 'upload') {
  const parsed = path.parse(String(value || ''));
  const ext = (parsed.ext || '').toLowerCase().replace(/[^.\w-]/g, '');
  const base = sanitizeUploadBasename(parsed.name || value, fallbackBase);
  return `${base}${ext}`;
}

function isLocalAdminRequest(req) {
  const remoteAddress = String(req.socket && req.socket.remoteAddress || '').trim();
  if (!isLoopbackAddress(remoteAddress)) return false;

  const origin = req.get('origin');
  if (origin) {
    return isLocalAdminOrigin(origin);
  }
  return true;
}

function applyLocalAdminCors(req, res) {
  const origin = req.get('origin');
  if (!isLocalAdminOrigin(origin)) return;
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Vary', 'Origin');
}

function enforceLocalAdminRequest(req, res) {
  if (isLocalAdminRequest(req)) return true;
  res.status(403).json({ error: 'Admin routes are available only on localhost.' });
  return false;
}

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(IMAGES_ROOT));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/Video', express.static(path.join(__dirname, 'Video')));
app.use('/site-health-assets', express.static(LOCAL_SITE_HEALTH_DIR));
app.get('/data/site.json', (_req, res) => {
  res.sendFile(DATA_PATH);
});
app.get('/data/ai_kb.json', (_req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'ai_kb.json'));
});
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/index.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/robots.txt', (_req, res) => {
  res.sendFile(path.join(__dirname, 'robots.txt'));
});
app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});
app.get(['/site-health', '/site-health.html'], (_req, res) => {
  if (!fs.existsSync(LOCAL_SITE_HEALTH_HTML)) {
    res.status(404).send('Site health dashboard is available only in the local workspace.');
    return;
  }
  res.sendFile(LOCAL_SITE_HEALTH_HTML);
});
app.get(CATEGORY_ROUTE_PATHS, (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function describeGitStatus(indexStatus, worktreeStatus) {
  if (indexStatus === '?' && worktreeStatus === '?') return 'untracked';
  if (indexStatus === 'R' || worktreeStatus === 'R') return 'renamed';
  if (indexStatus === 'A' || worktreeStatus === 'A') return 'added';
  if (indexStatus === 'D' || worktreeStatus === 'D') return 'deleted';
  if (indexStatus === 'U' || worktreeStatus === 'U') return 'conflict';
  if (indexStatus === 'M' || worktreeStatus === 'M') return 'modified';
  return 'changed';
}

function parseGitStatusLine(line) {
  const raw = String(line || '');
  if (raw.length < 3) return null;

  const indexStatus = raw[0];
  const worktreeStatus = raw[1];
  let filePath = raw.slice(3).trim();
  let previousPath = '';

  if (filePath.includes(' -> ')) {
    const parts = filePath.split(' -> ');
    previousPath = String(parts.shift() || '').trim();
    filePath = parts.join(' -> ').trim();
  }

  return {
    code: `${indexStatus}${worktreeStatus}`.trim() || `${indexStatus}${worktreeStatus}`,
    indexStatus,
    worktreeStatus,
    path: filePath.replace(/\\/g, '/'),
    previousPath: previousPath.replace(/\\/g, '/'),
    state: describeGitStatus(indexStatus, worktreeStatus)
  };
}

async function getLocalGitStatus() {
  try {
    const [{ stdout: branchStdout }, { stdout: statusStdout }] = await Promise.all([
      execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: __dirname }),
      execFileAsync('git', ['status', '--short', '--untracked-files=all'], { cwd: __dirname })
    ]);

    const files = String(statusStdout || '')
      .split(/\r?\n/)
      .map(parseGitStatusLine)
      .filter(Boolean);

    return {
      branch: String(branchStdout || '').trim() || 'main',
      files,
      mode: 'git-status',
      warning: ''
    };
  } catch (err) {
    const headPath = path.join(__dirname, '.git', 'HEAD');
    let branch = 'main';

    try {
      const headRef = fs.readFileSync(headPath, 'utf8').trim();
      if (headRef.startsWith('ref:')) {
        const refName = headRef.slice(4).trim();
        branch = refName.split('/').pop() || branch;
      } else if (headRef) {
        branch = 'detached';
      }
    } catch {}

    const files = [];
    const stack = [__dirname];

    while (stack.length) {
      const currentDir = stack.pop();
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name));

      for (const entry of entries) {
        const absolutePath = path.join(currentDir, entry.name);
        const relativePath = path.relative(__dirname, absolutePath).replace(/\\/g, '/');
        const segments = relativePath.split('/').filter(Boolean);
        const baseName = segments[segments.length - 1] || entry.name;

        if (segments.some((segment) => WORKSPACE_SCAN_EXCLUDED_DIRS.has(segment))) {
          continue;
        }
        if (entry.isFile() && WORKSPACE_SCAN_EXCLUDED_FILES.has(baseName)) {
          continue;
        }

        if (entry.isDirectory()) {
          stack.push(absolutePath);
          continue;
        }
        if (!entry.isFile()) {
          continue;
        }

        files.push({
          code: 'FS',
          indexStatus: 'F',
          worktreeStatus: 'S',
          path: relativePath,
          previousPath: '',
          state: 'workspace-file'
        });
      }
    }

    files.sort((a, b) => a.path.localeCompare(b.path));

    return {
      branch,
      files,
      mode: 'filesystem-fallback',
      warning: 'Git status could not be read from Node on this machine, so the dashboard is listing current workspace files instead.'
    };
  }
}

function isAllowedOrigin(req) {
  const origin = String(req.get('origin') || '').trim();
  if (!origin) return false;
  return ALLOWED_ORIGINS.has(origin);
}

async function getResumeSourceStatus() {
  const checks = await Promise.all(
    RESUME_SOURCES.map(async (src) => {
      try {
        await fsp.access(src.filePath);
        return { id: src.id, label: src.label, exists: true };
      } catch {
        return { id: src.id, label: src.label, exists: false };
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
    const categoryExamples = (data.categories || [])
      .map((category) => {
        const titles = (data.projects || [])
          .filter((project) => Array.isArray(project.categories) && project.categories.includes(category.id))
          .slice(0, 6)
          .map((project) => project.title);
        if (!titles.length) return null;
        return `${category.label} projects: ${titles.join('; ')}`;
      })
      .filter(Boolean)
      .join('\n');
    return [
      `Portfolio categories: ${categories}`,
      `Representative projects: ${projectTitles}`,
      `Common tools: ${tools}`,
      categoryExamples
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
    'Answer using only the provided portfolio context and attached private resume PDFs as source material.',
    'Write concise but slightly detailed answers in 3 to 5 sentences when possible.',
    'Write the final answer in your own words instead of copying the sources mechanically.',
    'Write as if speaking to another person about Fatih, using third-person phrasing like "Fatih" or "he".',
    'Do not use assistant-style closings such as "let me know", "if you want", "I can help", or "you can ask".',
    'End on a factual statement instead of an invitation.',
    'Do not invent personal details not present in those sources.',
    'If the portfolio context lists project examples for the requested category, mention those project names directly.',
    'Do not say a category has no listed projects when project names are present in the provided context.',
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
  if (!enforceLocalAdminRequest(req, res)) return;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Save site data ───
app.post('/api/data', (req, res) => {
  if (!enforceLocalAdminRequest(req, res)) return;
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Scan all image directories ───
app.get('/api/images/scan', (req, res) => {
  if (!enforceLocalAdminRequest(req, res)) return;
  try {
    const result = {};
    const cats = fs.readdirSync(IMAGES_ROOT, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const cat of cats) {
      const catPath = path.join(IMAGES_ROOT, cat.name);
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
  const tempFiles = new Set((req.files || []).map((file) => file.path));
  const cleanupTempFiles = () => {
    tempFiles.forEach((tempPath) => {
      try {
        fs.unlinkSync(tempPath);
      } catch {}
    });
  };

  try {
    if (!enforceLocalAdminRequest(req, res)) {
      cleanupTempFiles();
      return;
    }
    if (!Array.isArray(req.files) || req.files.length === 0) {
      cleanupTempFiles();
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const targetRelativeDir = normalizeImageRequestPath(req.body && req.body.targetDir);
    const targetDir = resolveSafePath(IMAGES_ROOT, targetRelativeDir);
    if (!targetDir || !targetRelativeDir) {
      cleanupTempFiles();
      return res.status(400).json({ error: 'Invalid targetDir. Uploads are limited to the images directory.' });
    }

    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const uploaded = [];
    const publicTargetDir = `images/${targetRelativeDir}`.replace(/\/+/g, '/');
    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${sanitizeUploadBasename(file.originalname)}.webp`;
      const dest = path.join(targetDir, name);

      if (['.mp4', '.gif'].includes(ext)) {
        // Copy video/gif files as-is
        const copyName = sanitizeUploadFilename(file.originalname);
        const copyDest = path.join(targetDir, copyName);
        fs.copyFileSync(file.path, copyDest);
        uploaded.push(`${publicTargetDir}/${copyName}`);
      } else {
        await sharp(file.path).webp({ quality: 80 }).toFile(dest);
        uploaded.push(`${publicTargetDir}/${name}`);
      }
      fs.unlinkSync(file.path);
      tempFiles.delete(file.path);
    }
    res.json({ success: true, files: uploaded });
  } catch (err) {
    cleanupTempFiles();
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Delete image ───
app.delete('/api/images', (req, res) => {
  if (!enforceLocalAdminRequest(req, res)) return;
  try {
    const requestedPath = normalizeImageRequestPath(req.body && req.body.path);
    const filePath = resolveSafePath(IMAGES_ROOT, requestedPath);
    if (!filePath || !requestedPath) {
      return res.status(400).json({ error: 'Invalid image path. Deletes are limited to the images directory.' });
    }

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

app.get('/api/ask/health', async (req, res) => {
  if (!enforceLocalAdminRequest(req, res)) return;
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

app.get('/site-health/git-status', async (req, res) => {
  applyLocalAdminCors(req, res);
  if (!enforceLocalAdminRequest(req, res)) return;

  try {
    const gitStatus = await getLocalGitStatus();
    res.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      ...gitStatus
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: 'git_status_failed',
      message: err && err.message ? err.message : 'Unable to read git status.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Portfolio server running at http://localhost:${PORT}`);
  console.log(`  Portfolio page at http://localhost:${PORT}/\n`);
});
